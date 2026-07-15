import { useState, useEffect } from "react";
import { StoreHeader } from "./components/StoreHeader";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ChatWidget } from "./components/ChatWidget";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { Product, StoreSettings, ChatSession, DatabaseSchema } from "./types";
import { ShoppingBag, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const getApiUrl = (path: string) => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Si no estamos en desarrollo local o en la preview de AI Studio,
    // significa que estamos en el hosting de producción (ej. jksoft.neti.cu).
    // Usamos la ruta directa a api.php para evitar depender de mod_rewrite de Apache.
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.endsWith("run.app")) {
      const pathname = window.location.pathname;
      const baseDir = pathname.substring(0, pathname.lastIndexOf('/') + 1) || '/';
      const cleanBaseDir = baseDir.endsWith('/') ? baseDir : baseDir + '/';
      return `${cleanBaseDir}api.php${path}`;
    }
    if (window.location.port === "3001") {
      return `http://localhost:3000${path}`;
    }
  }
  return path;
};

export default function App() {
  const [db, setDb] = useState<DatabaseSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Navigation State
  const [currentTab, setCurrentTab] = useState<"store" | "admin">("store");
  const [activeCategory, setActiveCategory] = useState<"todos" | "ropa" | "zapatos">("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Product Details Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch full DB state from Hono/PHP server
  const fetchDb = async () => {
    try {
      const response = await fetch(getApiUrl("/api/db"));
      
      if (!response.ok) {
        let errorMsg = `Error del servidor (${response.status} ${response.statusText})`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
            if (errData.suggestion) {
              errorMsg += `. ${errData.suggestion}`;
            }
          }
        } catch (_) {
          try {
            const rawText = await response.text();
            if (rawText && rawText.trim().length > 0) {
              errorMsg += `: ${rawText.slice(0, 300)}`;
            }
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        throw new Error(`Respuesta no válida del servidor. El servidor PHP podría estar mostrando advertencias o errores: ${rawText.slice(0, 300)}`);
      }

      setDb(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching db:", err);
      setError(err.message || "No se pudo cargar la información de la tienda. Por favor verifica tu conexión local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-neutral-800 font-mono uppercase tracking-widest animate-pulse">
          Iniciando Tienda Online...
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
          Cargando catálogo local, configuraciones y módulos de comunicación.
        </p>
      </div>
    );
  }

  if (error || !db) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mb-4 font-bold max-w-md">
          {error || "Error al inicializar la base de datos."}
        </div>
        <button
          onClick={() => { setLoading(true); fetchDb(); }}
          className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-900 transition-all cursor-pointer shadow-md"
        >
          Reintentar Conexión
        </button>
      </div>
    );
  }

  const { settings, products, chats } = db;

  // Handler: Update Store Settings (PUT)
  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    try {
      const res = await fetch(getApiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        await fetchDb();
      }
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  };

  // Handler: Save Product (POST)
  const handleSaveProduct = async (product: Product) => {
    try {
      const res = await fetch(getApiUrl("/api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        await fetchDb();
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // Handler: Delete Product (DELETE)
  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/products/${productId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchDb();
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Handler: Send Message as Owner (POST)
  const handleSendOwnerMessage = async (chatId: string, text: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/chats/${chatId}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "owner", text }),
      });
      if (res.ok) {
        await fetchDb();
      }
    } catch (err) {
      console.error("Error sending owner message:", err);
    }
  };

  // Handler: Customer Sends Message (POST)
  const handleCustomerSendMessage = async (customerName: string, text: string): Promise<ChatSession> => {
    // 1. Get/Create chat session
    const sessionRes = await fetch(getApiUrl("/api/chats"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName }),
    });
    const session: ChatSession = await sessionRes.json();

    // 2. Post new message
    const messageRes = await fetch(getApiUrl(`/api/chats/${session.id}/messages`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "customer", text }),
    });
    
    const updatedSession: ChatSession = await messageRes.json();
    
    // Refresh DB silently
    fetchDb();
    
    return updatedSession;
  };

  // Handler: Customer Polls Chat updates
  const handleCustomerPollChat = async (customerName: string): Promise<ChatSession | null> => {
    try {
      const res = await fetch(getApiUrl("/api/chats"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Error polling chat:", err);
    }
    return null;
  };

  // Instant Purchase (direct WhatsApp redirect using first talle/color)
  const handleInstantBuy = (product: Product) => {
    const defaultSize = product.sizes[0] || "Única";
    const defaultColor = product.colors[0] || "Único";
    
    let template = settings.whatsappTemplate || "¡Hola! Me interesa comprar el producto *{name}* (Precio: *{price}*, Talla: *{size}*, Color: *{color}*). ¿Está disponible?";
    
    const formattedMessage = template
      .replace("{name}", product.name)
      .replace("{price}", `$${product.price.toFixed(2)}`)
      .replace("{size}", defaultSize)
      .replace("{color}", defaultColor);

    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(whatsappUrl, "_blank");
  };

  // Filter products based on search query and active tab category
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "todos" || product.category === activeCategory;
    
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.colors.some((col) => col.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.sizes.some((size) => size.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.featured && p.stock > 0);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col text-neutral-800">
      
      {/* Universal Header component */}
      <StoreHeader
        settings={settings}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content stage */}
      {currentTab === "store" ? (
        /* PUBLIC STORE FRONT */
        <div className="flex-1">
          {/* Hero Banner (Only shown if no active category/search filter is applied) */}
          {activeCategory === "todos" && searchQuery === "" && (
            <section className="bg-neutral-900 text-white relative overflow-hidden py-16 md:py-24 border-b border-neutral-950">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-neutral-950 opacity-90" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-300 text-[10px] font-bold font-mono uppercase tracking-widest rounded-full border border-neutral-700/80">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>Colección de Temporada 2026</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight leading-none text-white">
                    Viste con <span className="text-neutral-300 underline decoration-neutral-500 underline-offset-8">Estilo</span> y Confort
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md">
                    Descubre nuestra nueva colección de ropa de alta gama y calzado ergonómico. Elige tus favoritos, personaliza tus tallas y pide directo por WhatsApp en segundos.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const target = document.getElementById("catalog-section");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-6 py-3.5 bg-white text-neutral-950 text-xs font-bold rounded-xl hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-white/5"
                    >
                      <span>Explorar Catálogo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right side teaser */}
                {featuredProducts.length > 0 && (
                  <div className="hidden md:flex items-center justify-center">
                    <div className="relative w-80 h-80 bg-neutral-800/50 rounded-3xl border border-neutral-700/50 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
                      
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded-full border border-emerald-500/20">
                          Recomendado
                        </span>
                        <span className="font-mono text-xs text-neutral-400">${featuredProducts[0].price}</span>
                      </div>

                      <div className="my-4 flex justify-center">
                        <img 
                          src={featuredProducts[0].images[0]} 
                          alt={featuredProducts[0].name}
                          referrerPolicy="no-referrer"
                          className="max-h-40 w-auto object-contain drop-shadow-2xl hover:rotate-3 transition-transform duration-300" 
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{featuredProducts[0].name}</h4>
                        <button
                          onClick={() => handleInstantBuy(featuredProducts[0])}
                          className="mt-2 w-full py-2 bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Ordenar Ahora</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* Products Catalog Stage */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 font-sans tracking-tight">
                  {searchQuery ? `Resultados para "${searchQuery}"` : "Catálogo Exclusivo"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {filteredProducts.length} artículos disponibles en este momento
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-neutral-300 mb-3" />
                <h4 className="font-bold text-neutral-800">No encontramos coincidencias</h4>
                <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">
                  Prueba buscando otros colores, tallas o categorías. Recuerda que puedes filtrar por ropa y calzado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onViewDetails={setSelectedProduct}
                    onInstantBuy={handleInstantBuy}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* OWNER DASHBOARD PANEL */
        <OwnerDashboard
          settings={settings}
          products={products}
          chats={chats}
          onUpdateSettings={handleUpdateSettings}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onSendOwnerMessage={handleSendOwnerMessage}
          onRefreshData={fetchDb}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Floating customer-facing chat widget */}
      <ChatWidget
        settings={settings}
      />

      {/* Global Footer */}
      <footer className="bg-white border-t border-neutral-100 py-8 text-center text-neutral-500 text-xs font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 {settings.storeName || "Tienda de Ropa y Calzado"}. Todos los derechos reservados.</p>
          <p className="text-neutral-400">
            Conexión directa a WhatsApp • Sin cargos adicionales • Archivos persistidos localmente
          </p>
        </div>
      </footer>

    </div>
  );
}
