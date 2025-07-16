# Web3 ETH Holders Matchmaking Platform

## Overview

This is a Web3-native matchmaking platform that connects ETH holders with liquidity seekers through a marketplace interface. The platform allows ETH holders to showcase their wallet assets in a public table, while protocols, LPs, and founders can post offers and incentives to attract liquidity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application uses a monorepo structure with clear separation of concerns:
- **Frontend**: React-based SPA in the `client/` directory
- **Backend**: Express.js API server in the `server/` directory
- **Shared**: Common types and database schema in the `shared/` directory
- **Database**: PostgreSQL with Drizzle ORM for schema management

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query for server state
- **UI Framework**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Web3**: MetaMask integration for wallet connectivity

## Key Components

### Frontend Architecture
- **Component Library**: Full shadcn/ui implementation with dark/light theme support
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Wallet Integration**: Custom hooks for MetaMask wallet connection
- **UI Components**: 
  - `MarketplaceTable`: Main data table showing wallet listings
  - `FilterBar`: Search and filtering controls
  - `StatsBar`: Marketplace statistics display
  - `OfferModal`: Modal for creating offers to wallet holders
  - `WalletConnection`: Wallet connection interface

### Backend Architecture
- **API Routes**: RESTful endpoints for wallets, offers, and marketplace stats
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Storage Pattern**: Repository pattern with `DatabaseStorage` class
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request/response logging with performance metrics

### Database Schema
- **Users**: Basic user authentication (username/password)
- **Wallets**: Core wallet data including:
  - Ethereum address
  - Asset balances (ETH, stETH, rETH, cbETH)
  - LRT token balances (JSON field)
  - USD value calculations
  - User preferences and contact settings
- **Offers**: Marketplace offers with:
  - Target wallet relationships
  - Offer types (cash, tokens, NFT, IRL perks)
  - Expiry dates and acceptance tracking
  - Contact information and terms
- **Messages**: Communication between users

## Data Flow

1. **Wallet Connection**: Users connect MetaMask wallet via Web3 integration
2. **Asset Detection**: Platform automatically detects wallet assets and balances
3. **Marketplace Listing**: Wallets appear in searchable/filterable table
4. **Offer Creation**: Liquidity seekers create targeted offers through modal interface
5. **Notification System**: Email alerts for opted-in wallet holders
6. **Offer Management**: Tracking of offer status, acceptance, and expiry

## External Dependencies

### Web3 Integration
- MetaMask wallet connection for address verification
- Ethereum balance querying
- Future integration with DeFi protocols for asset balance detection

### Database
- Neon serverless PostgreSQL for scalable data storage
- Connection pooling for optimal performance

### UI/UX
- Radix UI primitives for accessibility
- Tailwind CSS for responsive styling
- shadcn/ui for consistent component design

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- TSX for running TypeScript backend in development
- Environment variable configuration for database connection

### Production Build
- Vite build for optimized frontend bundle
- esbuild for backend compilation to ESM
- Static file serving integrated with Express

### Database Management
- Drizzle migrations in `migrations/` directory
- Schema definition in `shared/schema.ts`
- Push command for development schema updates

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Replit-specific optimizations and banner integration
- Development vs production environment handling

The platform is designed to be a comprehensive Web3 marketplace where ETH holders can monetize their liquidity while providing protocols with direct access to potential users through a transparent, incentive-driven system.