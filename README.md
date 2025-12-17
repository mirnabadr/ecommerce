# Next.js E-commerce Website

A modern e-commerce application built with Next.js 15, TypeScript, and a comprehensive tech stack.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **ESLint** - Code linting and quality
- **Tailwind CSS** - Utility-first CSS framework
- **Better Auth** - Authentication solution
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Drizzle ORM** - TypeScript ORM for database operations
- **Zustand** - Lightweight state management

## Features

- Product catalog with Nike sample data
- Database-driven product listings
- Shopping cart functionality (Zustand)
- Responsive design with Tailwind CSS
- Type-safe database queries with Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (get one free at [neon.tech](https://neon.tech))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - A random secret key (generate with `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` - Your app URL (e.g., `http://localhost:3000`)

3. **Set up the database:**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with Nike products
   npm run db:seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed database with sample Nike products

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Homepage with product listings
│   │   └── layout.tsx    # Root layout
│   ├── db/               # Database configuration
│   │   ├── index.ts      # Database connection
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── seed.ts       # Database seeding script
│   ├── lib/              # Utility libraries
│   │   └── auth.ts       # Better Auth configuration
│   └── store/            # State management
│       └── useStore.ts   # Zustand store
├── drizzle/              # Generated migration files
└── public/               # Static assets
```

## Database Schema

The application includes a `products` table with the following fields:
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price (decimal)
- `image` - Product image URL
- `category` - Product category
- `brand` - Product brand (Nike)
- `stock` - Available stock quantity
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

## Next Steps

1. Set up your Neon PostgreSQL database and update the `DATABASE_URL` in `.env.local`
2. Run the database migrations and seed script
3. Customize the product data and add more features
4. Configure Better Auth for user authentication
5. Deploy to production (Vercel recommended)

## License

MIT

