# Shipping Timeline Calculator

## Overview

A React-based shipping timeline calculator that displays a countdown timer and delivery date estimates for various shipping speeds. The application helps users understand when their orders will arrive based on different shipping options, accounting for business days, weekends, and shipping holidays.

The project uses a modern TypeScript stack with React for the frontend, Express for the backend server, and is configured to use Drizzle ORM with PostgreSQL for data persistence (though database features are not yet implemented).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design follows Material Design principles with emphasis on clarity and data-forward presentation
- Typography uses Inter or DM Sans font families for clean, professional appearance

**State Management**
- React hooks for local component state
- TanStack Query (React Query) for server state management and data fetching
- Custom hooks for reusable logic (mobile detection, toast notifications)

**Key Design Decisions**
- Component-based architecture with reusable UI primitives in `/client/src/components/ui`
- Path aliases configured for clean imports (`@/` for client source, `@shared/` for shared code)
- Countdown timer updates in real-time using useEffect and setInterval
- Date calculations performed client-side with timezone conversion to America/New_York

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- HTTP server creation using Node's native `http` module
- Middleware stack includes JSON body parsing with raw body preservation for webhook support

**Development Features**
- Custom Vite middleware integration for SSR-style development
- Request/response logging middleware with timing information
- Development-only Replit plugins for enhanced DX (cartographer, dev banner, error overlay)

**API Design** (Currently Minimal)
- RESTful API structure with `/api` prefix convention
- Routes registered through centralized `registerRoutes` function
- Storage abstraction layer for future database integration

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless` driver
- Schema definitions in `/shared/schema.ts` using Drizzle's declarative API
- Zod integration via `drizzle-zod` for runtime validation
- Migration files stored in `/migrations` directory

**Current Implementation**
- In-memory storage implementation (`MemStorage` class) as placeholder
- Interface-based storage abstraction (`IStorage`) for easy database swapping
- User model with username/password authentication schema defined but not actively used

**Design Rationale**
- Separation of storage interface from implementation allows switching between in-memory and PostgreSQL without changing business logic
- Schema-first approach ensures type safety between database and application code

### Business Logic

**Shipping Calculation Algorithm**
- Cutoff time: 12:00 PM EST for same-day processing
- Orders after cutoff ship next business day
- Skips weekends (Saturday/Sunday) and predefined shipping holidays
- Calculates delivery dates by adding business days to ship date
- Multiple shipping speed options: 8-10 days, 5-7 days, 3-4 days, 2 days, overnight

**Date/Time Handling**
- User's local time converted to Eastern Time (America/New_York) for consistent cutoff calculations
- Date arithmetic accounts for month boundaries and leap years via native Date API
- Shipping holidays defined at top of component (Nov 27 2025, Dec 25 2025, Jan 1 2026) - easily updatable
- Holiday asterisk system: delivery dates affected by holidays show '*' with message at bottom

**Countdown Timer**
- Calculates time remaining until next 12 PM EST cutoff
- Updates every second for real-time display
- Pluralization logic for time unit labels (day/days, hour/hours, etc.)
- Automatic reset with fade animation when countdown reaches zero
- Rollover detection: When cutoff passes (noon or after weekend/holiday), all UI elements (countdown, cutoff date, delivery dates) refresh together in lockstep
- Simplified display: Multi-day countdowns show only "Days" (e.g., "3 Days"), same-day shows full breakdown (e.g., "12 Hours 30 Minutes 15 Seconds")
- Uses single source of truth (nextShippingCutoff) to prevent "total never goes negative" bug that previously blocked UI refreshes

**Reverse Lookup Feature (Date Picker)**
- Collapsible accordion below timeline allows users to select target delivery date
- Algorithm counts business days from ship date to target (skipping weekends and holidays)
- Recommends slowest (cheapest) shipping option that guarantees on-time delivery
- Logic: Filters options where maxDays <= businessDaysNeeded, then selects slowest
- Example: If target is 3 business days away, recommends "2 Day" (not "3-4 Day" which takes 4 days)
- Edge case handling: Validates target is in future, handles same-day targets gracefully

## External Dependencies

**UI & Component Libraries**
- @radix-ui/* family: Accessible, unstyled component primitives (accordion, dialog, dropdown, toast, etc.)
- tailwindcss: Utility-first CSS framework with custom configuration
- class-variance-authority: Type-safe variant management for components
- lucide-react: Icon library for consistent iconography
- embla-carousel-react: Carousel/slider functionality

**Data & Forms**
- @tanstack/react-query: Server state management and caching
- react-hook-form: Form state management with validation
- @hookform/resolvers: Validation resolver bridge
- zod: Schema validation library
- drizzle-zod: Drizzle-to-Zod schema conversion

**Database & ORM**
- drizzle-orm: TypeScript ORM for SQL databases
- drizzle-kit: CLI tools for migrations and schema management
- @neondatabase/serverless: Neon PostgreSQL serverless driver
- connect-pg-simple: PostgreSQL session store for Express

**Development Tools**
- vite: Frontend build tool and dev server
- tsx: TypeScript execution for Node.js
- esbuild: JavaScript bundler for production builds
- @replit/vite-plugin-*: Replit-specific development enhancements

**Routing & Navigation**
- wouter: Minimalist React router (< 1.5KB)

**Date Utilities**
- date-fns: Modern date utility library for JavaScript

**Design Assets**
- Attached legacy HTML/CSS/JS files in `/attached_assets` showing original implementation before React migration
- Provides reference for styling and calculation logic