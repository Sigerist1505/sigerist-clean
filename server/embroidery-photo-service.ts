// Embroidery Photo Service for Sigerist Luxury Bags
import { EMBROIDERY_IMAGES, type EmbroideryImage } from './whatsapp-media-service';

export interface EmbroideryPhoto {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  tags: string[];
}

class EmbroideryPhotoService {
  private photos: EmbroideryPhoto[] = [];

  constructor() {
    this.initializePhotos();
  }

  private initializePhotos(): void {
    // Convert embroidery images to photo format
    this.photos = Object.entries(EMBROIDERY_IMAGES).map(([key, embroidery]) => ({
      id: key,
      name: embroidery.name,
      imageUrl: embroidery.path,
      description: embroidery.description,
      category: embroidery.type,
      tags: [embroidery.type, 'bordado', 'lujo', 'personalizado']
    }));

    // Add additional embroidery photos
    this.photos.push(
      {
        id: 'luxury-gold',
        name: 'Bordado Dorado Premium',
        imageUrl: '/assets/embroidery/luxury-gold.jpg',
        description: 'Bordado en hilo dorado para máxima elegancia',
        category: 'premium',
        tags: ['dorado', 'premium', 'lujo', 'elegante']
      },
      {
        id: 'silver-accent',
        name: 'Detalles en Plata',
        imageUrl: '/assets/embroidery/silver-accent.jpg',
        description: 'Bordados con hilos plateados y acabados premium',
        category: 'premium',
        tags: ['plateado', 'premium', 'moderno', 'sofisticado']
      },
      {
        id: 'custom-logo',
        name: 'Logo Personalizado',
        imageUrl: '/assets/embroidery/custom-logo.jpg',
        description: 'Bordado de tu logo o diseño personalizado',
        category: 'custom',
        tags: ['personalizado', 'logo', 'empresa', 'único']
      }
    );
  }

  getAllPhotos(): EmbroideryPhoto[] {
    return this.photos;
  }

  getPhotosByCategory(category: string): EmbroideryPhoto[] {
    return this.photos.filter(photo => photo.category === category);
  }

  getPhotoById(id: string): EmbroideryPhoto | undefined {
    return this.photos.find(photo => photo.id === id);
  }

  searchPhotos(query: string): EmbroideryPhoto[] {
    const lowerQuery = query.toLowerCase();
    return this.photos.filter(photo => 
      photo.name.toLowerCase().includes(lowerQuery) ||
      photo.description.toLowerCase().includes(lowerQuery) ||
      photo.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getRandomPhotos(count: number = 3): EmbroideryPhoto[] {
    const shuffled = [...this.photos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getRecommendedPhotos(userPreferences?: string[]): EmbroideryPhoto[] {
    if (!userPreferences || userPreferences.length === 0) {
      return this.getRandomPhotos(4);
    }

    const recommended = this.photos.filter(photo =>
      userPreferences.some(pref =>
        photo.tags.includes(pref.toLowerCase()) ||
        photo.category === pref.toLowerCase()
      )
    );

    return recommended.length > 0 ? recommended : this.getRandomPhotos(4);
  }

  formatPhotoForWhatsApp(photo: EmbroideryPhoto): string {
    return `🎨 *${photo.name}*\n\n${photo.description}\n\n_Categoría: ${photo.category}_\n_Tags: ${photo.tags.join(', ')}_`;
  }

  formatMultiplePhotosForWhatsApp(photos: EmbroideryPhoto[]): string {
    if (photos.length === 0) {
      return 'No se encontraron bordados que coincidan con tu búsqueda.';
    }

    let message = '🎨 *Opciones de Bordado Disponibles:*\n\n';
    photos.forEach((photo, index) => {
      message += `${index + 1}. *${photo.name}*\n`;
      message += `   ${photo.description}\n\n`;
    });

    message += '¿Cuál te gusta más? Puedes elegir por número o nombre.';
    return message;
  }

  async sendEmbroideryPhotos(phoneNumber: string, message: string, language: string = 'es'): Promise<boolean> {
    try {
      console.log(`📸 Sending embroidery photos to ${phoneNumber}`);
      
      // Get relevant photos based on the message
      const searchResults = this.searchPhotos(message);
      const photosToSend = searchResults.length > 0 ? searchResults.slice(0, 4) : this.getRandomPhotos(4);
      
      // In a real implementation, this would send actual photos via WhatsApp API
      // For now, we'll just log the photos that would be sent
      console.log(`📸 Would send ${photosToSend.length} embroidery photos:`);
      photosToSend.forEach(photo => {
        console.log(`  - ${photo.name}: ${photo.imageUrl}`);
      });
      
      // Simulate successful photo sending
      return true;
    } catch (error) {
      console.error('Error sending embroidery photos:', error);
      return false;
    }
  }
}

export const embroideryPhotoService = new EmbroideryPhotoService();