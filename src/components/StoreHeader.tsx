import React from "react";
import { Store, UserCheck, ShoppingBag, Eye, Settings, Search, SlidersHorizontal } from "lucide-react";
import { StoreSettings } from "../types";

interface StoreHeaderProps {
  settings: StoreSettings;
  currentTab: "store" | "admin";
  onTabChange: (tab: "store" | "admin") => void;
  activeCategory: "todos" | "ropa" | "zapatos";
  onCategoryChange: (category: "todos" | "ropa" | "zapatos") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  settings,
  currentTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border border-neutral-800 shadow-md shadow-neutral-950/20 overflow-hidden group">
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent opacity-50" />
              <span className="font-serif text-base font-extrabold tracking-tighter text-amber-100/90 select-none group-hover:scale-105 transition-transform">A</span>
              <span className="text-[9px] text-amber-400/80 font-serif mx-0.5 select-none">&</span>
              <span className="font-serif text-base font-extrabold tracking-tighter text-amber-100/90 select-none group-hover:scale-105 transition-transform">J</span>
              <div className="absolute bottom-0.5 text-[7px] text-emerald-400 font-bold tracking-widest uppercase font-mono scale-90 opacity-90 select-none">
                Aura
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black font-sans text-neutral-950 tracking-tight leading-none flex flex-wrap items-center gap-1.5">
                <span>Arnielys & Juank</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  Aura Studio
                </span>
              </h1>
              <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Catálogo Directo a WhatsApp</span>
              </p>
            </div>
          </div>

          {/* Search bar & Admin switcher */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentTab === "store" && (
              <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar ropa o zapatos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
            )}

            <button
              onClick={() => onTabChange(currentTab === "store" ? "admin" : "store")}
              id="admin-toggle-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === "admin"
                  ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/10 hover:bg-neutral-800"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {currentTab === "store" ? (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Panel del Dueño</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Ver Tienda</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar (Only visible on Store view) */}
        {currentTab === "store" && (
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none border-t border-neutral-50 pt-3">
            <button
              onClick={() => onCategoryChange("todos")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === "todos"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Todos los Productos
            </button>
            <button
              onClick={() => onCategoryChange("ropa")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === "ropa"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50 hover:bg-emerald-100/50"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Ropa
            </button>
            <button
              onClick={() => onCategoryChange("zapatos")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === "zapatos"
                  ? "bg-amber-50 text-amber-800 border border-amber-200/50 hover:bg-amber-100/50"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Zapatos y Calzado
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
