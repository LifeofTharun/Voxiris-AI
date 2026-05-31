/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MatchDetail, VisionMetrics, NLUAnalysis } from "../types";
import { Check, X, Disc, Cpu, RotateCcw, HelpCircle } from "lucide-react";

interface MathMatrixProps {
  vision?: VisionMetrics;
  nlu?: NLUAnalysis;
  recommendations: MatchDetail[];
  onReset?: () => void;
}

export default function MathMatrix({ vision, nlu, recommendations, onReset }: MathMatrixProps) {
  if (!vision) {
    return (
      <div className="bg-white border-2 border-black p-8 text-center text-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" id="empty-math-matrix">
        <Cpu className="w-10 h-10 text-black mx-auto mb-3 animate-pulse" />
        <h3 className="font-display font-bold text-black uppercase tracking-tight">Neural Matrix Standby</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2">
          Inference pipelines have not run. Feed an apparel image asset and a query voice command to boot the self-hosted Scikit-style scoring engine.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6" id="math-matrix-container">
      {/* Engine Metrics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black pb-4">
        <div>
          <h3 className="text-md font-display font-bold text-black uppercase tracking-tight flex items-center gap-2">
            <Cpu className="text-black w-4 h-4" />
            VoxIris Cosine Scoring Engine
          </h3>
          <p className="text-xs text-zinc-500">Real-time vector multiplication diagnostics</p>
        </div>
        
        <div className="flex gap-2 font-mono text-[10px] font-bold">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
            CONFIDENCE: {(vision.confidenceScore * 100).toFixed(0)}%
          </span>
          <span className="px-2 py-0.5 bg-zinc-100 text-black border border-zinc-300">
            TARGET: {(nlu?.targetCategory || "ANY").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Mathematical Formula Banner */}
      <div className="bg-zinc-50 border border-black p-4 relative overflow-hidden">
        <div className="absolute right-3 top-3 opacity-5 text-[50px] font-bold select-none font-mono">cos</div>
        <div className="text-xs text-zinc-700 font-bold flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <DiskIcon className="text-black" /> Math Formulation:
        </div>
        <div className="text-center py-2 overflow-x-auto">
          <code className="text-black font-mono text-xs md:text-sm font-bold whitespace-nowrap block">
            Similarity(A, B) = (A · B) / (||A|| × ||B||)
          </code>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed text-center">
          Where <span className="font-mono text-black font-bold">A</span> represents the extracted 5-dimensional image reference vector and <span className="font-mono text-black font-bold">B</span> represents database item embedding coordinate slots.
        </p>
      </div>

      {/* Vector Coordinates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Extracted Core Image Vector */}
        <div className="bg-zinc-50 border border-black p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-bold">
            Extracted Vector [A] (Uploaded Image)
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs bg-white p-2 border border-zinc-300">
            <span className="text-zinc-600 font-bold">A =</span>
            <span className="text-black font-bold">[</span>
            {vision.extractedVector.map((val, idx) => (
              <span key={idx} className="text-black font-bold">
                {val.toFixed(2)}
                {idx < vision.extractedVector.length - 1 ? ", " : ""}
              </span>
            ))}
            <span className="text-black font-bold">]</span>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 mt-2 font-mono px-1 select-none">
            <span>[0] Cat: {vision.detectedCategory}</span>
            <span>[1] Hue: {vision.detectedColor}</span>
            <span>[2] Style: {vision.detectedStyle}</span>
          </div>
        </div>

        {/* NLU Constraint Directives */}
        <div className="bg-zinc-50 border border-black p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-bold">
            NLP Filter Context [C] (Vox Request Rules)
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-0.5 border-b border-zinc-200">
              <span className="text-zinc-600">Target Category filter:</span>
              <span className="text-black font-bold uppercase">{nlu?.targetCategory || "Unspecified"}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-zinc-600">Under Price ceiling:</span>
              <span className="text-black font-bold">
                {nlu?.priceLimit ? `₹${nlu.priceLimit}` : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Computed Neural Similarity Rankings */}
      <div>
        <h4 className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-3">
          Model Computations Database Rankings
        </h4>
        
        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border-collapse border border-black" id="math-scoring-table">
            <thead>
              <tr className="bg-zinc-50 text-black border-b border-black">
                <th className="p-2 sm:p-2.5 font-bold text-left uppercase text-[10px]">Garment Title</th>
                <th className="p-2 sm:p-2.5 font-bold text-center uppercase text-[10px]">Vector [B]</th>
                <th className="p-2 sm:p-2.5 font-bold text-center uppercase text-[10px]">Score (Cos θ)</th>
                <th className="p-2 sm:p-2.5 font-bold text-center uppercase text-[10px]">NLU Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {recommendations.map((item, index) => {
                const vectorStr = `[${item.product.embeddings.map(v => v.toFixed(1)).join(", ")}]`;
                return (
                  <tr key={item.product.id} className={`hover:bg-zinc-50/80 transition-all ${
                    item.isEligible ? "text-black" : "text-zinc-400 bg-zinc-50/50"
                  }`} id={`row-${item.product.id}`}>
                    <td className="p-2.5 text-left">
                      <div className="font-bold text-[11px] max-w-[150px] sm:max-w-[200px] truncate" id={`table-prod-name-${item.product.id}`}>
                        {item.product.name}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-bold flex gap-2">
                        <span>₹{item.product.price}</span>
                        <span>•</span>
                        <span>{item.product.category.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center text-[10px] text-zinc-500 font-mono">
                      {vectorStr}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-bold ${
                          item.isEligible 
                            ? "text-black text-xs" 
                            : "text-zinc-400"
                        }`} id={`sim-score-${item.product.id}`}>
                          {item.cosineSimilarity.toFixed(4)}
                        </span>
                        
                        {/* Cosine indicator meter */}
                        <div className="w-10 h-2 bg-zinc-100 border border-zinc-200 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${item.isEligible ? "bg-black" : "bg-zinc-300"}`}
                            style={{ width: `${Math.max(0, Math.min(100, item.cosineSimilarity * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 text-center text-[10px]">
                      {item.isEligible ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-100 text-black border border-black font-bold">
                          <Check className="w-3 h-3" /> ELIGIBLE
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-50 text-zinc-400 border border-zinc-200 cursor-help"
                          title={item.rejectReason}
                        >
                          <X className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Minimal decorative disk icon matching modern technical guidelines
function DiskIcon({ className = "" }) {
  return (
    <svg 
      className={`w-3.5 h-3.5 inline ${className}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );
}
