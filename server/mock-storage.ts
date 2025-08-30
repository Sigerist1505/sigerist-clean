// server/mock-storage.ts
// Simple in-memory storage for testing authentication flow

import * as bcrypt from "bcryptjs";

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
  private nextUserId = 1;

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

  async createRegisteredUser(userData: {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
    shippingAddress?: string;
  }): Promise<User> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.passwordHash, saltRounds);
    
    const newUser: User = {
      id: this.nextUserId++,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: hashedPassword,
    };

    this.users.push(newUser);
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

  // Mock implementations for other required methods
  async getProducts() { return []; }
  async getCartItems() { return []; }
  async addCartItem() { return { id: 1, productId: 1, quantity: 1, customizations: null, sessionId: 'test' }; }
  async updateCartItem() { return true; }
  async removeCartItem() { return true; }
  async clearCart() { return true; }
  async getCartItemsBySession() { return []; }
  async clearCartBySession() { return true; }
  async createOrder() { return { id: 1, customerName: 'Test', customerEmail: 'test@test.com', customerPhone: '123', total: 100, shippingAddress: 'Test', status: 'pending', createdAt: new Date() }; }
  async getOrders() { return []; }
  async createContactMessage() { return { id: 1, name: 'Test', email: 'test@test.com', phone: '123', message: 'Test', createdAt: new Date() }; }
  async validateDiscountCode() { return { valid: false }; }
}

export const mockStorage = new MockStorage();