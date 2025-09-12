import fetch from 'node-fetch';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getConfirmedExoplanets } from './exoplanets';

// Initialize Supabase client lazily to ensure env vars are loaded
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL) {
      throw new Error("Missing SUPABASE_URL environment variable.");
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
    }
    
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  
  return supabase;
}

export interface BatchUpdateResult {
  success: boolean;
  operation: string;
  recordsProcessed: number;
  newRecords: number;
  updatedRecords: number;
  errors: string[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface ExoplanetUpdateNotification {
  type: 'new_discovery' | 'data_update' | 'batch_complete';
  title: string;
  message: string;
  planetsAffected: string[];
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

// Main batch update function for exoplanets
export async function updateExoplanetDatabase(): Promise<BatchUpdateResult> {
  const startTime = new Date();
  const result: BatchUpdateResult = {
    success: false,
    operation: 'exoplanet_update',
    recordsProcessed: 0,
    newRecords: 0,
    updatedRecords: 0,
    errors: [],
    startTime,
    endTime: new Date(),
    duration: 0
  };

  try {
    console.log('Starting exoplanet database update...');

    // Fetch latest exoplanet data from NASA
    const latestExoplanets = await getConfirmedExoplanets(1000); // Get a large batch
    result.recordsProcessed = latestExoplanets.length;

    if (latestExoplanets.length === 0) {
      result.errors.push('No exoplanet data received from NASA API');
      return result;
    }

    // Process each exoplanet
    for (const exoplanet of latestExoplanets) {
      try {
        // Check if this exoplanet already exists
        const { data: existingPlanet, error: selectError } = await getSupabaseClient()
          .from('exoplanets')
          .select('id, pl_name, updated_at')
          .eq('pl_name', exoplanet.name)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          // Error other than "not found"
          result.errors.push(`Error checking ${exoplanet.name}: ${selectError.message}`);
          continue;
        }

        const planetData = {
          pl_name: exoplanet.name,
          hostname: exoplanet.hostStar,
          disc_year: exoplanet.discoveryYear,
          disc_method: exoplanet.discoveryMethod,
          pl_rade: exoplanet.planetRadius,
          pl_masse: exoplanet.planetMass,
          pl_orbper: exoplanet.orbitalPeriod,
          pl_eqt: exoplanet.temperature,
          sy_dist: exoplanet.distanceFromEarth / 3.26, // Convert ly to parsecs
          habitable_zone_flag: exoplanet.habitableZone,
          estimated_day_length: exoplanet.estimatedDayLength,
          description: exoplanet.description,
          icon: exoplanet.icon,
          color_code: exoplanet.color,
          confirmation_status: 'CONFIRMED',
          source_database: 'NASA Exoplanet Archive',
          nasa_archive_link: `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/DisplayOverview/nph-DisplayOverview?objname=${encodeURIComponent(exoplanet.name)}`,
          rowupdate: new Date().toISOString()
        };

        if (existingPlanet) {
          // Update existing planet
          const { error: updateError } = await getSupabaseClient()
            .from('exoplanets')
            .update(planetData)
            .eq('id', existingPlanet.id);

          if (updateError) {
            result.errors.push(`Error updating ${exoplanet.name}: ${updateError.message}`);
          } else {
            result.updatedRecords++;
            console.log(`Updated ${exoplanet.name}`);
          }
        } else {
          // Insert new planet
          const { error: insertError } = await getSupabaseClient()
            .from('exoplanets')
            .insert([planetData]);

          if (insertError) {
            result.errors.push(`Error inserting ${exoplanet.name}: ${insertError.message}`);
          } else {
            result.newRecords++;
            console.log(`Added new planet ${exoplanet.name}`);

            // Create notification for new discovery
            await createDiscoveryNotification(exoplanet);
          }
        }
      } catch (error) {
        result.errors.push(`Error processing ${exoplanet.name}: ${error}`);
      }
    }

    // Calculate habitability flags and other derived fields
    await updateDerivedFields();

    result.success = result.errors.length < result.recordsProcessed / 2; // Success if less than 50% errors
    
    console.log(`Exoplanet update complete: ${result.newRecords} new, ${result.updatedRecords} updated, ${result.errors.length} errors`);

  } catch (error) {
    console.error('Fatal error in exoplanet update:', error);
    result.errors.push(`Fatal error: ${error}`);
  }

  result.endTime = new Date();
  result.duration = result.endTime.getTime() - result.startTime.getTime();

  // Log the batch update result
  await logBatchUpdate(result);

  return result;
}

// Update derived/calculated fields
async function updateDerivedFields(): Promise<void> {
  try {
    console.log('Updating derived fields...');

    // Update habitability flags based on temperature and size
    await getSupabaseClient().rpc('sql', {
      query: `
        UPDATE public.exoplanets 
        SET habitable_zone_flag = (
          pl_eqt BETWEEN 200 AND 320 
          AND pl_rade BETWEEN 0.5 AND 2.5 
          AND pl_rade IS NOT NULL 
          AND pl_eqt IS NOT NULL
        )
        WHERE habitable_zone_flag IS NULL OR habitable_zone_flag = FALSE;
      `
    });

    // Calculate Earth Similarity Index
    await getSupabaseClient().rpc('sql', {
      query: `
        UPDATE public.exoplanets 
        SET earth_similarity_index = calculate_habitability_score(pl_rade, pl_eqt, pl_insol, pl_orbper)
        WHERE pl_rade IS NOT NULL OR pl_eqt IS NOT NULL;
      `
    });

    // Update auto-generated descriptions for planets without custom descriptions
    await getSupabaseClient().rpc('sql', {
      query: `
        UPDATE public.exoplanets 
        SET description = generate_planet_description(exoplanets.*)
        WHERE description IS NULL OR description = '';
      `
    });

    console.log('Derived fields updated successfully');

  } catch (error) {
    console.error('Error updating derived fields:', error);
  }
}

// Create notification for new planet discovery
async function createDiscoveryNotification(exoplanet: any): Promise<void> {
  const notification: ExoplanetUpdateNotification = {
    type: 'new_discovery',
    title: 'New Exoplanet Discovered!',
    message: `${exoplanet.name} has been added to our database. This ${
      exoplanet.habitableZone ? 'potentially habitable ' : ''
    }exoplanet orbits ${exoplanet.hostStar} and was discovered using ${exoplanet.discoveryMethod}.`,
    planetsAffected: [exoplanet.name],
    timestamp: new Date().toISOString(),
    severity: exoplanet.habitableZone ? 'success' : 'info'
  };

  // Store notification in database
  try {
    await getSupabaseClient()
      .from('exoplanet_notifications')
      .insert([{
        type: notification.type,
        title: notification.title,
        message: notification.message,
        planets_affected: notification.planetsAffected,
        severity: notification.severity,
        created_at: notification.timestamp
      }]);

    console.log(`Created notification for new discovery: ${exoplanet.name}`);
  } catch (error) {
    console.error('Error creating discovery notification:', error);
  }
}

// Log batch update results
async function logBatchUpdate(result: BatchUpdateResult): Promise<void> {
  try {
    await getSupabaseClient()
      .from('batch_update_logs')
      .insert([{
        operation: result.operation,
        success: result.success,
        records_processed: result.recordsProcessed,
        new_records: result.newRecords,
        updated_records: result.updatedRecords,
        error_count: result.errors.length,
        errors: result.errors,
        start_time: result.startTime.toISOString(),
        end_time: result.endTime.toISOString(),
        duration_ms: result.duration
      }]);

    console.log('Batch update result logged successfully');
  } catch (error) {
    console.error('Error logging batch update:', error);
  }
}

// Get recent notifications
export async function getRecentNotifications(limit: number = 10): Promise<ExoplanetUpdateNotification[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('exoplanet_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data.map(notification => ({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      planetsAffected: notification.planets_affected || [],
      timestamp: notification.created_at,
      severity: notification.severity
    }));

  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Get batch update history
export async function getBatchUpdateHistory(limit: number = 20): Promise<BatchUpdateResult[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('batch_update_logs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching batch history:', error);
      return [];
    }

