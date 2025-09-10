# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Multiverse Timekeeper** - a React-based cosmic time tracking application that monitors time across dimensions, tracks Earth/Mars time, cosmic events, and interdimensional portals. Built with modern web technologies and deployed via Lovable platform.

**Tech Stack**: Vite + React + TypeScript + shadcn/ui + Tailwind CSS + Supabase + Express server

## Common Development Commands

### Frontend Development
```bash
# Start development server (localhost:8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend Development
```bash
# Run server (localhost:4000)
npm run server

# Run server with auto-reload during development
npm run server:watch
```

### Testing a Single Component
To test individual React components, import them directly in a test page or create temporary routes in `src/App.tsx`.

### Database Operations
The project uses Supabase with migrations. Check the `supabase/` directory for database schema and functions.

## Code Architecture

### High-Level Structure

**Frontend Architecture**:
- **Single Page Application** with React Router (`src/App.tsx`)
- **Component-based** with main timekeeper interface in `MultiverseTimekeeper.tsx`
- **Tab-based navigation** with 4 main sections: NOW (Earth time), GALACTIC (planetary time), EVENTS (cosmic events), WORMHOLE (special mode)
- **Context-driven auth** using Supabase authentication
- **Real-time updates** via React hooks and intervals

**Backend Architecture**:
- **Express server** (`server/index.ts`) handles planetary data API
- **NASA JPL Horizons integration** via `server/lib/horizons.ts` for real astronomical data
- **Supabase integration** for data persistence and user management

### Key Components Architecture

1. **MultiverseTimekeeper** - Main orchestrator component
   - Manages tab state and cosmic backgrounds per tab
   - Handles scroll-based visual effects (animated cape)
   - Coordinates sub-components for different time displays

2. **Time Components**:
   - `EarthTime.tsx` - Local/worldwide time zones with space agency defaults
   - `GalacticTime.tsx` - Multi-planetary time system with 22+ real and fictional worlds

3. **Events System**:
   - `CosmicEvents.tsx` - Fetches launches via Launch Library API
   - Displays upcoming rocket launches and astronomical events
   - Real-time countdowns and status tracking

4. **Authentication & Persistence**:
   - Supabase Auth context provides user management
   - `useUserClocks` hook handles saved time zone preferences
   - Row-level security policies for user data

### Database Schema
- **users**: User profiles linked to Supabase Auth
- **saved_clocks**: User's custom time zone preferences
- **events**: Cached cosmic events with auto-sync
- **planetary_data**: Cached NASA JPL Horizons data for Mars/planetary positions

### Special Features
- **Dynamic backgrounds**: Tab-specific animated GIFs (space themes)
- **Animated elements**: Floating cape that responds to scroll direction and velocity
- **Cosmic styling**: Custom CSS classes (`hud-panel`, `cosmic-border`, `time-display`)
- **Real astronomical data**: Integration with NASA JPL for actual planetary positions
- **Multi-planetary time system**: 22+ locations including Solar System planets, moons, exoplanets, and fictional worlds
- **Accurate time calculations**: Based on real astronomical data (day length, orbital periods)
- **Fictional universe support**: Time systems for Star Wars, Star Trek, Dune, Doctor Who, Avatar worlds

## Key File Locations

- **Main app logic**: `src/components/MultiverseTimekeeper.tsx`
- **Backend API**: `server/index.ts` and `server/lib/horizons.ts`
- **Database types**: `src/integrations/supabase/types.ts`
- **Config files**: `vite.config.ts`, `tailwind.config.ts`, `supabase/config.toml`
- **UI components**: `src/components/ui/` (shadcn/ui library)

## Development Patterns

### State Management
- React hooks for local state (`useState`, `useEffect`)
- Context for authentication (`useAuth`)
- Custom hooks for data fetching (`useUserClocks`)

### API Integration
- Frontend fetches from local Express server (`localhost:4000`)
- Server caches NASA JPL data in Supabase to avoid rate limits
- Launch data fetched from Launch Library API v2

### Styling Approach
- Tailwind utility classes with custom cosmic theme
- CSS custom properties for dynamic visual effects
- Component-scoped styling via className patterns
- Responsive design with mobile-first approach

## Environment Dependencies

### Required Environment Variables
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### Supabase Setup
The project requires a Supabase project with:
1. Authentication enabled
2. Database migrations applied from `supabase/migrations/`
3. Row Level Security configured for user data

### External APIs
- NASA JPL Horizons system for planetary ephemeris data
- Launch Library API v2 for rocket launch information
- No API keys required for external services

## Deployment
- **Primary**: Lovable platform (automated from git)
- **Alternative**: Standard Vite build can deploy to any static host
- **Server**: Express server needs separate hosting (not included in static build)
