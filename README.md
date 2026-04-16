# 🌌 Multiverse Timekeeper

> *"Time is relative, but cosmic awareness is absolute"*

## 🚀 [**Live Demo**](https://multiverse-timekeeper.vercel.app)

**A Cosmic Remix of the Classical Clock App**

Transform your mundane time-checking experience into an epic space odyssey! This futuristic reimagination of the simple clock app expands temporal monitoring across dimensions and celestial bodies. Track Earth time alongside Mars sols, monitor the ISS in real-time, explore alternate timelines where physics bend reality, and discover cosmic events. Built with NASA data integration, dynamic wormhole animations, and a neon-soaked HUD interface, it turns every second into an interstellar adventure. From basic timekeeping to quantum temporal mechanics—this is what happens when a clock app meets the cosmos! 🚀⏰✨

## 🎯 App Features

**6 Cosmic Tabs Transform Simple Time Functions:**

🕐 **NOW** - Enhanced world clock with Earth timezones  
🌌 **GALACTIC** - Mars time + exoplanet data from NASA  
🚀 **EVENTS** - Cosmic event countdown timers  
🛰️ **TRACKING** - Real-time ISS position with orbital timers  
🌀 **WORMHOLE** - Alternate reality time simulations with custom physics  
🤖 **AI LORE** - Procedural cosmic storytelling

Built with React/TypeScript, featuring animated GIF backgrounds, real astronomical APIs, and a sci-fi HUD design. Each tab reimagines basic clock functions—alarms become cosmic events, stopwatches become orbital trackers, and world clocks become interdimensional time portals. Experience time like never before across the multiverse!

