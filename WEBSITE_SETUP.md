# 🌟 sigeristluxurybags.com - Website Setup Guide

This repository contains the complete e-commerce website for **Sigerist Luxury Bags** - a premium luxury handbag brand with AI-powered WhatsApp chatbot and personalized embroidery services.

## 🚀 Website Features

- **💎 Luxury E-commerce Platform**: Complete online store for premium handbags
- **🎨 Personalized Embroidery**: Custom embroidery designs with real-time preview
- **🤖 AI WhatsApp Chatbot**: Intelligent customer service using Anthropic Claude
- **💳 Payment Integration**: Stripe + Wompi (Colombia) payment processing
- **📱 Mobile-First Design**: Responsive design optimized for all devices
- **🔍 SEO Optimized**: Meta tags and Open Graph optimization
- **⚡ Production Ready**: Optimized for Railway deployment

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL (Neon recommended)
- **AI**: Anthropic Claude for WhatsApp chatbot
- **Payments**: Stripe + Wompi
- **Deployment**: Railway + Docker

## 📋 Quick Setup

### 1. Clone and Install
```bash
git clone https://github.com/Sigerist1505/sigerist-clean.git
cd sigerist-clean
npm install
```

### 2. Environment Variables
Copy `.env.template` to `.env` and configure:
```bash
cp .env.template .env
# Edit .env with your values
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random secret for sessions
- `NODE_ENV`: Set to "production" for deployment

Optional (for full functionality):
- `ANTHROPIC_API_KEY`: For AI WhatsApp chatbot
- `STRIPE_SECRET_KEY`: For payment processing
- `WOMPI_PRIVATE_KEY`: For Colombian payments

### 3. Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Production Build
```bash
npm run build
npm start
```

## 🚂 Railway Deployment

The website is fully configured for Railway deployment:

1. **Connect GitHub**: Link your Railway account to this repository
2. **Set Environment Variables**: Add required variables in Railway dashboard
3. **Deploy**: Railway will automatically build and deploy

### Required Railway Variables:
```env
NODE_ENV=production
DATABASE_URL=postgresql://... 
SESSION_SECRET=your-secret-key
PORT=3000
```

### Health Check
Railway will monitor: `https://your-app.railway.app/api/health`

## 🌐 Domain Setup

The website is configured for **sigeristluxurybags.com**:

1. **Point DNS**: Configure your domain to point to Railway
2. **SSL**: Railway provides automatic SSL certificates
3. **Custom Domain**: Add sigeristluxurybags.com in Railway dashboard

## 🎨 Key Features

### Product Catalog
- **Premium Handbags**: Luxury collection with detailed descriptions
- **Real-time Customization**: Live preview of embroidery designs
- **Shopping Cart**: Full e-commerce functionality
- **Responsive Gallery**: Mobile-optimized product images

### AI WhatsApp Integration
- **Intelligent Responses**: Natural language processing
- **Product Recommendations**: Personalized suggestions
- **Order Support**: Automated customer service
- **Multilingual**: Spanish, English, German support

### Payment Processing
- **Stripe Integration**: International credit/debit cards
- **Wompi Integration**: Colombian payment methods
- **Secure Checkout**: PCI compliant payment processing
- **Order Management**: Complete order tracking

## 📱 Mobile Experience

- **PWA Ready**: Progressive web app capabilities
- **Touch Optimized**: Smooth mobile interactions
- **Fast Loading**: Optimized images and code splitting
- **Offline Support**: Service worker for offline browsing

## 🔒 Security Features

- **HTTPS Enforced**: Secure connections only
- **Session Management**: Secure user sessions
- **Input Validation**: Protected against common attacks
- **Environment Secrets**: Secure configuration management

## 📊 Analytics & SEO

- **Open Graph**: Social media sharing optimization
- **Meta Tags**: Search engine optimization
- **Schema.org**: Structured data for rich snippets
- **Google Analytics Ready**: Easy integration setup

## 🛡️ Production Checklist

- [x] TypeScript compilation passes
- [x] Production build successful
- [x] Environment variables template created
- [x] Railway configuration optimized
- [x] Domain references updated
- [x] SSL/HTTPS ready
- [x] Health checks configured
- [x] Error handling implemented

## 🆘 Support

For technical support or customization:
- **Email**: dev@sigeristluxurybags.com
- **WhatsApp**: +57 316 018 3418
- **Issues**: GitHub issues in this repository

---

**🎉 Your luxury e-commerce website is ready for sigeristluxurybags.com!**