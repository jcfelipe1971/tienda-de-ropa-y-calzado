import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { promises as fs } from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { DatabaseSchema, Product, StoreSettings, ChatSession, ChatMessage } from "./src/types";

// Setup Google Gen AI (lazy loaded)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

const DB_PATH = path.resolve(process.cwd(), "db.json");

const INITIAL_DB: DatabaseSchema = {
  settings: {
    storeName: "Arnielys & Juank • Nueva Moda",
    whatsappNumber: "5352943409", // Cuban number requested by user
    whatsappTemplate: "¡Hola! Me interesa comprar el producto *{name}* (Precio: *{price}*, Talla: *{size}*, Color: *{color}*). ¿Está disponible?",
    aiAssistantEnabled: false,
    aiAssistantTone: "Amistoso, servicial y profesional"
  },
  products: [
    {
      id: "prod-1",
      name: "Chaqueta de Cuero Vintage",
      description: "Chaqueta clásica de cuero genuino envejecido con detalles de cremallera metálica y forro interior suave. Una prenda atemporal para cualquier ocasión que combina elegancia y resistencia.",
      category: "ropa",
      price: 129.99,
      images: ["imagenes/articulo1.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Marrón"],
      stock: 8,
      featured: true
    },
    {
      id: "prod-2",
      name: "Tenis Urban Comfort",
      description: "Zapatos deportivos ultra cómodos con suela de espuma viscoelástica de doble densidad. Ideales para caminatas largas y uso casual diario con máxima amortiguación y soporte.",
      category: "zapatos",
      price: 79.99,
      images: ["imagenes/articulo2.png"],
      sizes: ["38", "39", "40", "41", "42", "43"],
      colors: ["Rojo", "Negro", "Blanco"],
      stock: 14,
      featured: true
    },
    {
      id: "prod-3",
      name: "Sudadera Oversize Minimalista",
      description: "Sudadera con capucha confeccionada en algodón orgánico pesado. Corte holgado moderno con puños acanalados y bolsillo canguro frontal de alta durabilidad.",
      category: "ropa",
      price: 49.99,
      images: ["imagenes/articulo3.png"],
      sizes: ["M", "L", "XL"],
      colors: ["Gris", "Beige", "Verde Oliva"],
      stock: 20,
      featured: false
    },
    {
      id: "prod-4",
      name: "Botas de Cuero Clásicas",
      description: "Botas robustas hechas a mano con cuero resistente al agua. Suela dentada antideslizante de larga duración, cordones encerados premium y costuras reforzadas.",
      category: "zapatos",
      price: 110.00,
      images: ["imagenes/articulo4.png"],
      sizes: ["39", "40", "41", "42", "43"],
      colors: ["Marrón Oscuro", "Negro"],
      stock: 6,
      featured: true
    },
    {
      id: "prod-5",
      name: "Pantalones Cargo Urbanos",
      description: "Pantalones con múltiples bolsillos de carga reforzados, fabricados en lona de algodón duradera y rodillas preformadas para máxima flexibilidad urbana.",
      category: "ropa",
      price: 64.99,
      images: ["imagenes/articulo5.png"],
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Verde Militar", "Negro", "Kaki"],
      stock: 12,
      featured: false
    },
    {
      id: "prod-6",
      name: "Vestido Elegante de Lino",
      description: "Vestido midi de verano ligero y transpirable, confeccionado con lino de primera calidad. Tirantes ajustables y espalda elástica para un calce perfecto.",
      category: "ropa",
      price: 74.99,
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Blanco", "Azul Celeste", "Amarillo Pastel"],
      stock: 10,
      featured: true
    },
    {
      id: "prod-7",
      name: "Sandalias Sol de Verano",
      description: "Sandalias con correas de cuero suave y plantilla anatómica de corcho natural. Perfectas para mantener el confort y la elegancia en los días más calurosos.",
      category: "zapatos",
      price: 45.00,
      images: ["https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80"],
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Miel", "Marrón", "Blanco"],
      stock: 18,
      featured: false
    },
    {
      id: "prod-8",
      name: "Camiseta Algodón Orgánico",
      description: "Camiseta básica premium de cuello redondo y manga corta. Tejido suave, ecológico y altamente transpirable para combinar de forma ideal en cualquier look.",
      category: "ropa",
      price: 24.99,
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Blanco", "Gris", "Azul Marino", "Negro"],
      stock: 25,
      featured: false
    },
    {
      id: "prod-9",
      name: "Zapatos Oxford Formales",
      description: "Zapatos de vestir clásicos estilo Oxford fabricados con fina piel de becerro pulida a mano y costuras reforzadas. Elegancia indiscutible para eventos formales.",
      category: "zapatos",
      price: 135.00,
      images: ["https://images.unsplash.com/photo-1486308512493-ae6a1e949c18?w=600&auto=format&fit=crop&q=80"],
      sizes: ["39", "40", "41", "42", "43", "44"],
      colors: ["Negro", "Café"],
      stock: 5,
      featured: true
    },
    {
      id: "prod-10",
      name: "Zapatillas de Correr Nebula",
      description: "Zapatillas ultraligeras de entrenamiento con tecnología de tejido transpirable de malla 3D y suela de amortiguación de rebote dinámico.",
      category: "zapatos",
      price: 89.99,
      images: ["https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&auto=format&fit=crop&q=80"],
      sizes: ["37", "38", "39", "40", "41", "42", "43"],
      colors: ["Azul Eléctrico", "Gris Ceniza"],
      stock: 11,
      featured: false
    }
  ],
  chats: []
};

