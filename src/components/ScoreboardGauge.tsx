import React from "react";

interface ScoreboardGaugeProps {
  score: number;
  verdict: "GREEN" | "YELLOW" | "RED";
}

export const ScoreboardGauge: React.FC<ScoreboardGaugeProps> = ({ score, verdict }) => {
  // Normalize the score to a percentage out of 30
  const percentage = Math.min(100, Math.max(0, (score / 30) * 100));
  
  // Outer circle circumference for radial offset (r=50 -> C = 2 * PI * 50 = 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorTheme = () => {
    switch (verdict) {
      case "GREEN":
        return {
          stroke: "stroke-emerald-500",
          text: "text-emerald-600",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          glow: "shadow-sm",
          label: "Elite Asset (उच्च संभावना)",
        };
      case "YELLOW":
        return {
          stroke: "stroke-amber-500",
          text: "text-amber-600",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          glow: "shadow-sm",
          label: "Average Idea (संशोधन आवश्यक)",
        };
      case "RED":
        return {
          stroke: "stroke-rose-500",
          text: "text-rose-600",
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          glow: "shadow-sm",
          label: "Dead Idea (निरस्त करें)",
        };
    }
  };

  const theme = getColorTheme();

  return (
    <div id="scoreboard-gauge" className={`flex flex-col items-center justify-center p-6 bg-white border border-[#E2E8F0] rounded-2xl ${theme.glow}`}>
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Track circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`transition-all duration-1000 ease-out fill-transparent ${theme.stroke}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Mid score display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-display font-bold tracking-tight text-slate-900`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
            Out of 30
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${theme.bg}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
          {theme.label}
        </span>
      </div>
    </div>
  );
};
