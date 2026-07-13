import React, { useState } from "react";
import { 
  BarChart3, Package, MessageSquare, Settings, Plus, Trash2, Edit3, 
  Save, ArrowLeft, Send, CheckCircle2, TrendingUp, User, Sparkles, 
  RefreshCw, AlertCircle, ShoppingBag, Eye, Heart
} from "lucide-react";
import { Product, StoreSettings, ChatSession, ChatMessage } from "../types";

interface OwnerDashboardProps {
  settings: StoreSettings;
  products: Product[];
  chats: ChatSession[];
  onUpdateSettings: (newSettings: StoreSettings) => Promise<void>;
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onSendOwnerMessage: (chatId: string, text: string) => Promise<void>;
  onRefreshData: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  settings,
  products,
  chats,
  onUpdateSettings,
  onSaveProduct,
  onDeleteProduct,
  onSendOwnerMessage,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"stats" | "inventory" | "chats" | "settings">("stats");
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  React.useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Product Form State (For adding/editing)
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Active CRM Chat State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [ownerReplyText, setOwnerReplyText] = useState("");

  const activeChat = chats.find(c => c.id === selectedChatId);

  // Handle saving the store settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(settingsForm);
      alert("Configuraciones guardadas correctamente.");
    } catch (err) {
      alert("Error al guardar configuraciones.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open product form for adding
  const handleAddProductClick = () => {
    setEditingProduct({
      name: "",
      description: "",
      category: "ropa",
      price: 29.99,
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"],
      sizes: ["S", "M", "L"],
      colors: ["Negro", "Blanco"],
      stock: 10,
      featured: false
    });
    setIsEditingProduct(true);
  };

  // Open product form for editing
  const handleEditProductClick = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditingProduct(true);
  };

  // Handle saving product form
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price || editingProduct.stock === undefined) {
      alert("Por favor completa los campos principales.");
      return;
    }

    setIsSavingProduct(true);
    try {
      await onSaveProduct(editingProduct as Product);
      setIsEditingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      alert("Error al guardar el producto.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Handle sending a message as the store owner
  const handleSendOwnerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !ownerReplyText.trim()) return;

    const text = ownerReplyText.trim();
    setOwnerReplyText("");

    try {
      await onSendOwnerMessage(selectedChatId, text);
    } catch (err) {
      alert("Error al enviar el mensaje.");
    }
  };

  // General Statistics Calculations
  const totalProducts = products.length;
  const clothingCount = products.filter(p => p.category === "ropa").length;
  const shoesCount = products.filter(p => p.category === "zapatos").length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const totalChats = chats.length;
  const unreadChats = chats.filter(c => c.unread).length;

  // Simulated metrics
  const simulatedVisitors = totalProducts * 15 + totalChats * 8 + 120;
  const simulatedConversations = totalChats;
  const simulatedWhatsappRedirects = totalChats + Math.round(simulatedVisitors * 0.08);
  const conversionRate = simulatedVisitors > 0 ? ((simulatedWhatsappRedirects / simulatedVisitors) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-100 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-950 font-sans tracking-tight">
            Panel de Control del Dueño
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Administra tu inventario, responde chats de clientes y ajusta los enlaces de WhatsApp de tu tienda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Sincronizar datos locales"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Navigation Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1.5 bg-neutral-50 p-2 rounded-2xl border border-neutral-200/50 overflow-x-auto lg:overflow-visible scrollbar-none">
            <button
              onClick={() => { setActiveTab("stats"); setIsEditingProduct(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "stats"
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-900/10"
                  : "text-neutral-600 hover:bg-neutral-150/50 hover:text-neutral-900"
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span>Estadísticas y Resumen</span>
            </button>

            <button
              onClick={() => { setActiveTab("inventory"); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-900/10"
                  : "text-neutral-600 hover:bg-neutral-150/50 hover:text-neutral-900"
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              <span>Inventario ({totalProducts})</span>
            </button>

            <button
              onClick={() => { setActiveTab("chats"); setIsEditingProduct(false); }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "chats"
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-900/10"
                  : "text-neutral-600 hover:bg-neutral-150/50 hover:text-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Chats con Clientes</span>
              </div>
              {unreadChats > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] rounded-full font-extrabold animate-pulse">
                  {unreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setIsEditingProduct(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "settings"
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-900/10"
                  : "text-neutral-600 hover:bg-neutral-150/50 hover:text-neutral-900"
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Configuración</span>
            </button>
          </nav>
        </aside>

        {/* Right Content stage */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: STATISTICS */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              {/* Bento Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-5 bg-white border border-neutral-100 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Visitas Estimadas</span>
                    <h3 className="text-3xl font-black text-neutral-950 font-mono mt-2">{simulatedVisitors}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-4">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+15% este mes (Simulado)</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-neutral-100 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Consultas (Chats)</span>
                    <h3 className="text-3xl font-black text-neutral-950 font-mono mt-2">{totalChats}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-4">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{unreadChats} pendientes de responder</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-neutral-100 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Intenciones WhatsApp</span>
                    <h3 className="text-3xl font-black text-neutral-950 font-mono mt-2">{simulatedWhatsappRedirects}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-4">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Tasa Conversión: {conversionRate}%</span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-neutral-100 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Salud de Inventario</span>
                    <h3 className="text-3xl font-black text-neutral-950 font-mono mt-2">{totalProducts - outOfStockCount} / {totalProducts}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-bold mt-4">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{outOfStockCount} agotados • {lowStockCount} bajo stock</span>
                  </div>
                </div>

              </div>

              {/* Deep statistics details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Overview */}
                <div className="bg-white border border-neutral-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-neutral-950 text-base mb-4">Inventario por Categoría</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
                        <span>Ropa y Prendas</span>
                        <span>{clothingCount} productos</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${totalProducts > 0 ? (clothingCount / totalProducts) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
                        <span>Calzado y Zapatos</span>
                        <span>{shoesCount} productos</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${totalProducts > 0 ? (shoesCount / totalProducts) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>El inventario se sincroniza en el archivo local <code className="font-mono bg-neutral-50 px-1 py-0.5 rounded text-neutral-700">db.json</code></span>
                  </div>
                </div>

                {/* Quick actions Panel */}
                <div className="bg-white border border-neutral-100 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-950 text-base mb-2">Acciones Rápidas</h4>
                    <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                      Controla las actividades diarias de tu tienda con accesos directos de un clic.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleAddProductClick}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>Agregar Nuevo Producto</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("chats")}
                      className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4.5 h-4.5" />
                      <span>Ver Chats de Clientes ({unreadChats} Nuevos)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              
              {!isEditingProduct ? (
                /* Sub-view: Inventory List */
                <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-neutral-950 text-base">Administración de Productos</h4>
                      <p className="text-xs text-neutral-500">Crea, edita y elimina productos del catálogo</p>
                    </div>
                    <button
                      onClick={handleAddProductClick}
                      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-neutral-900/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Producto</span>
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">
                      No hay productos registrados en el catálogo. Comienza agregando uno.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase font-mono border-b border-neutral-100">
                            <th className="p-4">Producto</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Tallas / Colores</th>
                            <th className="p-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-neutral-800">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={product.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"} 
                                    alt={product.name} 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                                  />
                                  <div>
                                    <span className="font-semibold block text-neutral-950">{product.name}</span>
                                    <span className="text-[10px] text-neutral-400 font-mono block">{product.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase tracking-wide border ${
                                  product.category === "ropa"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {product.category === "ropa" ? "Ropa" : "Calzado"}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-bold text-neutral-950">${product.price.toFixed(2)}</td>
                              <td className="p-4">
                                {product.stock === 0 ? (
                                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Agotado</span>
                                ) : product.stock <= 5 ? (
                                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Bajo Stock ({product.stock})</span>
                                ) : (
                                  <span className="text-xs text-neutral-600 font-mono">{product.stock} u.</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex gap-1 text-[10px] text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                                    <span className="font-bold font-mono">Tallas:</span> {product.sizes.join(", ")}
                                  </div>
                                  <div className="flex gap-1 text-[10px] text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                                    <span className="font-bold font-mono">Colores:</span> {product.colors.join(", ")}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditProductClick(product)}
                                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
                                    title="Editar producto"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Estás seguro que deseas eliminar "${product.name}"?`)) {
                                        onDeleteProduct(product.id);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-all cursor-pointer"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* Sub-view: Add / Edit Product Form */
                <div className="bg-white border border-neutral-100 rounded-2xl p-6">
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-6">
                    <button
                      onClick={() => { setIsEditingProduct(false); setEditingProduct(null); }}
                      className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-950 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="font-bold text-neutral-950 text-base">
                        {editingProduct?.id ? `Editar: ${editingProduct.name}` : "Agregar Nuevo Producto"}
                      </h4>
                      <p className="text-xs text-neutral-500">Configura los detalles del artículo</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.name || ""}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ej. Tenis Urban Comfort"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Categoría *
                        </label>
                        <select
                          required
                          value={editingProduct?.category || "ropa"}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value as "ropa" | "zapatos" }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all bg-white"
                        >
                          <option value="ropa">Ropa</option>
                          <option value="zapatos">Zapatos / Calzado</option>
                        </select>
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Precio de Venta ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingProduct?.price || 0}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ej. 59.99"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Unidades en Stock *
                        </label>
                        <input
                          type="number"
                          required
                          value={editingProduct?.stock || 0}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ej. 15"
                        />
                      </div>

                      {/* Image URL */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          URL de Imagen del Producto
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.images?.[0] || ""}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, images: [e.target.value] }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ingrese un enlace HTTPS de Unsplash o similar..."
                        />
                      </div>

                      {/* Sizes - separated by comma */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Tallas Disponibles (separadas por comas)
                        </label>
                        <input
                          type="text"
                          value={editingProduct?.sizes?.join(", ") || ""}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ej. S, M, L, XL  o  38, 39, 40, 41"
                        />
                      </div>

                      {/* Colors - separated by comma */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Colores Disponibles (separados por comas)
                        </label>
                        <input
                          type="text"
                          value={editingProduct?.colors?.join(", ") || ""}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, colors: e.target.value.split(",").map(c => c.trim()).filter(Boolean) }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Ej. Rojo, Negro, Blanco"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Descripción Detallada
                        </label>
                        <textarea
                          rows={4}
                          value={editingProduct?.description || ""}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                          placeholder="Escribe detalles del material, ajuste, estilo y recomendación..."
                        />
                      </div>

                      {/* Featured Checkbox */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="featured-checkbox"
                          checked={editingProduct?.featured || false}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4.5 h-4.5 text-neutral-950 border-neutral-300 rounded focus:ring-neutral-950"
                        />
                        <label htmlFor="featured-checkbox" className="text-xs font-bold text-neutral-700 uppercase tracking-wider cursor-pointer">
                          Destacar este producto en la portada
                        </label>
                      </div>

                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-6">
                      <button
                        type="button"
                        onClick={() => { setIsEditingProduct(false); setEditingProduct(null); }}
                        className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-150 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-neutral-900/10"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingProduct ? "Guardando..." : "Guardar Producto"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CUSTOMER CHATS (CRM console) */}
          {activeTab === "chats" && (
            <div className="bg-white border border-neutral-100 rounded-2xl h-[550px] flex overflow-hidden">
              
              {/* Left side: Sessions List */}
              <div className="w-1/3 border-r border-neutral-100 flex flex-col h-full bg-neutral-50/50">
                <div className="p-4 border-b border-neutral-100 bg-white">
                  <h4 className="font-bold text-neutral-950 text-sm">Conversaciones</h4>
                  <p className="text-[10px] text-neutral-400">Chats iniciados por clientes</p>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100/60">
                  {chats.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-400 mt-12">
                      Ningún cliente ha iniciado chats aún.
                    </div>
                  ) : (
                    chats
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .map((session) => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        const isSelected = selectedChatId === session.id;
                        
                        return (
                          <button
                            key={session.id}
                            onClick={() => setSelectedChatId(session.id)}
                            className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                              isSelected ? "bg-neutral-100" : "hover:bg-neutral-50 bg-white"
                            }`}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                                {session.customerName.charAt(0).toUpperCase()}
                              </div>
                              {session.unread && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs text-neutral-950 truncate">{session.customerName}</span>
                                <span className="text-[9px] text-neutral-400 font-mono">
                                  {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 truncate leading-snug">
                                {lastMsg ? lastMsg.text : "Inició chat"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Right side: Active Chat Panel */}
              <div className="flex-1 flex flex-col h-full bg-white">
                {activeChat ? (
                  <div className="flex-col flex h-full justify-between">
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                          {activeChat.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-neutral-950">{activeChat.customerName}</h5>
                          <p className="text-[10px] text-neutral-400">Cliente activo en la tienda</p>
                        </div>
                      </div>
                      
                      {activeChat.unread && (
                        <span className="px-2 py-0.5 text-[9px] bg-rose-100 text-rose-800 font-bold rounded-full">
                          Nuevo Mensaje
                        </span>
                      )}
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
                      {activeChat.messages.map((msg) => {
                        const isOwner = msg.sender === "owner";
                        const isAi = msg.sender === "ai";
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isOwner ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[9px] text-neutral-400">
                              <span className="font-bold text-neutral-500">
                                {isOwner ? "Tú (Dueño)" : isAi ? "Asistente AI (Automatizado)" : activeChat.customerName}
                              </span>
                              <span>•</span>
                              <span className="font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div
                              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isOwner
                                  ? "bg-neutral-900 text-white rounded-tr-none shadow-xs"
                                  : isAi
                                  ? "bg-purple-50 text-purple-950 border border-purple-200/50 rounded-tl-none shadow-xs"
                                  : "bg-white text-neutral-800 border border-neutral-200/50 rounded-tl-none shadow-xs"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Form Input */}
                    <form onSubmit={handleSendOwnerMessage} className="p-4 border-t border-neutral-100 flex gap-2 bg-white">
                      <input
                        type="text"
                        required
                        placeholder={`Escribe un mensaje para ${activeChat.customerName}...`}
                        value={ownerReplyText}
                        onChange={(e) => setOwnerReplyText(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Responder</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-neutral-400">
                    <MessageSquare className="w-10 h-10 text-neutral-300 mb-3" />
                    <p className="text-sm">Selecciona una conversación de la izquierda para comenzar a responder.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: STORE CONFIGURATION */}
          {activeTab === "settings" && (
            <div className="bg-white border border-neutral-100 rounded-2xl p-6">
              <div className="border-b border-neutral-100 pb-4 mb-6">
                <h4 className="font-bold text-neutral-950 text-base">Configuración de la Tienda</h4>
                <p className="text-xs text-neutral-500">Ajusta los enlaces de WhatsApp, plantillas de contacto e Inteligencia Artificial.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-5">
                  
                  {/* Store Name */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Nombre de la Tienda
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* WhatsApp target number */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Número de WhatsApp del Dueño (Con prefijo internacional, sin signos ni espacios) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all font-mono"
                      placeholder="Ej. 5491123456789 (Argentina) o 34600123456 (España)"
                    />
                    <span className="block text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                      Este es el número que recibirá los mensajes de compra cuando los clientes hagan clic en "Pedir por WhatsApp".
                    </span>
                  </div>

                  {/* WhatsApp message template */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Plantilla de Mensaje para Pedido de WhatsApp
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={settingsForm.whatsappTemplate}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsappTemplate: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all font-mono text-xs"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border">Comodines:</span>
                      <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{`{name}`} (Producto)</span>
                      <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{`{price}`} (Precio)</span>
                      <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{`{size}`} (Talla)</span>
                      <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-1.5 py-0.5 rounded font-mono">{`{color}`} (Color)</span>
                    </div>
                  </div>

                  {/* Toggle AI Assistant */}
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-purple-700 fill-purple-100" />
                        <div>
                          <span className="block text-xs font-bold text-purple-950 uppercase tracking-wider">
                            Asistente de Inteligencia Artificial (Gemini)
                          </span>
                          <span className="text-[11px] text-purple-600 font-medium">
                            Permite responder de manera inteligente cuando estás fuera
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="ai-assistant-toggle"
                          checked={settingsForm.aiAssistantEnabled}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, aiAssistantEnabled: e.target.checked }))}
                          className="w-4.5 h-4.5 text-purple-700 border-neutral-300 rounded focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {settingsForm.aiAssistantEnabled && (
                      <div className="space-y-3 pt-3 border-t border-purple-100/50">
                        <div>
                          <label className="block text-[10px] font-extrabold text-purple-900 uppercase tracking-wider mb-2">
                            Tono de voz de la IA
                          </label>
                          <select
                            value={settingsForm.aiAssistantTone}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, aiAssistantTone: e.target.value }))}
                            className="w-full px-4 py-2 border border-purple-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-neutral-800"
                          >
                            <option value="Amistoso, servicial y profesional">Amistoso, servicial y profesional (Recomendado)</option>
                            <option value="Muy formal y corporativo">Muy formal y corporativo</option>
                            <option value="Divertido, juvenil y entusiasta">Divertido, juvenil y entusiasta</option>
                            <option value="Minimalista y directo">Minimalista y directo</option>
                          </select>
                        </div>
                        <span className="block text-[10px] text-purple-500">
                          * Nota: El asistente se alimenta del inventario cargado en la tienda para brindar respuestas verídicas sobre precios, talle y disponibilidad.
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                <div className="border-t border-neutral-100 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4.5 h-4.5" />
                    <span>{isSavingSettings ? "Guardando..." : "Guardar Configuraciones"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
