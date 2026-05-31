/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PRODUCT_DATABASE } from "../products";
import { Product } from "../types";
import { Shirt, HelpCircle, ArrowRight, Layers } from "lucide-react";

interface DbViewerProps {
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

export default function DbViewer({ onSelectProduct, selectedProductId }: DbViewerProps) {
  return (
    <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full" id="db-viewer-container">
      <div className="flex items-center justify-between mb-4 border-b border-black pb-3">
        <div className="flex items-center gap-2">
          <Layers className="text-black w-5 h-5 animate-pulse" id="layers-icon" />
          <h2 className="text-lg font-display font-bold text-black uppercase tracking-tight" id="db-title">
            Stock Database
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white font-bold" id="db-item-counter">
          {PRODUCT_DATABASE.length} ITEMS
        </span>
      </div>

      <p className="text-xs text-zinc-600 mb-6 font-sans leading-relaxed" id="db-description">
        Click any garment profile below to instantly feed its 5D neural styling vector directly into the VoxIris recommendation pipeline for instant scoring evaluation!
      </p>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 text-black" id="db-items-list">
        {PRODUCT_DATABASE.map((prod) => {
          const isSelected = selectedProductId === prod.id;
          return (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className={`w-full flex items-center gap-3 p-3 transition-all duration-150 border-2 ${
                isSelected
                  ? "bg-black border-black text-white"
                  : "bg-white hover:bg-zinc-50 border-black text-black"
              }`}
              id={`db-select-${prod.id}`}
            >
              <div className="relative w-12 h-12 border border-black overflow-hidden bg-zinc-200 flex-shrink-0" id={`db-image-container-${prod.id}`}>
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover grayscale-25"
                  referrerPolicy="no-referrer"
                  id={`db-image-${prod.id}`}
                />
              </div>

              <div className="flex-grow min-w-0" id={`db-details-${prod.id}`}>
                <div className="flex items-center justify-between gap-1" id={`db-header-row-${prod.id}`}>
                  <span className={`text-[10px] font-bold tracking-wider uppercase font-mono ${
                    isSelected ? "text-zinc-300" : "text-zinc-500"
                  }`} id={`db-cat-${prod.id}`}>
                    {prod.category}
                  </span>
                  <span className="text-xs font-bold font-mono" id={`db-price-${prod.id}`}>
                    ₹{prod.price}
                  </span>
                </div>
                <h3 className="text-xs font-semibold truncate mt-0.5" id={`db-name-${prod.id}`}>
                  {prod.name}
                </h3>
                
                <div className="flex flex-wrap items-center mt-1 gap-1" id={`db-tags-row-${prod.id}`}>
                  <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 border ${
                    isSelected ? "bg-zinc-900 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`} id={`db-style-tag-${prod.id}`}>
                    {prod.style}
                  </span>
                  <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 border ${
                    isSelected ? "bg-zinc-900 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`} id={`db-fabric-tag-${prod.id}`}>
                    {prod.fabric}
                  </span>
                </div>
              </div>

              <div className={`flex-shrink-0 px-1 ${
                isSelected ? "text-white" : "text-black"
              }`} id={`db-arrow-${prod.id}`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-zinc-50 rounded-none p-4 border border-black text-xs text-zinc-700" id="database-vector-guide">
        <div className="font-bold text-black mb-2 flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <Layers className="w-3.5 h-3.5 text-black" />
          5D Spatial Coordinates
        </div>
        The backend performs high-speed Cosine array comparisons using pre-loaded coordinates in the model:
        <ul className="list-disc list-inside mt-2 space-y-1.5 font-mono text-[10px] text-zinc-600">
          <li>Idx [0] Category (Shirt Component Core)</li>
          <li>Idx [1] Chroma Hue / Color Temperature</li>
          <li>Idx [2] Dress formality & constraints</li>
          <li>Idx [3] Textile yarn thickness / texture</li>
          <li>Idx [4] Price index / budget weight</li>
        </ul>
      </div>
    </div>
  );
}
