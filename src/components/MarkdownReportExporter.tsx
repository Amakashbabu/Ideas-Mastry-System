import React, { useState } from "react";
import { Clipboard, Check, FileText, Eye, Code, Sparkles } from "lucide-react";

interface MarkdownReportExporterProps {
  markdownText: string;
}

export const MarkdownReportExporter: React.FC<MarkdownReportExporterProps> = ({ markdownText }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy clipboard: ", err);
    }
  };

  // Inline formatting parser (bolds, code tags, quotes)
  const renderInlineFormat = (line: string): React.ReactNode => {
    // Split for bolds **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Sub-split for code `code`
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((sub, sIdx) => {
        if (sub.startsWith("`") && sub.endsWith("`")) {
          return (
            <code key={`${idx}-${sIdx}`} className="bg-slate-100 border border-slate-200 text-rose-600 font-mono text-xs px-1.5 py-0.5 rounded mx-0.5">
              {sub.slice(1, -1)}
            </code>
          );
        }
        return sub;
      });
    });
  };

  // Elegant dynamic markdown parser returning custom visual TSX components
  const parseMarkdownToJSX = (text: string) => {
    if (!text) return <p className="text-slate-400 text-xs italic">No report content available.</p>;

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    
    let keyCounter = 0;
    let listItems: string[] = [];
    let inList = false;
    
    let tableRows: string[][] = [];
    let inTable = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${keyCounter++}`} className="my-3 space-y-2 pl-1 animate-fade-in">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-700 text-xs md:text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A] mt-2 shrink-0" />
                <span className="flex-1 text-[#334155]">{renderInlineFormat(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const hasSeparator = tableRows[1] && tableRows[1].some(cell => cell.includes("---") || cell.includes("-"));
        const bodyRows = hasSeparator ? tableRows.slice(2) : tableRows.slice(1);
        
        elements.push(
          <div key={`table-${keyCounter++}`} className="my-5 overflow-x-auto border border-[#E2E8F0] rounded-xl shadow-xs animate-fade-in bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-xs md:text-sm text-left">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-4 py-3 text-xs font-bold font-mono tracking-wider text-slate-700 uppercase whitespace-nowrap bg-slate-50/80 border-b border-slate-250">
                      {renderInlineFormat(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
                        {renderInlineFormat(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Divider rules
      if (trimmed === "---" || trimmed === "***" || trimmed === "--- ") {
        flushList();
        flushTable();
        elements.push(<hr key={`hr-${keyCounter++}`} className="border-[#E2E8F0] my-5" />);
        continue;
      }

      // Check Tables
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList();
        inTable = true;
        const cells = rawLine.split("|").map(cell => cell.trim()).filter((cell, idx, arr) => {
          return idx > 0 && idx < arr.length - 1;
        });
        tableRows.push(cells);
        continue;
      } else {
        if (inTable) flushTable();
      }

      // Check List items
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        inList = true;
        const content = trimmed.replace(/^([-*•])\s*/, "");
        listItems.push(content);
        continue;
      } else {
        if (inList) flushList();
      }

      // Check H1 Headers
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${keyCounter++}`} className="text-xl md:text-2xl font-black font-display text-slate-900 tracking-tight mt-6 mb-3 border-b border-slate-100 pb-2">
            {renderInlineFormat(trimmed.substring(2))}
          </h1>
        );
        continue;
      }

      // Check H2 Headers
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${keyCounter++}`} className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-800 font-mono mt-5 mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
            {renderInlineFormat(trimmed.substring(3))}
          </h2>
        );
        continue;
      }

      // Check H3 Headers
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${keyCounter++}`} className="text-xs md:text-sm font-bold text-slate-900 tracking-tight mt-4 mb-1.5">
            {renderInlineFormat(trimmed.substring(4))}
          </h3>
        );
        continue;
      }

      // Check Blockquote
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={`bq-${keyCounter++}`} className="border-l-4 border-slate-900 bg-slate-50 text-slate-700 text-xs md:text-sm pl-4 py-2.5 my-3.5 rounded-r-lg italic leading-relaxed">
            {renderInlineFormat(trimmed.substring(2))}
          </blockquote>
        );
        continue;
      }

      if (trimmed === "") continue;

      // Regular paragraph
      elements.push(
        <p key={`p-${keyCounter++}`} className="text-slate-650 text-xs md:text-sm leading-relaxed mt-2 mb-2 font-sans">
          {renderInlineFormat(rawLine)}
        </p>
      );
    }

    // Flush active left-overs
    flushList();
    flushTable();

    return <div className="space-y-1.5">{elements}</div>;
  };

  return (
    <div id="markdown-exporter" className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* HEADER WITH TOGGLE CONTROLS */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0F172A]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
            Eval Executive Report
          </h3>
        </div>

        {/* TABS CONTROLLER AND MAIN COPY */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                viewMode === "preview"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="पढ़ने के लिए साफ़ रिपोर्ट"
            >
              <Eye className="w-3 h-3 text-indigo-500" />
              <span>Report View</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                viewMode === "raw"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="कॉपी करने के लिए रॉ कोड"
            >
              <Code className="w-3 h-3 text-slate-505" />
              <span>Raw Markdown</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-[#0F172A] hover:bg-black text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* RENDERED OR PLAIN CODE CONTAINER */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">
        {viewMode === "preview" ? (
          <div className="bg-white rounded-lg px-2 text-[#334155] leading-relaxed word-break">
            {parseMarkdownToJSX(markdownText)}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] font-mono text-xs text-[#334155] whitespace-pre-wrap select-all leading-normal">
            {markdownText}
          </div>
        )}
      </div>
      
      {/* FOOTER METRIC BRANDING */}
      <div className="bg-slate-50 px-5 py-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] font-mono flex justify-between items-center">
        <span className="flex items-center gap-1 text-[10px]">
          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
          Interactive formatted report layout
        </span>
        <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-wider">
          ● Copy & Share Ready
        </span>
      </div>
    </div>
  );
};
