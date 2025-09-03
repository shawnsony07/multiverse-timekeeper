-- Enable pg_cron and pg_net extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to sync events every 6 hours
SELECT cron.schedule(
  'sync-cosmic-events',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://zjozesrdjwoeiyidbzop.supabase.co/functions/v1/sync-events',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb3plc3JkandvZWl5aWRiem9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzY4MDQsImV4cCI6MjA3MjQ1MjgwNH0.L-K74kJ_4FizzQzEqNqxKaMPF5sdusOo_1w6BfemvrU"}'::jsonb,
        body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);