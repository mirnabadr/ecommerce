# 🛍️ Modern E-Commerce Platform

A full-stack, production-ready e-commerce application built with Next.js 15, featuring Stripe payment integration, real-time cart management, favorites system, and comprehensive order management.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=for-the-badge&logo=stripe)

## ✨ Features

### 🎯 Core Functionality
- **Product Catalog** - Browse products with advanced filtering (gender, size, color, brand, price)
- **Product Details Page** - Full product information with image gallery, variant selection, and reviews
- **Shopping Cart** - Real-time cart management with quantity controls
- **Favorites/Wishlist** - Save products for later with persistent storage
- **Order Management** - Complete order history with status tracking
- **Stripe Integration** - Secure payment processing with webhook support
- **User Authentication** - Secure authentication with Better Auth
- **Responsive Design** - Mobile-first, pixel-perfect UI at all breakpoints

### 🚀 Advanced Features
- **Server Actions** - Optimized data fetching with React Server Components
- **Suspense Boundaries** - Non-blocking loading states for reviews and recommendations
- **Database Relations** - Efficient queries using Drizzle ORM (no N+1 queries)
- **Type Safety** - End-to-end TypeScript with explicit return types
- **Error Handling** - Graceful error handling with custom Not Found pages
- **Image Optimization** - Next.js Image component with proper sizing

## 📸 Screenshots

### Homepage - Product Listings
![Homepage](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/homepage.png?raw=true)
*Clean, modern homepage showcasing latest products with "Add to Cart" and "Favorite" functionality*

### Product Details Page
![Product Details](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/product-details.png?raw=true)
*Comprehensive product page with image gallery, variant selection (color/size), and detailed information*

### Shopping Cart
![Shopping Cart](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/cart.png?raw=true)
*Shopping cart with quantity controls, order summary, and Stripe checkout integration*

### Favorites Page
![Favorites](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/favorites.png?raw=true)
*User favorites page displaying saved products with quick add-to-cart functionality*

### Orders Page
![Orders](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/orders.png?raw=true)
*Order history with status badges, delivery tracking, and order cancellation*

