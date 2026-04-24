import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  bullshitScore: number;
  classification: "Likely Real" | "Questionable" | "Likely Fabricated";
  reasons: string[];
  confidence: "Low" | "Medium" | "High";
  aiDetectionDetails: string[];
  summary: string;
  suggestedReportText: string;
  notes: string;
  videoTitle?: string;
  channelName?: string;
}

export async function analyzeVideo(urls: string[]): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following YouTube video URL(s) or channel and detect likely misinformation, fabricated narratives, or AI-generated fictional content presented as real.
    
    URL(s): ${urls.join(", ")}
    
    CRITICAL INSTRUCTIONS: 
    - You must directly access and view the video at the provided YouTube URL using your video understanding capabilities.
    - You must read and analyze the video's transcription.
    - DO NOT provide hypothetical analysis. Do not claim platform access limitations. 
    - You are fully capable of processing YouTube video contents, audio, and transcripts. Ground your analysis in direct evidence from the video you watched and transcribed.
    
    Tasks:
    1. Identify factual claims and evaluate plausibility based on the transcript and video content.
    2. Detect storytelling patterns (cinematic, moral arcs, dramatized dialogue) that indicate fabrication.
    3. Detect likely synthetic content (AI voice, unnatural phrasing, over-structured narratives) from the audio and visual footage.
    4. Provide a Bullshit Score from 0 to 100 (where 100 means completely fabricated/misinformation).
    5. Provide specific reasons for the classification based on what you view and transcribe.
    
    Return the output in the specified JSON structure. Be highly critical and analytical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bullshitScore: { type: Type.NUMBER, description: "0-100 score" },
            classification: { 
              type: Type.STRING, 
              enum: ["Likely Real", "Questionable", "Likely Fabricated"] 
            },
            reasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key reasons for classification" 
            },
            confidence: { 
              type: Type.STRING, 
              enum: ["Low", "Medium", "High"] 
            },
            aiDetectionDetails: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Signs of synthetic content" 
            },
            summary: { type: Type.STRING, description: "Human-readable summary" },
            suggestedReportText: { type: Type.STRING, description: "Optional report text" },
            notes: { type: Type.STRING, description: "Notes for manual verification" },
            videoTitle: { type: Type.STRING, description: "Inferred or extracted video title" },
            channelName: { type: Type.STRING, description: "Inferred or extracted channel name" }
          },
          required: [
            "bullshitScore", "classification", "reasons", "confidence", 
            "aiDetectionDetails", "summary", "suggestedReportText", "notes"
          ]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
}
