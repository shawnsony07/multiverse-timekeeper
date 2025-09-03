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

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = new URL(req.url)
    const method = req.method

    switch (method) {
      case 'GET':
        // Get user's saved clocks
        const { data: clocks, error: fetchError } = await supabaseClient
          .from('saved_clocks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        return new Response(
          JSON.stringify({ clocks }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'POST':
        // Save a new clock
        const body = await req.json()
        const { planet, time_format, name } = body

        if (!planet) {
          return new Response(
            JSON.stringify({ error: 'Planet is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: newClock, error: insertError } = await supabaseClient
          .from('saved_clocks')
          .insert({
            user_id: user.id,
            planet,
            time_format: time_format || '24h',
            name: name || `${planet} Clock`
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return new Response(
          JSON.stringify({ clock: newClock }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
          }
        )

      case 'PUT':
        // Update a clock
        const clockId = url.searchParams.get('id')
        if (!clockId) {
          return new Response(
            JSON.stringify({ error: 'Clock ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const updateBody = await req.json()
        const { data: updatedClock, error: updateError } = await supabaseClient
          .from('saved_clocks')
          .update(updateBody)
          .eq('id', clockId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        return new Response(
          JSON.stringify({ clock: updatedClock }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'DELETE':
        // Delete a clock
        const deleteId = url.searchParams.get('id')
        if (!deleteId) {
          return new Response(
            JSON.stringify({ error: 'Clock ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('saved_clocks')
          .delete()
          .eq('id', deleteId)
          .eq('user_id', user.id)

        if (deleteError) {
          throw deleteError
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Clock management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})