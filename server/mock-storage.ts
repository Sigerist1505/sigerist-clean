// server/mock-storage.ts
// Enhanced in-memory storage for testing all functionality including cart and orders

import * as bcrypt from "bcryptjs";
import { 
  type Product, 
  type CartItem, 
  type InsertCartItem, 
  type Order, 
  type InsertOrder,
  type ContactMessage,
  type InsertContactMessage,
  type RegisteredUser,
  type InsertRegisteredUser
} from "@shared/schema";

interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

export class MockStorage {
  private users: User[] = [];
  private resetCodes: PasswordResetCode[] = [];
  private cartItems: CartItem[] = [];
  private orders: Order[] = [];
  private contactMessages: ContactMessage[] = [];
  private registeredUsers: RegisteredUser[] = [];
  private nextUserId = 1;
  private nextCartItemId = 1;
  private nextOrderId = 1;
  private nextContactId = 1;
  private nextRegisteredUserId = 1;

  constructor() {
    // Add a test user for demo purposes
    this.createTestUser();
  }

  private async createTestUser() {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('test123', saltRounds);
    
    this.users.push({
      id: this.nextUserId++,
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: hashedPassword,
    });
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getRegisteredUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createRegisteredUser(userData: InsertRegisteredUser): Promise<RegisteredUser> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.passwordHash, saltRounds);
    
    const newUser: RegisteredUser = {
      id: this.nextRegisteredUserId++,
      email: userData.email,
      passwordHash: hashedPassword,
      name: userData.name,
      phone: userData.phone || null,
      shippingAddress: userData.shippingAddress || null,
      createdAt: new Date()
    };

    this.registeredUsers.push(newUser);
    console.log(`✅ Mock: Created registered user #${newUser.id} - ${userData.email}`);
    return newUser;
  }

  async createPasswordResetCode(email: string, code: string): Promise<boolean> {
    try {
      // Remove any existing codes for this email
      this.resetCodes = this.resetCodes.filter(rc => rc.email.toLowerCase() !== email.toLowerCase());

      // Create new reset code with 15-minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      this.resetCodes.push({
        email: email.toLowerCase(),
        code,
        expiresAt,
        used: false,
      });

      return true;
    } catch (error) {
      console.error("Error creating password reset code:", error);
      return false;
    }
  }

  async validatePasswordResetCode(email: string, code: string): Promise<boolean> {
    try {
      const resetCode = this.resetCodes.find(rc => rc.email.toLowerCase() === email.toLowerCase());

      if (!resetCode) {
        return false;
      }

      // Check if code matches
      if (resetCode.code !== code) {
        return false;
      }

      // Check if code has been used
      if (resetCode.used) {
        return false;
      }

      // Check if code has expired
      if (new Date() > resetCode.expiresAt) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating password reset code:", error);
      return false;
    }
  }

  async updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPasswordHash, saltRounds);

      const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return false;
      }

      user.passwordHash = hashedPassword;

      // Mark the reset code as used
      const resetCode = this.resetCodes.find(rc => rc.email.toLowerCase() === email.toLowerCase());
      if (resetCode) {
        resetCode.used = true;
      }

      return true;
    } catch (error) {
      console.error("Error updating user password:", error);
      return false;
    }
  }

  // Mock implementations for cart and orders
  async getProducts(): Promise<Product[]> { 
    return [
      {
        id: 1,
        name: "Test Luxury Bag",
        description: "A beautiful test bag for demonstration",
        price: 50000,
        category: "luxury",
        imageUrl: "https://example.com/bag.jpg",
        blankImageUrl: "https://example.com/bag-blank.jpg", 
        referenceImageUrl: "https://example.com/bag-ref.jpg",
        animalType: null,
        colors: ["negro", "café"],
        inStock: true,
        variants: {},
        createdAt: new Date()
      }
    ]; 
  }

  async getCartItems(): Promise<CartItem[]> { 
    return this.cartItems; 
  }

  async getCartItemsBySession(sessionId: string): Promise<CartItem[]> {
    return this.cartItems.filter(item => item.sessionId === sessionId);
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const newItem: CartItem = {
      id: this.nextCartItemId++,
      sessionId: item.sessionId,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      personalization: item.personalization || null,
      embroideryColor: item.embroideryColor || null,
      embroideryFont: item.embroideryFont || null,
      customPreview: item.customPreview || null,
      addPompon: item.addPompon || false,
      addPersonalizedKeychain: item.addPersonalizedKeychain || false,
      addDecorativeBow: item.addDecorativeBow || false,
      addPersonalization: item.addPersonalization || false,
      expressService: item.expressService || false,
      keychainPersonalization: item.keychainPersonalization || null,
      addNameEmbroidery: item.addNameEmbroidery || false,
      hasBordado: item.hasBordado || false
    };
    
    this.cartItems.push(newItem);
    console.log(`✅ Mock: Added cart item #${newItem.id} for session ${item.sessionId}`);
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      console.log(`✅ Mock: Updated cart item #${id} quantity to ${quantity}`);
    }
    return item;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const index = this.cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      console.log(`✅ Mock: Removed cart item #${id}`);
      return true;
    }
    return false;
  }

  async clearCart(): Promise<void> {
    this.cartItems = [];
    console.log(`✅ Mock: Cleared all cart items`);
  }

  async clearCartBySession(sessionId: string): Promise<void> {
    const originalLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(item => item.sessionId !== sessionId);
    console.log(`✅ Mock: Cleared ${originalLength - this.cartItems.length} cart items for session ${sessionId}`);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      id: this.nextOrderId++,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || "pending",
      transactionId: orderData.transactionId || null,
      paymentReference: orderData.paymentReference || null,
      paymentMethod: orderData.paymentMethod || null,
      createdAt: new Date()
    };
    
    this.orders.push(newOrder);
    console.log(`✅ Mock: Created order #${newOrder.id} for ${orderData.customerEmail} - Total: $${orderData.total}`);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> { 
    return this.orders; 
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      id: this.nextContactId++,
      name: messageData.name,
      email: messageData.email,
      phone: messageData.phone || null,
      message: messageData.message,
      createdAt: new Date()
    };
    
    this.contactMessages.push(newMessage);
    console.log(`✅ Mock: Created contact message #${newMessage.id} from ${messageData.email}`);
    return newMessage;
  }

  async createRegisteredUserWithDiscount(
    user: InsertRegisteredUser,
    discount: { discountCode: string; expirationDate: string }
  ): Promise<RegisteredUser> {
    const newUser = await this.createRegisteredUser(user);
    console.log(`✅ Mock: Created user with discount code: ${discount.discountCode}`);
    return newUser;
  }

  async getRegisteredUsers(): Promise<RegisteredUser[]> {
    return this.registeredUsers;
  }

  async validateDiscountCode(_code: string): Promise<{ valid: boolean }> { 
    return { valid: false }; 
  }
}

export const mockStorage = new MockStorage();