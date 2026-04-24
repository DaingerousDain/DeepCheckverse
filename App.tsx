import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ShieldCheck, ShieldAlert, FileWarning, Youtube, AlertTriangle, Plus, X, Check } from 'lucide-react';
import { analyzeVideo, AnalysisResult } from './services/geminiService';
import ScoreMeter from './components/ScoreMeter';

export default function App() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    if (newUrls.length === 0) newUrls.push('');
    setUrls(newUrls);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleCopyReport = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.suggestedReportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyNote = () => {
    if (!result) return;
    const noteText = `Context: This video contains highly likely fabricated or synthetic content (AI Confidence: ${result.confidence}).\n\nKey reasons:\n${result.reasons.map(r => `- ${r}`).join('\n')}\n\nAutomated Assessment: ${result.classification} (${result.bullshitScore}/100)`;
    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.filter(u => u.trim() !== '');
    if (validUrls.length === 0) {
      setError('Please enter at least one URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await analyzeVideo(validUrls);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the content. Ensure your API key is valid and you have network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0c0d0f] text-[#f0f1f3] font-sans p-4 md:p-6 w-full min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6 shrink-0 max-w-[1200px] w-full mx-auto">
        <div className="text-[20px] font-bold tracking-[-0.5px] uppercase flex items-center gap-2">
          DEEP<span className="text-[#ff9f43]">CHECK</span>VERSE
        </div>
        <div className="w-[100px] text-right text-[12px] opacity-50 font-mono">System: v2.4.1</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow w-full max-w-[1200px] mx-auto auto-rows-[minmax(160px,auto)] pb-12">

        {/* Form Target Header Card */}
        <div className={`bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col relative ${result ? 'md:col-span-3 md:row-span-1' : 'col-span-1 md:col-span-4 h-full min-h-[300px] justify-center items-center'}`}>
          <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-[12px] font-bold w-full text-left">Analysis Target</div>
          
          <div className={`flex ${result ? 'flex-col sm:flex-row gap-6 items-center flex-grow' : 'flex-col gap-4 w-full max-w-2xl mt-4'} w-full`}>
            {result && (result.videoTitle || result.channelName) && (
              <div className="flex flex-col justify-center sm:max-w-[40%] sm:min-w-[200px] border-b sm:border-b-0 sm:border-r border-[#2c2e35] pb-4 sm:pb-0 sm:pr-6 w-full text-left">
                <h2 className="text-[16px] xl:text-[18px] mb-1 font-semibold text-[#f0f1f3] line-clamp-2" title={result.videoTitle || 'Target Resource'}>{result.videoTitle || 'Target Resource'}</h2>
                <div className="text-[13px] text-[#8e9299] truncate">
                  {result.channelName ? `Source: ${result.channelName}` : 'Source inferred'} 
                </div>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="flex flex-col gap-3 flex-grow w-full justify-center">
               {urls.map((url, index) => (
                 <div key={index} className="flex items-center gap-2">
                   <input
                     type="url"
                     value={url}
                     onChange={(e) => handleUrlChange(index, e.target.value)}
                     placeholder="https://youtube.com/watch?v=..."
                     className="flex-grow w-full bg-[#16181d] border border-[#2c2e35] py-[10px] px-[16px] rounded-[8px] text-[14px] text-[#f0f1f3] placeholder-[#8e9299] focus:outline-none focus:border-[#ff9f43]"
                     required={index === 0}
                   />
                   {urls.length > 1 && (
                     <button type="button" onClick={() => handleRemoveUrl(index)} className="text-[#8e9299] hover:text-[#ff4d4d] shrink-0">
                       <X className="w-4 h-4" />
                     </button>
                   )}
                 </div>
               ))}
               <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="text-[12px] text-[#8e9299] flex items-center gap-1 hover:text-[#f0f1f3]"
                  >
                    <Plus className="w-3 h-3" /> Add target
                  </button>
                  
                  <button type="submit" disabled={isLoading} className="py-[8px] px-5 bg-[#f0f1f3] text-[#0c0d0f] rounded-[8px] font-bold text-[12px] disabled:opacity-50 flex items-center gap-2 shrink-0">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                  </button>
               </div>
               {error && <div className="text-[12px] text-[#ff4d4d] bg-[#ff4d4d]/10 px-3 py-2 rounded-lg">{error}</div>}
            </form>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && !result && (
           <div className="col-span-1 md:col-span-4 h-full min-h-[400px] flex flex-col items-center justify-center space-y-6 border border-[#2c2e35] rounded-[16px] bg-[#16181d]/50 backdrop-blur-sm">
             <div className="w-12 h-12 border-4 border-[#2c2e35] rounded-full border-t-[#ff9f43] animate-spin"></div>
             <p className="font-mono text-[12px] text-[#ff9f43] animate-pulse">ANALYZING SIGNAL...</p>
           </div>
        )}

        {/* RESULTS BENTO GRID */}
        {result && (
          <>
            {/* Score Card */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col items-center justify-center text-center md:col-span-1 md:row-span-2 relative">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-3 font-bold absolute top-5 left-5 w-auto">Bullshit Score</div>
               <div className="mt-8">
                 <ScoreMeter score={result.bullshitScore} />
               </div>
               
               <div className={`inline-block px-[12px] py-[4px] rounded-[100px] text-[12px] font-semibold mt-[10px] ${
                  result.classification === 'Likely Real' ? 'bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]' :
                  result.classification === 'Questionable' ? 'bg-[#ff9f43]/10 text-[#ff9f43] border border-[#ff9f43]' :
                  'bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]'
               }`}>
                  {result.classification === 'Likely Real' ? 'LIKELY REAL' : result.classification === 'Questionable' ? 'QUESTIONABLE' : 'LIKELY FABRICATED'}
               </div>
               <div className="text-[11px] mt-[15px] text-[#8e9299]">Confidence: {result.confidence}</div>
            </div>

            {/* AI Detector */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col md:col-span-1 md:row-span-1 overflow-auto">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-3 font-bold shrink-0">Synthetic Detection</div>
               <ul className="flex flex-col flex-grow justify-center gap-[12px]">
                  {result.aiDetectionDetails.slice(0, 2).map((detail, i) => (
                    <li key={i}>
                      <div className="text-[13px] mb-1 text-[#f0f1f3] line-clamp-1 truncate" title={detail}>{detail}</div>
                      <div className="h-[8px] bg-[#222] rounded-[4px] overflow-hidden">
                         <div className="h-full bg-[#ff9f43]" style={{ width: i === 0 ? '92%' : '65%' }}></div>
                      </div>
                    </li>
                  ))}
                  {result.aiDetectionDetails.length === 0 && (
                     <div className="text-[12px] text-[#8e9299] italic">No synthetic artifacts identified.</div>
                  )}
               </ul>
            </div>

            {/* Summary Card */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col md:col-span-2 md:row-span-1 overflow-auto">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-3 font-bold shrink-0">Expert Summary</div>
               <p className="text-[14px] leading-[1.5] text-[#8e9299] flex-grow flex items-center">
                 {result.summary}
               </p>
            </div>

            {/* Patterns / Analyst Notes */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col md:col-span-1 md:row-span-2 overflow-auto">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-[15px] font-bold shrink-0">Cross-Channel Patterns</div>
               <div className="text-[12px] mb-[15px] text-[#f0f1f3]">{result.notes}</div>
               <div className="mb-[10px] mt-auto">
                  <span className="inline-block text-[10px] py-[2px] px-[6px] bg-[#2c2e35] rounded-[4px] mr-1 text-[#f0f1f3]">Content Template</span>
                  <span className="inline-block text-[10px] py-[2px] px-[6px] bg-[#2c2e35] rounded-[4px] mr-1 text-[#f0f1f3]">AI Scripting</span>
               </div>
               <div className="text-[12px] text-[#8e9299]">Analyzed via heuristics</div>
            </div>

            {/* Analysis Breakdown */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col md:col-span-2 md:row-span-2 overflow-auto">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-[12px] font-bold shrink-0">Claim & Fact Analysis</div>
               <ul className="list-none flex flex-col h-full overflow-y-auto pr-2 gap-4">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-[10px] border-b border-[#2c2e35] last:border-b-0 gap-3">
                      <span className="text-[14px] text-[#f0f1f3] leading-snug">{reason}</span>
                      <span className="inline-block px-[12px] py-[4px] rounded-[100px] text-[12px] font-semibold bg-[#ff9f43]/10 text-[#ff9f43] whitespace-nowrap shrink-0">Evaluated</span>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Actions / Report Card */}
            <div className="bg-[#16181d] border border-[#2c2e35] rounded-[16px] p-5 flex flex-col md:col-span-1 md:row-span-2 overflow-auto">
               <div className="text-[11px] uppercase tracking-[1px] text-[#8e9299] mb-[12px] font-bold shrink-0">Actions</div>
               <div className="flex flex-col gap-2 h-full justify-between">
                  {result.suggestedReportText && (
                    <div className="flex-grow p-[10px] rounded-[8px] border border-[#2c2e35] bg-transparent text-[12px] text-[#8e9299] overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[160px]">
                       {result.suggestedReportText}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 shrink-0 mt-3">
                    <button onClick={handleCopyReport} className="p-[10px] rounded-[8px] border border-[#2c2e35] bg-[#f0f1f3] text-[#0c0d0f] font-bold text-[12px] flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                      {copiedReport ? <><Check className="w-4 h-4 text-[#0c0d0f]" /> Copied!</> : 'Copy Platform Report'}
                    </button>
                    <button onClick={handleCopyNote} className="p-[10px] rounded-[8px] border border-[#2c2e35] bg-transparent text-[#f0f1f3] font-normal text-[12px] flex items-center justify-center gap-2 hover:bg-[#2c2e35] transition-all">
                      {copiedNote ? <><Check className="w-4 h-4 text-[#2ecc71]" /> Formatted & Copied!</> : 'Flag to Community Notes'}
                    </button>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