![Multiverse Timekeeper](https://img.shields.io/badge/Status-Active-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

## ✨ Features

### 🌍 **Earth Time**
- **Real-time timezone tracking** for 25+ countries with live API data
- **Space agency time zones** (NASA, ESA, JAXA, SpaceX, etc.)
- **Dynamic country flags** and accurate GMT offsets
- **User-customizable** saved locations
- **Fallback system** when APIs are unavailable

### 🌌 **Galactic Time**
- **22+ celestial bodies** including real planets, moons, and exoplanets
- **Astronomically accurate** time calculations based on NASA data
- **Real worlds**: Mars, Europa, Titan, Proxima Centauri b, and more
- **Fictional worlds**: Tatooine, Coruscant, Arrakis, Gallifrey, Pandora
- **Custom location saving** and categorized browsing

### ⚡ **Cosmic Events**
- **Live NASA EONET integration** for real Earth events (wildfires, earthquakes, storms)
- **Astronomical events** (eclipses, meteor showers, planetary alignments)
- **Interactive event browser** with coordinates and magnitude data
- **Event categorization** and filtering

### 🕳️ **Wormhole Mode**
- **Interdimensional time travel** simulation
- **Parallel universe** time calculations
- **Quantum temporal mechanics** visualization
- **Timeline manipulation** tools

### 🛰️ **ISS Tracker**
- **Real-time International Space Station** location tracking
- **Orbital mechanics** visualization
- **Pass prediction** and visibility calculations

### 📚 **Cosmic Lore Generator**
- **AI-powered** cosmic civilization stories
- **Procedural lore** generation for fictional worlds
- **Cultural and historical** context for galactic locations

### 🎵 **Immersive Audio**
- **Ambient space soundscapes** for each mode
- **Dynamic background music** that responds to cosmic events
- **3D positional audio** for spatial awareness

### 🔐 **User Authentication**
- **Supabase integration** for user accounts
- **Persistent user preferences** and saved locations
- **Secure authentication** with email/password

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Optional: API keys for enhanced features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/multiverse-timekeeper.git
cd multiverse-timekeeper

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Add your API keys to .env file

# Start development servers
npm run dev          # Frontend (http://localhost:5173)
npm run server:watch # Backend API (http://localhost:3000)
```

### Environment Setup (Optional)

Create a `.env` file with these optional API keys for enhanced features:

```env
# TimeZoneDB API (for real-time timezone data)
# Get free API key from: https://timezonedb.com/api
TIMEZONEDB_API_KEY=your_timezonedb_api_key_here

# N2YO Satellite Tracking API (for ISS tracking)
# Get free API key from: https://www.n2yo.com/api/
N2YO_API_KEY=your_n2yo_api_key_here

# NASA APIs (optional, DEMO_KEY works with rate limits)
# Get free API key from: https://api.nasa.gov/
NASA_API_KEY=your_nasa_api_key_here

# Supabase (for user authentication and database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NASA, NOAA, and Launch Library APIs are public and require no keys
# All APIs include fallback data when keys are not provided
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Express.js** server with TypeScript
- **CORS** enabled for cross-origin requests
- **Real-time API integrations**

### APIs & Services
- **17 External APIs** - Comprehensive space and Earth data
- **NASA APIs** - Planetary data, exoplanets, asteroids, natural events
- **NOAA APIs** - Space weather, solar activity, aurora forecasts
- **TimeZoneDB API** - Real-time timezone data
- **N2YO API** - Satellite tracking and ISS data
- **Launch Library API** - Rocket launch schedules
- **Supabase** - Authentication, database, and edge functions

### Database
- **Supabase PostgreSQL** - User accounts and preferences
- **Local Storage** - Client-side caching

## 📁 Project Structure

```
multiverse-timekeeper/
├── src/
│   ├── components/
│   │   ├── time/           # Time display components
│   │   ├── events/         # Cosmic events
│   │   ├── tracking/       # ISS and orbital tracking
│   │   ├── audio/          # Sound system
│   │   ├── lore/           # AI lore generation
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Route components
│   ├── contexts/           # React contexts
│   └── lib/                # Utilities and helpers
├── server/                 # Express.js backend
├── public/                 # Static assets
├── database/               # Database schemas
└── supabase/               # Supabase configuration
```

## 🌟 Key Features Deep Dive

### Astronomical Accuracy
- **17 integrated APIs** for real-time space data
- Real planetary rotation periods and orbital data from NASA JPL Horizons
- Live cosmic event tracking from NASA EONET
- Accurate timezone calculations with DST handling from TimeZoneDB
- Real-time ISS tracking via N2YO satellite API

### User Experience
- Responsive design for all device sizes
- Loading states and error handling
- Smooth animations and transitions
- Persistent user preferences

### Performance
- Server-side API caching
- Client-side data persistence
- Optimized re-renders with React Query
- Lazy loading for better performance

## 🔧 Available Scripts

```bash
# Development
npm run dev                 # Start frontend development server
npm run server              # Start backend server (production mode)
npm run server:watch        # Start backend with hot reload

# Building
npm run build              # Build for production
npm run build:dev          # Build in development mode
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript checks
```

## 🌐 API Documentation

The project integrates **17 external APIs** plus custom backend endpoints for comprehensive space and Earth data.

### 🚀 NASA APIs (Public - No Keys Required)

#### NASA JPL Horizons API
- **URL**: `https://ssd.jpl.nasa.gov/api/horizons.api`
- **Purpose**: Real-time planetary positions and orbital mechanics
- **Data**: Earth, Mars, Moon positions, distances, local solar time

#### NASA EONET API
- **URL**: `https://eonet.gsfc.nasa.gov/api/v3`
- **Purpose**: Earth Observatory Natural Event Tracker
- **Data**: Live natural events (wildfires, earthquakes, volcanoes, storms)

#### NASA Exoplanet Archive API
- **URL**: `https://exoplanetarchive.ipac.caltech.edu/TAP/sync`
- **Purpose**: Confirmed exoplanet database
- **Data**: TAP queries for exoplanet characteristics and discovery data

#### NASA NeoWs API
- **URL**: `https://api.nasa.gov/neo/rest/v1`
- **Purpose**: Near Earth Object Web Service
- **Data**: Asteroid tracking, close approaches, orbital data

### 🌦️ NOAA Space Weather APIs (Public)

#### NOAA SWPC Alerts
- **URL**: `https://services.swpc.noaa.gov/products/alerts.json`
- **Data**: Space weather alerts and warnings

#### NOAA Planetary K-Index
- **URL**: `https://services.swpc.noaa.gov/json/planetary_k_index_1m.json`
- **Data**: Geomagnetic activity indices

#### NOAA Solar Wind
- **URL**: `https://services.swpc.noaa.gov/json/ace_swepam_1m.json`
- **Data**: Solar wind speed and magnetic field measurements

#### NOAA X-Ray Flux
- **URL**: `https://services.swpc.noaa.gov/json/goes_xray_flux_1m.json`
- **Data**: Solar flare X-ray measurements

#### NOAA Aurora Forecast
- **URL**: `https://services.swpc.noaa.gov/json/aurora_forecast_northern_hemisphere.json`
- **Data**: Northern hemisphere aurora visibility predictions

### 🔑 Third-Party APIs (Require Keys)

#### TimeZoneDB API
- **URL**: `http://api.timezonedb.com/v2.1`
- **Key**: `TIMEZONEDB_API_KEY`
- **Data**: Real-time timezone data, GMT offsets, DST information
- **Fallback**: Uses hardcoded timezone data when API unavailable

#### N2YO Satellite Tracking API
- **URL**: `https://api.n2yo.com/rest/v1/satellite`
- **Key**: `N2YO_API_KEY`
- **Data**: ISS position, satellite passes, orbital predictions
- **Fallback**: Simulated ISS orbital movement when API unavailable

### 🚀 Space Industry APIs (Public)

#### Launch Library API
- **URL**: `https://lldev.thespacedevs.com/2.3.0/launches/`
- **Data**: Rocket launch schedules, mission information, launch providers

### 🗄️ Database & Authentication APIs

#### Supabase
- **URL**: `https://zjozesrdjwoeiyidbzop.supabase.co`
- **Keys**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Services**: User authentication, data storage, real-time subscriptions

### ⚡ Custom Backend API Endpoints

The Express.js server provides 30+ endpoints that aggregate external APIs:

#### Planetary Data
- `GET /api/planetary/:body` - Cached planetary position data
- `POST /api/planetary/fetch` - Refresh data from NASA Horizons

#### Timezone Management
- `GET /api/timezones` - List timezones with country flags
- `GET /api/timezone/:zoneName` - Detailed timezone information

#### Cosmic Events
- `GET /api/cosmic-events` - NASA EONET natural events
- `GET /api/cosmic-events/category/:categoryId` - Events by category
- `GET /api/cosmic-events/categories` - Available event categories

#### Exoplanet Data
- `GET /api/exoplanets` - Confirmed exoplanets from NASA
- `GET /api/exoplanets/search` - Search exoplanets by name
- `GET /api/exoplanets/stats` - Exoplanet discovery statistics

#### Satellite Tracking
- `GET /api/satellites/iss` - Current ISS position
- `GET /api/satellites/iss/passes` - ISS pass predictions for location
- `GET /api/satellites/info/:noradId` - Satellite orbital information
- `GET /api/satellites/popular` - Popular satellites by category
- `GET /api/satellites/iss/relative` - ISS position relative to user

#### Space Weather
- `GET /api/space-weather/alerts` - Current space weather alerts
- `GET /api/space-weather/solar-activity` - Solar activity indices
- `GET /api/space-weather/aurora-forecast` - Aurora visibility forecast

#### Asteroid Tracking
- `GET /api/asteroids/today` - Today's near-Earth asteroids
- `GET /api/asteroids/range` - Asteroids by date range
- `GET /api/asteroids/:id` - Specific asteroid details
- `GET /api/asteroids/stats` - Asteroid database statistics
- `GET /api/asteroids/hazardous` - Potentially hazardous asteroids

#### AI Lore Generation
- `POST /api/lore/generate` - Generate cosmic civilization stories
- `POST /api/lore/generate-set` - Generate complete planet lore sets
- `POST /api/lore/recommendations` - Get recommended lore content

#### System Monitoring
- `POST /api/batch/update-exoplanets` - Update exoplanet database
- `GET /api/batch/notifications` - Recent system notifications
- `GET /api/batch/history` - Batch update history
- `GET /api/batch/health` - System health status
- `GET /api/batch/freshness` - Data freshness indicators

### 🔧 Supabase Edge Functions

#### Custom Database Functions
- **get-events** - Advanced event filtering and statistics
- **sync-events** - Automated synchronization with external APIs
- **user-clocks** - User clock preferences management
- **planetary-time** - Complex planetary time calculations

### 📊 API Integration Summary
- **Total APIs**: 17 external + 30+ internal endpoints
- **Free APIs**: 10 (NASA, NOAA, Launch Library)
- **Paid APIs**: 2 (TimeZoneDB, N2YO) with free tiers
- **Database**: 1 (Supabase)
- **Fallback Systems**: All APIs include offline fallback data
- **Rate Limiting**: Server-side caching reduces API calls
- **Error Handling**: Comprehensive error handling and logging

*Complete API integration details in [API_INTEGRATION.md](./API_INTEGRATION.md)*

## 🌍 Supported Locations

### Real Astronomical Bodies (22+)
**Planets**: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune  
**Moons**: Luna, Io, Europa, Titan  
**Exoplanets**: Proxima Centauri b, Kepler-442b, TRAPPIST-1e  

### Fictional Worlds
**Star Wars**: Tatooine, Coruscant, Hoth  
**Star Trek**: Vulcan, Risa  
**Other**: Arrakis (Dune), Gallifrey (Doctor Who), Pandora (Avatar)  

*Complete location list in [GALACTIC_LOCATIONS.md](./GALACTIC_LOCATIONS.md)*

## 🔄 Updates & Maintenance

- **Real-time data**: All times update every second
- **API fallbacks**: Graceful degradation when services are unavailable
- **Regular updates**: New celestial bodies and features added regularly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*"In the vastness of space and the immensity of time, it is my joy to share this moment with you."*
