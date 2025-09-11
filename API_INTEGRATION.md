# API Integration Guide

This document describes the new API integrations added to the Multiverse Timekeeper project.

## New APIs Integrated

### 1. TimeZoneDB API
**Purpose**: Replace hardcoded timezone data with real-time timezone information

**Features**:
- Real-time timezone data for 25+ countries
- Accurate GMT offsets and DST information  
- Country flags and display names
- Fallback to hardcoded data when API unavailable

**Setup**:
1. Get a free API key from [timezonedb.com/api](https://timezonedb.com/api)
2. Add to `.env` file: `TIMEZONEDB_API_KEY=your_api_key_here`
3. Server will use fallback data if API key not configured

### 2. NASA EONET API
**Purpose**: Replace hardcoded cosmic events with real NASA Earth Observatory data

**Features**:
- Live natural event tracking (wildfires, volcanoes, storms, earthquakes)
- Event coordinates and magnitude data
- Integration with existing astronomical events
- Fallback to hardcoded events when API unavailable

**Setup**:
- No API key required (NASA public API)
- Automatically configured to use `https://eonet.gsfc.nasa.gov/api/v3`

## Implementation Details

### Server Endpoints

**TimeZoneDB**:
- `GET /api/timezones` - List available timezones with flags
- `GET /api/timezone/:zoneName` - Get detailed timezone info

**NASA EONET**:
- `GET /api/cosmic-events` - Get cosmic events (limit & days parameters)
- `GET /api/cosmic-events/category/:categoryId` - Events by category
- `GET /api/cosmic-events/categories` - Available event categories

### Frontend Changes

**EarthTime Component**:
- Loads timezones from TimeZoneDB API
- Dynamic country/timezone selection
- Maintains space agency defaults + user saved clocks

**CosmicEvents Component**:
- Fetches live events from NASA EONET
- Enhanced event display with coordinates and magnitude
- Combines real events with astronomical events (eclipses, meteor showers)

### Error Handling & Fallbacks

Both APIs include comprehensive fallback systems:

1. **Network Failures**: Automatically falls back to hardcoded data
2. **API Key Issues**: TimeZoneDB gracefully degrades to local data
3. **Rate Limits**: Server-side caching reduces API calls
4. **Loading States**: User-friendly loading indicators

### Event Types Supported

**NASA EONET Categories**:
- Wildfires 🔥
- Volcanoes 🌋  
- Severe Storms 🌪️
- Earthquakes 📉
- Floods 🌊
- Dust and Haze 🌫️
- Landslides 🏔️
- Drought ☀️

**Astronomical Events** (maintained from original):
- Eclipses 🌙
- Meteor Showers ⭐
- Planetary Alignments ☀️
- Solar Activity ⚡

## Testing

To test the new integrations:

1. **With API Keys**: Configure TimeZoneDB API key in `.env`
2. **Without API Keys**: APIs will use fallback data automatically
3. **Server**: Run `npm run server:watch` to start backend with hot reload
4. **Frontend**: Run `npm run dev` to start frontend development server

## Benefits

- **Real-time Data**: Live timezone and event information
- **Enhanced User Experience**: More accurate and up-to-date information  
- **Graceful Degradation**: Works even when APIs are unavailable
- **Scalable Architecture**: Easy to add more APIs in the future
- **Cost Effective**: Uses free tiers of public APIs

The integration maintains backward compatibility while significantly enhancing the app's data accuracy and real-time capabilities.
