import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LaunchEvent {
  id: string
  name: string
  net: string
  status: {
    name: string
  }
  launch_service_provider: {
    name: string
  }
}

interface LaunchResponse {
  results: LaunchEvent[]
}

interface EONETEvent {
  id: string
  title: string
  description: string | null
  link: string
  categories: Array<{
    title: string
  }>
  sources: Array<{
    id: string
    url: string
  }>
  geometries: Array<{
    date: string
    coordinates?: number[]
  }>
}

interface EONETResponse {
  events: EONETEvent[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting sync-events function...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const syncResults = {
      launches: { success: 0, errors: [] as string[] },
      eonet: { success: 0, errors: [] as string[] }
    }

    // Sync Launch Library API
    try {
      console.log('Fetching launches from Launch Library...')
      const launchResponse = await fetch('https://lldev.thespacedevs.com/2.3.0/launches/?format=json&limit=50&mode=detailed')
      
      if (!launchResponse.ok) {
        throw new Error(`Launch API error: ${launchResponse.status}`)
      }

      const launchData: LaunchResponse = await launchResponse.json()
      console.log(`Fetched ${launchData.results?.length || 0} launches`)

      for (const launch of launchData.results || []) {
        try {
          const { error } = await supabaseClient
            .from('events')
            .upsert({
              external_id: `launch_${launch.id}`,
              name: launch.name,
              event_type: 'launch',
              date: launch.net,
              description: `Launch by ${launch.launch_service_provider?.name}. Status: ${launch.status?.name}`,
              source: 'Launch Library',
            }, { 
              onConflict: 'external_id' 
            })

          if (error) {
            console.error('Error inserting launch:', error)
            syncResults.launches.errors.push(`Launch ${launch.id}: ${error.message}`)
          } else {
            syncResults.launches.success++
          }
        } catch (err) {
          console.error('Error processing launch:', err)
          syncResults.launches.errors.push(`Launch ${launch.id}: ${err.message}`)
        }
      }
    } catch (err) {
      console.error('Error fetching launches:', err)
      syncResults.launches.errors.push(`Fetch error: ${err.message}`)
    }

    // Sync NASA EONET API
    try {
      console.log('Fetching events from NASA EONET...')
      const eonetResponse = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?limit=50')
      
      if (!eonetResponse.ok) {
        throw new Error(`EONET API error: ${eonetResponse.status}`)
      }

      const eonetData: EONETResponse = await eonetResponse.json()
      console.log(`Fetched ${eonetData.events?.length || 0} EONET events`)

      for (const event of eonetData.events || []) {
        try {
          // Get the latest geometry date
          const latestGeometry = event.geometries?.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]

          const { error } = await supabaseClient
            .from('events')
            .upsert({
              external_id: `eonet_${event.id}`,
              name: event.title,
              event_type: event.categories?.[0]?.title?.toLowerCase().replace(/\s+/g, '_') || 'natural_event',
              date: latestGeometry?.date || new Date().toISOString(),
              description: event.description || `Natural event: ${event.title}`,
              source: 'NASA EONET',
            }, { 
              onConflict: 'external_id' 
            })

          if (error) {
            console.error('Error inserting EONET event:', error)
            syncResults.eonet.errors.push(`Event ${event.id}: ${error.message}`)
          } else {
            syncResults.eonet.success++
          }
        } catch (err) {
          console.error('Error processing EONET event:', err)
          syncResults.eonet.errors.push(`Event ${event.id}: ${err.message}`)
        }
      }
    } catch (err) {
      console.error('Error fetching EONET events:', err)
      syncResults.eonet.errors.push(`Fetch error: ${err.message}`)
    }

    console.log('Sync completed:', syncResults)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event sync completed',
        results: syncResults,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Sync error:', error)
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