import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const eventType = url.searchParams.get('type')
    const source = url.searchParams.get('source')

    let query = supabaseClient
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .limit(limit)

    // Filter by event type if specified
    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    // Filter by source if specified
    if (source) {
      query = query.eq('source', source)
    }

    // Only show future events by default
    const showPast = url.searchParams.get('show_past') === 'true'
    if (!showPast) {
      query = query.gte('date', new Date().toISOString())
    }

    const { data: events, error } = await query

    if (error) {
      throw error
    }

    // Get counts by type for statistics
    const { data: statsData } = await supabaseClient
      .from('events')
      .select('event_type, source')
      .gte('date', new Date().toISOString())

    const stats = {
      total: statsData?.length || 0,
      byType: {},
      bySource: {}
    }

    statsData?.forEach(event => {
      stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1
      stats.bySource[event.source] = (stats.bySource[event.source] || 0) + 1
    })

    return new Response(
      JSON.stringify({
        events,
        stats,
        filters: {
          limit,
          eventType,
          source,
          showPast
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Get events error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})