import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TimeZoneDBResponse {
  status: string
  formatted: string
  timestamp: number
  gmtOffset: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const planet = url.searchParams.get('planet') || 'earth'
    const timezone = url.searchParams.get('timezone') || 'America/New_York'

    let timeData = {}

    switch (planet.toLowerCase()) {
      case 'earth':
        // Use TimeZoneDB API for Earth time zones
        const timezonedbapikey = Deno.env.get('TIMEZONEDB_API_KEY')
        if (!timezonedbapikey) {
          throw new Error('TimeZoneDB API key not configured')
        }

        const timezoneResponse = await fetch(
          `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezonedbapikey}&format=json&by=zone&zone=${timezone}`
        )
        
        if (!timezoneResponse.ok) {
          throw new Error(`TimeZoneDB API error: ${timezoneResponse.status}`)
        }

        const timezoneData: TimeZoneDBResponse = await timezoneResponse.json()
        
        timeData = {
          planet: 'Earth',
          timezone,
          formatted: timezoneData.formatted,
          timestamp: timezoneData.timestamp,
          gmtOffset: timezoneData.gmtOffset,
          localTime: new Date(timezoneData.timestamp * 1000).toISOString()
        }
        break

      case 'mars':
        // Calculate Mars Sol time (simplified)
        const earthTime = new Date()
        const earthSeconds = Math.floor(earthTime.getTime() / 1000)
        
        // Mars sol is approximately 24 hours 37 minutes 22.663 seconds
        const marsSolLength = 88775.244 // seconds
        const earthDayLength = 86400 // seconds
        
        // Mars sol number since arbitrary epoch
        const marsSol = Math.floor(earthSeconds / marsSolLength)
        const marsSolSeconds = earthSeconds % marsSolLength
        
        // Convert to Mars time format
        const marsHours = Math.floor(marsSolSeconds / 3600)
        const marsMinutes = Math.floor((marsSolSeconds % 3600) / 60)
        const marsSeconds = marsSolSeconds % 60
        
        timeData = {
          planet: 'Mars',
          sol: marsSol,
          localSolarTime: `${marsHours.toString().padStart(2, '0')}:${marsMinutes.toString().padStart(2, '0')}:${marsSeconds.toString().padStart(2, '0')}`,
          earthTime: earthTime.toISOString(),
          solLength: marsSolLength
        }
        break

      case 'wormhole':
        // Theoretical wormhole time (relative to Earth but with time dilation effects)
        const wormholeTime = new Date()
        const dilationFactor = 0.7 // Time moves 70% as fast in wormhole
        const dilatedSeconds = Math.floor(wormholeTime.getTime() * dilationFactor)
        
        timeData = {
          planet: 'Wormhole',
          dilatedTime: new Date(dilatedSeconds).toISOString(),
          earthTime: wormholeTime.toISOString(),
          dilationFactor,
          relativistic: true
        }
        break

      default:
        throw new Error(`Unsupported planet: ${planet}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...timeData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Planetary time error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})