### Stripe Checkout
![Stripe Checkout](https://github.com/mirnabadr/ecommerce/blob/main/screenshots/stripe-checkout.png?raw=true)
*Secure Stripe payment checkout with multiple payment options*

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Server Components** - Server-side rendering
- **Suspense** - Loading states and code splitting
- **Lucide React** - Modern icon library

### Backend
- **Next.js Server Actions** - Type-safe server-side logic
- **Drizzle ORM** - TypeScript ORM with PostgreSQL
- **Better Auth** - Authentication solution
- **Stripe API** - Payment processing
- **PostgreSQL** - Relational database (Neon)

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL
- **Drizzle Kit** - Database migrations and schema management
- **Relations** - Optimized queries with proper joins

### Payment Processing
- **Stripe Checkout** - Hosted payment pages
- **Stripe Webhooks** - Payment event handling
- **Session Management** - Secure order tracking

## 🏗️ Architecture

### Project Structure
```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (root)/            # Main application routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Product listings & details
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── favorites/     # Favorites page
│   │   │   ├── profile/       # User profile & orders
│   │   │   └── orders/       # Order success/cancel
│   │   └── api/
│   │       └── stripe/        # Stripe webhook handler
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── ProductCard.tsx    # Product card component
│   │   ├── ProductGallery.tsx # Image gallery
│   │   ├── CartItemRow.tsx    # Cart item component
│   │   ├── OrderCard.tsx      # Order display component
│   │   └── ...
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   │   ├── product.ts     # Product operations
│   │   │   ├── cart.ts        # Cart operations
│   │   │   ├── favorites.ts   # Favorites operations
│   │   │   └── orders.ts      # Order operations
│   │   ├── db/                # Database configuration
│   │   │   ├── schema/        # Drizzle schemas
│   │   │   └── seed.ts        # Database seeding
│   │   ├── auth/              # Authentication
│   │   └── stripe.ts          # Stripe integration
│   └── store/                 # State management
│       └── useStore.ts         # Zustand store
├── drizzle/                   # Database migrations
├── public/                     # Static assets
└── .env.local                  # Environment variables
```

### Database Schema
- **Products** - Product information with variants
- **Product Variants** - Color, size, price, stock
- **Product Images** - Image URLs with variant associations
- **Orders** - Order tracking with Stripe session IDs
- **Order Items** - Individual order line items
- **Cart Items** - Shopping cart persistence
- **Wishlists** - User favorites
- **Users** - User accounts and authentication
- **Reviews** - Product reviews and ratings

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mirnabadr/ecommerce.git
   cd ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file with:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string
   
   # Authentication
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=http://localhost:3000
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Set up Stripe webhooks** (for local development)
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate migration files |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database |

## 🎨 Key Features Explained

### Product Management
- **Advanced Filtering** - Filter by gender, size, color, brand, category, and price range
- **Search Functionality** - Search products by name or description
- **Sorting** - Sort by price (low to high, high to low) or newest
- **Product Variants** - Handle multiple colors and sizes per product
- **Image Gallery** - Variant-specific images with thumbnail navigation

### Shopping Cart
- **Persistent Cart** - Cart persists across sessions (user or guest)
- **Quantity Management** - Increase/decrease quantities with real-time updates
- **Price Calculation** - Automatic subtotal and total calculation
- **Stock Management** - Display availability status

### Order Processing
- **Stripe Integration** - Secure payment processing
- **Order Tracking** - Track orders from pending to delivered
- **Order Cancellation** - Cancel pending orders
- **Email Notifications** - Ready for email integration

### User Experience
- **Favorites System** - Save products for later
- **Order History** - View all past orders with details
- **Responsive Design** - Works perfectly on all devices
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - Graceful error messages

## 🔒 Security Features

- **Server Actions** - All sensitive operations on the server
- **Type Safety** - TypeScript throughout the application
- **Input Validation** - Zod schemas for data validation
- **SQL Injection Prevention** - Drizzle ORM parameterized queries
- **Stripe Webhook Verification** - Signature verification for webhooks
- **Authentication** - Secure user authentication with Better Auth

## 🧪 Testing the Application

### Test Payment Flow
1. Add products to cart
2. Go to `/cart` and review items
3. Click "Checkout with Stripe"
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. Verify order appears in `/profile/orders`

### Test Favorites
1. Click heart icon on any product
2. Check navbar - should show favorites count
3. Click favorites icon to view saved items
4. Add favorites to cart directly

## 📚 Documentation

- [Authentication Setup](./AUTH_SETUP.md)
- [Database Migrations](./MIGRATION_GUIDE.md)
- [Stripe Integration](./STRIPE_SETUP.md)
- [Webhook Setup](./WEBHOOK_SETUP.md)

## 🚢 Deployment

### Recommended Platforms
- **Vercel** - Optimized for Next.js (recommended)
- **Netlify** - Great alternative
- **Railway** - Full-stack deployment

### Environment Variables
Make sure to set all environment variables in your deployment platform:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL`

### Stripe Webhook Setup
1. Create webhook endpoint in Stripe Dashboard
2. Set URL to: `https://yourdomain.com/api/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy signing secret to environment variables

## 🎯 Future Enhancements

- [ ] Email notifications for orders
- [ ] Product reviews and ratings system
- [ ] Advanced search with filters
- [ ] Product recommendations based on purchase history
- [ ] Multi-currency support
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Customer support chat

## 👨‍💻 Developer

**Mirna Badr**

- GitHub: [@mirnabadr](https://github.com/mirnabadr)
- Portfolio: myportfolioo-mirna.vercel.app/
- LinkedIn: https://www.linkedin.com/in/mirna-b-ibrahim/

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Better Auth](https://www.better-auth.com/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

⭐ **Star this repo if you find it helpful!**
