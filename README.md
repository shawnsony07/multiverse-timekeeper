# 🌌 Multiverse Timekeeper

> *"Time is relative, but cosmic awareness is absolute"*

A sophisticated time-tracking application that displays real-time across multiple worlds, dimensions, and cosmic locations. Track Earth time zones, galactic planetary time, cosmic events, and explore the universe through immersive visual experiences.

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
TIMEZONEDB_API_KEY=your_api_key_here

# Supabase (for user authentication)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# NASA APIs are public and require no keys
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
- **TimeZoneDB API** - Real-time timezone data
- **NASA EONET API** - Live Earth observation events
- **ISS Location API** - Real-time space station tracking
- **Supabase** - Authentication and user data

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
- Real planetary rotation periods and orbital data
- Accurate time zone calculations with DST handling
- Live cosmic event tracking from NASA

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

The project includes a comprehensive backend API:

### Timezone Endpoints
- `GET /api/timezones` - List available timezones
- `GET /api/timezone/:zoneName` - Get specific timezone data

### Cosmic Events
- `GET /api/cosmic-events` - Get recent cosmic events
- `GET /api/cosmic-events/category/:id` - Filter by event type

*Full API documentation available in [API_INTEGRATION.md](./API_INTEGRATION.md)*

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

## 🙏 Acknowledgments

- **NASA** for astronomical data and EONET API
- **TimeZoneDB** for real-time timezone data
- **Supabase** for backend services
- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible component primitives

---

*"In the vastness of space and the immensity of time, it is my joy to share this moment with you."*

⭐ **Star this repository** if you find it useful!
