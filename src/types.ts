export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'ropa' | 'zapatos';
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  aiAssistantEnabled: boolean;
  aiAssistantTone: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'owner' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  unread?: boolean;
}

export interface DatabaseSchema {
  settings: StoreSettings;
  products: Product[];
  chats: ChatSession[];
}
