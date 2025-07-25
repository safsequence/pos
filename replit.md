# ZnForge POS System

## Overview

ZnForge POS is a full-stack Point of Sale application built with modern web technologies. It's designed for small to medium businesses to manage sales transactions, inventory, customers, and generate reports. The system features a multi-tenant architecture where each business operates independently with their own users, products, and data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for consistent theming
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

**Rationale**: This modern React stack provides excellent developer experience with type safety throughout. Radix UI ensures accessibility compliance, while TanStack Query handles complex server state synchronization automatically. Vite offers blazing-fast development builds and optimized production bundles.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Neon serverless driver for scalable cloud hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Session Management**: express-session with PostgreSQL session store for persistence
- **Development**: tsx for direct TypeScript execution with hot reloading

**Rationale**: Express provides a mature, battle-tested foundation for REST APIs. Drizzle ORM offers excellent TypeScript integration while remaining lightweight and performant. PostgreSQL provides robust data consistency and complex query capabilities needed for business operations.

## Key Components

### Authentication System
- Session-based authentication using express-session with PostgreSQL storage
- Multi-tenant security with business-scoped access control
- Role-based permissions (admin, manager, employee)
- Registration flow that creates both business entity and admin user account

### Database Schema
The application uses a comprehensive multi-tenant schema:
- **Multi-tenancy**: All data is scoped to business entities for complete isolation
- **User Management**: Role-based user system with business-specific accounts
- **Product Catalog**: Hierarchical categories with detailed product information and inventory tracking
- **Customer Management**: Customer profiles with contact information and loyalty points
- **Transaction Processing**: Complete sales transaction handling with itemized line items
- **Audit Trail**: Comprehensive timestamps and user tracking for compliance

### Core Business Features
- **Point of Sale**: Real-time transaction processing with tax calculations
- **Inventory Management**: Stock tracking with low-stock alerts and category organization
- **Customer Management**: Customer database with purchase history and loyalty programs
- **Employee Management**: User accounts with role-based access control
- **Reporting**: Sales analytics and business intelligence dashboards
- **Settings**: Business configuration and system preferences

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Server validates against business-scoped user database
3. Session created and stored in PostgreSQL
4. Client receives authentication status and user context
5. All subsequent requests include session validation

### Transaction Processing Flow
1. Cashier scans/selects products in POS interface
2. Real-time inventory availability checks
3. Tax calculations applied based on business settings
4. Payment processing (future Stripe integration planned)
5. Transaction recorded with complete audit trail
6. Inventory levels automatically updated
7. Customer loyalty points updated if applicable

### Multi-tenant Data Access
1. All database queries include businessId filter
2. Session middleware validates user belongs to business
3. ORM enforces business-scoped data access
4. Complete data isolation between businesses

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud database access
- **drizzle-orm**: Type-safe ORM with excellent TypeScript integration
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Powerful data fetching and state management
- **express-session**: Secure session management with PostgreSQL persistence

### Payment Processing (Planned)
- **@stripe/stripe-js**: Client-side Stripe integration for payment processing
- **@stripe/react-stripe-js**: React components for Stripe Elements

### Development Tools
- **tsx**: TypeScript execution for development server
- **vite**: Modern build tool with hot module replacement
- **tailwindcss**: Utility-first CSS framework
- **zod**: Runtime type validation for forms and API endpoints

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- tsx for TypeScript execution without compilation step
- Express API server with automatic restarts
- PostgreSQL database with migration support via Drizzle

### Production Build Process
1. Vite builds optimized client bundle
2. esbuild compiles server TypeScript to JavaScript
3. Static assets served from Express server
4. Database migrations applied via Drizzle Kit
5. Environment variables configure database and session secrets

### Database Management
- Drizzle migrations for schema versioning
- Connection pooling via Neon serverless driver
- Session storage in dedicated PostgreSQL table
- Automatic reconnection and error handling

### Security Considerations
- Session-based authentication with secure cookies
- Business-scoped data access controls
- Input validation using Zod schemas
- SQL injection protection via parameterized queries
- CORS configuration for API access