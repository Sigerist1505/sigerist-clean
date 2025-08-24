// WhatsApp Media Service for Sigerist Luxury Bags
import { readFileSync } from 'fs';
import { join } from 'path';

export interface EmbroideryImage {
  name: string;
  path: string;
  description: string;
  type: string;
}

export const EMBROIDERY_IMAGES: Record<string, EmbroideryImage> = {
  floral: {
    name: 'Bordado Floral',
    path: '/assets/embroidery/floral.jpg',
    description: 'Elegante diseño floral para bolsos de lujo',
    type: 'floral'
  },
  monogram: {
    name: 'Monograma Clásico',
    path: '/assets/embroidery/monogram.jpg', 
    description: 'Iniciales personalizadas en estilo clásico',
    type: 'monogram'
  },
  geometric: {
    name: 'Diseño Geométrico',
    path: '/assets/embroidery/geometric.jpg',
    description: 'Patrones geométricos modernos',
    type: 'geometric'
  },
  vintage: {
    name: 'Estilo Vintage',
    path: '/assets/embroidery/vintage.jpg',
    description: 'Bordados con toque vintage y elegante',
    type: 'vintage'
  }
};

export function detectEmbroideryType(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('floral') || lowerMessage.includes('flores')) {
    return 'floral';
  }
  if (lowerMessage.includes('monograma') || lowerMessage.includes('iniciales')) {
    return 'monogram';
  }
  if (lowerMessage.includes('geométrico') || lowerMessage.includes('moderno')) {
    return 'geometric';
  }
  if (lowerMessage.includes('vintage') || lowerMessage.includes('clásico')) {
    return 'vintage';
  }
  
  return null;
}

export function getEmbroideryImageBase64(embroideryType: string): string | null {
  try {
    const embroidery = EMBROIDERY_IMAGES[embroideryType];
    if (!embroidery) return null;
    
    // For now, return a placeholder base64 image
    // In production, this would load actual embroidery images
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  } catch (error) {
    console.error('Error loading embroidery image:', error);
    return null;
  }
}

export function createEmbroideryMessage(embroideryType: string): string {
  const embroidery = EMBROIDERY_IMAGES[embroideryType];
  if (!embroidery) {
    return 'Lo siento, no encontré ese tipo de bordado. Te puedo mostrar nuestros diseños disponibles: floral, monograma, geométrico y vintage.';
  }
  
  return `¡Excelente elección! 🎨 El ${embroidery.name} es perfecto para darle un toque único a tu bolso de lujo.\n\n${embroidery.description}\n\n¿Te gustaría ver más opciones de personalización o proceder con este diseño?`;
}