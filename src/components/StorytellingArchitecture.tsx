import React from "react";
import { Phase3Data, FRAMEWORKS } from "../types";
import { BookOpen, HelpCircle, GitFork, Milestone } from "lucide-react";

interface StorytellingArchitectureProps {
  data: Phase3Data;
}

export const StorytellingArchitecture: React.FC<StorytellingArchitectureProps> = ({ data }) => {
  const frameworkId = data.frameworkId || 1;
  const config = FRAMEWORKS[frameworkId] || { hindi: "मुश्किल चुनौती", icon: "🏆", desc: "Setting a brutal task." };

  return (
    <div id="story-architecture-container" className="bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Frame selected display header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5 mb-5">
        <div className="flex items-start space-x-3.5">
          <div className="text-3xl p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-bold">
              Storytelling Architecture (कथा-शैली)
            </span>
            <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              {data.frameworkName}
              <span className="text-sm font-sans font-normal text-slate-500">
                ({config.hindi})
              </span>
            </h3>
          </div>
        </div>

        <div className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3.5 py-1.5 rounded-full self-start md:self-center font-mono font-semibold">
          Framework ID: {frameworkId} of 7
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core parameters details */}
        <div className="lg:col-span-7 space-y-5">
          {/* Headline heading */}
          <div>
            <h4 className="text-xs uppercase font-mono text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 font-bold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Recommended Attention Hook (प्रस्तावित हुक)
            </h4>
            <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl relative group">
              <span className="absolute top-2 right-2 text-[10px] font-mono text-slate-400 uppercase">
                High CTR Title
              </span>
              <p className="text-base font-display font-medium text-slate-900 leading-relaxed pr-6">
                "{data.frameworkHeading}"
              </p>
            </div>
          </div>

          {/* Retention Hook outline */}
          <div>
            <h4 className="text-xs uppercase font-mono text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 font-bold">
              <Milestone className="w-3.5 h-3.5 text-teal-600" />
              Retention Outline Plan (रिटेंशन रूपरेखा)
            </h4>
            <div className="bg-slate-50 border border-[#E2E8F0] p-4.5 rounded-xl">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                {data.retentionHook}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Justification */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase font-mono text-indigo-700 tracking-wider mb-2.5 flex items-center gap-1.5 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Strategic Justification (क्यों चुना गया)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {data.whySelected}
              </p>
            </div>

            <div className="border-t border-indigo-100 pt-4 mt-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-mono">
                <GitFork className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <div>
                  <span className="text-slate-800 font-bold font-sans block mb-0.5">
                    Structure Description:
                  </span>
                  <span className="text-slate-600 font-sans">{config.desc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