// Database read/write helpers
async function readDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    
    // Explicit override as requested by the user
    parsed.settings.whatsappNumber = "5352943409";
    parsed.settings.aiAssistantEnabled = false;
    if (!parsed.settings.storeName || parsed.settings.storeName === "Vogue & Walk") {
      parsed.settings.storeName = "Arnielys & Juank • Nueva Moda";
    }
    
    return parsed;
  } catch (err) {
    await writeDb(INITIAL_DB);
    return INITIAL_DB;
  }
}

async function writeDb(db: DatabaseSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

const app = new Hono();
app.use("*", logger());
app.use("/api/*", cors());

// Health Check API
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Get full database
app.get("/api/db", async (c) => {
  const db = await readDb();
  return c.json(db);
});

// Update settings
app.put("/api/settings", async (c) => {
  const body = await c.req.json<StoreSettings>();
  const db = await readDb();
  db.settings = { ...db.settings, ...body };
  await writeDb(db);
  return c.json({ success: true, settings: db.settings });
});

// Create/Update product
app.post("/api/products", async (c) => {
  const body = await c.req.json<Product>();
  const db = await readDb();
  
  if (body.id) {
    const index = db.products.findIndex(p => p.id === body.id);
    if (index !== -1) {
      db.products[index] = body;
    } else {
      db.products.push(body);
    }
  } else {
    body.id = "prod-" + Date.now();
    db.products.push(body);
  }
  
  await writeDb(db);
  return c.json({ success: true, product: body });
});

// Delete product
app.delete("/api/products/:id", async (c) => {
  const id = c.req.param("id");
  const db = await readDb();
  db.products = db.products.filter(p => p.id !== id);
  await writeDb(db);
  return c.json({ success: true });
});

// Get all chats
app.get("/api/chats", async (c) => {
  const db = await readDb();
  return c.json(db.chats);
});

// Create/Retrieve chat session by customerName
app.post("/api/chats", async (c) => {
  const { customerName } = await c.req.json<{ customerName: string }>();
  const db = await readDb();
  
  let chat = db.chats.find(ch => ch.customerName.toLowerCase() === customerName.toLowerCase());
  
  if (!chat) {
    chat = {
      id: "chat-" + Date.now(),
      customerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "msg-welcome",
          sender: "owner",
          text: `¡Hola ${customerName}! Bienvenido a nuestra tienda. ¿En qué podemos ayudarte hoy con nuestra ropa y zapatos?`,
          timestamp: new Date().toISOString()
        }
      ],
      unread: false
    };
    db.chats.push(chat);
    await writeDb(db);
  }
  
  return c.json(chat);
});

