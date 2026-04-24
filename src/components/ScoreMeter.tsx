import React from 'react';
import { motion } from 'motion/react';

interface ScoreMeterProps {
  score: number;
}

export default function ScoreMeter({ score }: ScoreMeterProps) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score < 30) return '#2ecc71'; 
    if (score < 70) return '#ff9f43'; 
    return '#ff4d4d'; 
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-[10px]">
      <svg className="w-[140px] h-[140px] transform -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#222"
          strokeWidth="16"
          fill="transparent"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="70"
          cy="70"
          r={radius}
          stroke={getColor()}
          strokeWidth="16"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[42px] font-[800] tracking-tighter"
          style={{ color: getColor(), fontFamily: "'Courier New', Courier, monospace" }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}