    return data.map(log => ({
      success: log.success,
      operation: log.operation,
      recordsProcessed: log.records_processed,
      newRecords: log.new_records,
      updatedRecords: log.updated_records,
      errors: log.errors || [],
      startTime: new Date(log.start_time),
      endTime: new Date(log.end_time),
      duration: log.duration_ms
    }));

  } catch (error) {
    console.error('Error getting batch history:', error);
    return [];
  }
}

// Check for stale data and trigger updates if needed
export async function checkDataFreshness(): Promise<{
  needsUpdate: boolean;
  lastUpdate: Date | null;
  daysSinceUpdate: number;
}> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('batch_update_logs')
      .select('end_time')
      .eq('operation', 'exoplanet_update')
      .eq('success', true)
      .order('end_time', { ascending: false })
      .limit(1)
      .single();

    const lastUpdate = data ? new Date(data.end_time) : null;
    const daysSinceUpdate = lastUpdate 
      ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      needsUpdate: daysSinceUpdate >= 7, // Weekly updates
      lastUpdate,
      daysSinceUpdate
    };

  } catch (error) {
    console.error('Error checking data freshness:', error);
    return {
      needsUpdate: true,
      lastUpdate: null,
      daysSinceUpdate: 999
    };
  }
}

// Scheduled job function (to be called by cron or similar)
export async function runScheduledUpdate(): Promise<void> {
  console.log('Running scheduled exoplanet update check...');

  try {
    const freshness = await checkDataFreshness();
    
    if (freshness.needsUpdate) {
      console.log(`Data is ${freshness.daysSinceUpdate} days old, triggering update...`);
      const result = await updateExoplanetDatabase();
      
      if (result.success) {
        console.log('Scheduled update completed successfully');
      } else {
        console.error('Scheduled update completed with errors:', result.errors);
      }
    } else {
      console.log(`Data is fresh (${freshness.daysSinceUpdate} days old), no update needed`);
    }

  } catch (error) {
    console.error('Error in scheduled update:', error);
  }
}

// Health check for batch update system
export async function getBatchSystemHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  lastSuccessfulUpdate: Date | null;
  totalRecords: number;
  recentErrors: string[];
  uptime: number;
}> {
  try {
    const [freshnessCheck, totalCount, recentLogs] = await Promise.all([
      checkDataFreshness(),
      
      getSupabaseClient()
        .from('exoplanets')
        .select('id', { count: 'exact' }),
        
      getSupabaseClient()
        .from('batch_update_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(5)
    ]);

    const recentErrors = recentLogs.data
      ?.filter(log => !log.success)
      .flatMap(log => log.errors || [])
      .slice(0, 10) || [];

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (freshnessCheck.daysSinceUpdate > 14) {
      status = 'error'; // No successful update in 2 weeks
    } else if (freshnessCheck.daysSinceUpdate > 7 || recentErrors.length > 0) {
      status = 'warning';
    }

    return {
      status,
      lastSuccessfulUpdate: freshnessCheck.lastUpdate,
      totalRecords: totalCount.count || 0,
      recentErrors,
      uptime: process.uptime()
    };

  } catch (error) {
    console.error('Error checking batch system health:', error);
    return {
      status: 'error',
      lastSuccessfulUpdate: null,
      totalRecords: 0,
      recentErrors: [`Health check failed: ${error}`],
      uptime: 0
    };
  }
}