// Post a message in a chat
app.post("/api/chats/:chatId/messages", async (c) => {
  const chatId = c.req.param("chatId");
  const { sender, text } = await c.req.json<{ sender: "customer" | "owner"; text: string }>();
  const db = await readDb();
  
  const chatIndex = db.chats.findIndex(ch => ch.id === chatId);
  if (chatIndex === -1) {
    return c.json({ error: "Chat no encontrado" }, 404);
  }
  
  const chat = db.chats[chatIndex];
  const newMessage: ChatMessage = {
    id: "msg-" + Date.now(),
    sender,
    text,
    timestamp: new Date().toISOString()
  };
  
  chat.messages.push(newMessage);
  chat.updatedAt = new Date().toISOString();
  
  if (sender === "customer") {
    chat.unread = true; // Mark as unread for the owner
  } else {
    chat.unread = false; // Mark as read when owner replies
  }
  
  await writeDb(db);
  
  // Trigger Gemini AI Reply if enabled, client-key is present and sender is customer
  const ai = getGeminiClient();
  if (sender === "customer" && db.settings.aiAssistantEnabled && ai) {
    try {
      const productsListString = db.products
        .map(p => `- [ID: ${p.id}] ${p.name} (${p.category === "ropa" ? "Ropa" : "Zapatos"}): $${p.price}. Descripción: ${p.description}. Colores: ${p.colors.join(", ")}. Tallas: ${p.sizes.join(", ")}. Stock: ${p.stock} unidades.`)
        .join("\n");
        
      const chatHistoryString = chat.messages
        .slice(-8) // Take last 8 messages for context
        .map(m => `${m.sender === "customer" ? "Cliente" : m.sender === "ai" ? "Asistente AI" : "Dueño"}: ${m.text}`)
        .join("\n");

      const systemPrompt = `Actúas como un asistente inteligente de ventas de la tienda "${db.settings.storeName}".
Tu objetivo es ayudar a los clientes con información de nuestro catálogo de ropa y zapatos.
Sé amable, servicial y breve (máximo 2 párrafos de respuesta).
Tono solicitado: ${db.settings.aiAssistantTone || "Amistoso y profesional"}.

Aquí está nuestro inventario actual:
${productsListString}

Configuraciones:
- WhatsApp de contacto: ${db.settings.whatsappNumber}
- Mensaje predeterminado de compra: ${db.settings.whatsappTemplate}

Directrices de respuesta:
1. Si preguntan por ropa o zapatos específicos, brinda detalles de precio, tallas y colores disponibles.
2. Si el cliente quiere comprar, dile que puede seleccionar el producto en la tienda y dar clic en el botón de WhatsApp para contactar directamente al dueño, o que puede escribirle al número ${db.settings.whatsappNumber}.
3. Si preguntan algo que no corresponde al catálogo o es una duda compleja, indícales amablemente que el dueño de la tienda se comunicará con ellos en breve para ayudarles de forma personalizada.
4. NUNCA inventes productos que no estén en la lista anterior.

Historial de conversación:
${chatHistoryString}

Responde directamente al último mensaje del cliente como el Asistente AI (en primera persona, representando a la tienda):`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          temperature: 0.7,
        }
      });
      
      const aiReplyText = response.text || "Gracias por tu mensaje. El dueño de la tienda revisará esto pronto.";
      
      const aiMessage: ChatMessage = {
        id: "msg-ai-" + Date.now(),
        sender: "ai",
        text: aiReplyText.trim(),
        timestamp: new Date().toISOString()
      };
      
      chat.messages.push(aiMessage);
      chat.updatedAt = new Date().toISOString();
      await writeDb(db);
    } catch (err) {
      console.error("Error invoking Gemini:", err);
    }
  }
  
  return c.json(chat);
});

// Run Vite in development or Serve Static in production
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { port: 3001, hmr: false },
      appType: "spa"
    });
    await vite.listen();
    console.log("Vite Development Server launched on http://localhost:3001");
    
    // Proxy catch-all for Hono -> Vite dev server
    app.all("*", async (c) => {
      const url = new URL(c.req.url);
      if (url.pathname.startsWith("/api")) {
        return c.json({ error: "No api found" }, 404);
      }
      
      const targetUrl = `http://localhost:3001${url.pathname}${url.search}`;
      try {
        const response = await fetch(targetUrl, {
          method: c.req.method,
          headers: c.req.header(),
          body: c.req.method !== "GET" && c.req.method !== "HEAD" ? await c.req.arrayBuffer() : undefined
        });
        
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        
        return c.body(response.body, response.status as any, headers);
      } catch (error) {
        return c.text("Espere mientras el servidor de desarrollo se inicia...", 503);
      }
    });
  } else {
    // Serve static dist folder in production
    app.use("*", serveStatic({ root: "./dist" }));
    app.get("*", async (c) => {
      try {
        const html = await fs.readFile(path.join(process.cwd(), "dist/index.html"), "utf-8");
        return c.html(html);
      } catch (err) {
        return c.text("Frontend build not found. Please build the application.", 404);
      }
    });
  }

  // Start Hono Node Server
  const PORT = 3000;
  serve({
    fetch: app.fetch,
    port: PORT
  }, (info) => {
    console.log(`Hono backend unified server running on port ${info.port}`);
  });
}

main().catch(err => {
  console.error("Failed to start server:", err);
});
