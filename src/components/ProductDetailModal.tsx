import React, { useState } from "react";
import { X, MessageSquare, Heart, Ruler, Check } from "lucide-react";
import { Product, StoreSettings } from "../types";

interface ProductDetailModalProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || "");
  const [liked, setLiked] = useState<boolean>(false);

  const isOutOfStock = product.stock === 0;

  const handleWhatsAppRedirect = () => {
    let template = settings.whatsappTemplate || "¡Hola! Me interesa comprar el producto *{name}* (Precio: *{price}*, Talla: *{size}*, Color: *{color}*). ¿Está disponible?";
    
    const formattedMessage = template
      .replace("{name}", product.name)
      .replace("{price}", `$${product.price.toFixed(2)}`)
      .replace("{size}", selectedSize || "Cualquiera")
      .replace("{color}", selectedColor || "Cualquiera");

    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col md:flex-row transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-neutral-800 hover:text-neutral-950 rounded-full shadow-md border border-neutral-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Stage */}
        <div className="w-full md:w-1/2 bg-neutral-50 relative flex items-center justify-center p-6 md:p-12">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-[320px] md:max-h-[420px] w-auto object-contain object-center drop-shadow-xl"
          />
          
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider rounded-full border shadow-xs ${
              product.category === "ropa"
                ? "bg-emerald-100/90 text-emerald-950 border-emerald-200"
                : "bg-amber-100/90 text-amber-950 border-amber-200"
            }`}>
              {product.category === "ropa" ? "Ropa" : "Calzado"}
            </span>
          </div>
        </div>

        {/* Product Customizer Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white">
          <div>
            {/* Title & Heart Button */}
            <div className="flex justify-between items-start gap-4 mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-950 leading-tight">
                {product.name}
              </h2>
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  liked 
                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                    : "bg-white hover:bg-neutral-50 text-neutral-400 border-neutral-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* Price tag */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-mono font-black text-neutral-950">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500 font-mono">IVA Incluido</span>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Seleccionar Talla:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[42px] h-[42px] px-3 flex items-center justify-center border text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-neutral-950 text-white border-neutral-950 font-black shadow-md shadow-neutral-900/10"
                          : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <span className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Seleccionar Color:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-neutral-950 text-white border-neutral-950 font-black shadow-md shadow-neutral-900/10"
                            : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="border-t border-neutral-100 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4 text-xs font-mono">
              <span className="text-neutral-500">Estado de inventario:</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Agotado</span>
              ) : product.stock <= 5 ? (
                <span className="text-rose-600 font-bold">¡Últimas {product.stock} unidades!</span>
              ) : (
                <span className="text-emerald-600 font-bold">Disponible en stock</span>
              )}
            </div>

            <button
              onClick={handleWhatsAppRedirect}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all shadow-lg cursor-pointer ${
                isOutOfStock
                  ? "bg-neutral-100 text-neutral-400 border border-neutral-200/50 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/15"
              }`}
            >
              <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
              <span>Preguntar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
