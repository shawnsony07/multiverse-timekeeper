-- Exoplanet Data Schema for Supabase
-- This schema caches exoplanet data from NASA Exoplanet Archive for performance and offline access

-- Create exoplanets table
CREATE TABLE IF NOT EXISTS public.exoplanets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core identification
    pl_name VARCHAR(255) NOT NULL UNIQUE, -- Planet name (Kepler-442 b, Proxima Cen b, etc.)
    hostname VARCHAR(255) NOT NULL, -- Host star name
    pl_letter VARCHAR(10), -- Planet letter designation
    
    -- Discovery information
    disc_year INTEGER, -- Discovery year
    disc_method VARCHAR(100), -- Discovery method
    disc_facility VARCHAR(255), -- Discovery facility
    disc_telescope VARCHAR(255), -- Discovery telescope
    disc_instrument VARCHAR(255), -- Discovery instrument
    
    -- Physical parameters
    pl_rade NUMERIC(10, 6), -- Planet radius (Earth radii)
    pl_radee NUMERIC(10, 6), -- Planet radius upper error
    pl_rade_lower NUMERIC(10, 6), -- Planet radius lower error
    
    pl_masse NUMERIC(12, 6), -- Planet mass (Earth masses)
    pl_massee NUMERIC(12, 6), -- Planet mass upper error
    pl_masse_lower NUMERIC(12, 6), -- Planet mass lower error
    
    pl_dens NUMERIC(10, 4), -- Planet density (g/cm^3)
    pl_densen NUMERIC(10, 4), -- Planet density upper error
    pl_dens_lower NUMERIC(10, 4), -- Planet density lower error
    
    -- Orbital parameters
    pl_orbper NUMERIC(15, 8), -- Orbital period (days)
    pl_orbpererr1 NUMERIC(15, 8), -- Orbital period upper error
    pl_orbpererr2 NUMERIC(15, 8), -- Orbital period lower error
    
    pl_orbsmax NUMERIC(10, 6), -- Semi-major axis (AU)
    pl_orbsmaxerr1 NUMERIC(10, 6), -- Semi-major axis upper error
    pl_orbsmaxerr2 NUMERIC(10, 6), -- Semi-major axis lower error
    
    pl_orbeccen NUMERIC(8, 6), -- Eccentricity
    pl_orbeccenerr1 NUMERIC(8, 6), -- Eccentricity upper error
    pl_orbeccenerr2 NUMERIC(8, 6), -- Eccentricity lower error
    
    pl_orbincl NUMERIC(8, 4), -- Orbital inclination (degrees)
    pl_orbinclerr1 NUMERIC(8, 4), -- Orbital inclination upper error
    pl_orbinclerr2 NUMERIC(8, 4), -- Orbital inclination lower error
    
    -- Temperature and habitability
    pl_eqt NUMERIC(8, 2), -- Equilibrium temperature (K)
    pl_eqterr1 NUMERIC(8, 2), -- Equilibrium temperature upper error
    pl_eqterr2 NUMERIC(8, 2), -- Equilibrium temperature lower error
    
    pl_insol NUMERIC(12, 6), -- Insolation flux (Earth flux)
    pl_insolerr1 NUMERIC(12, 6), -- Insolation flux upper error
    pl_insolerr2 NUMERIC(12, 6), -- Insolation flux lower error
    
    -- Transit parameters
    pl_tranflag BOOLEAN DEFAULT FALSE, -- Transit flag
    pl_rvflag BOOLEAN DEFAULT FALSE, -- Radial velocity flag
    pl_imgflag BOOLEAN DEFAULT FALSE, -- Imaging flag
    pl_astflag BOOLEAN DEFAULT FALSE, -- Astrometry flag
    
    pl_trandep NUMERIC(8, 6), -- Transit depth (%)
    pl_trandur NUMERIC(8, 4), -- Transit duration (hours)
    
    -- Host star properties
    st_teff NUMERIC(8, 2), -- Stellar effective temperature (K)
    st_teff_err1 NUMERIC(8, 2), -- Stellar temperature upper error
    st_teff_err2 NUMERIC(8, 2), -- Stellar temperature lower error
    
    st_rad NUMERIC(8, 4), -- Stellar radius (Solar radii)
    st_raderr1 NUMERIC(8, 4), -- Stellar radius upper error
    st_raderr2 NUMERIC(8, 4), -- Stellar radius lower error
    
    st_mass NUMERIC(8, 4), -- Stellar mass (Solar masses)
    st_masserr1 NUMERIC(8, 4), -- Stellar mass upper error
    st_masserr2 NUMERIC(8, 4), -- Stellar mass lower error
    
    st_logg NUMERIC(8, 4), -- Stellar surface gravity (log10(cm/s^2))
    st_loggerr1 NUMERIC(8, 4), -- Stellar surface gravity upper error
    st_loggerr2 NUMERIC(8, 4), -- Stellar surface gravity lower error
    
    st_lum NUMERIC(10, 6), -- Stellar luminosity (Solar luminosities)
    st_lumerr1 NUMERIC(10, 6), -- Stellar luminosity upper error
    st_lumerr2 NUMERIC(10, 6), -- Stellar luminosity lower error
    
    st_age NUMERIC(8, 4), -- Stellar age (Gyr)
    st_ageerr1 NUMERIC(8, 4), -- Stellar age upper error
    st_ageerr2 NUMERIC(8, 4), -- Stellar age lower error
    
    st_met NUMERIC(8, 4), -- Stellar metallicity [Fe/H]
    st_meterr1 NUMERIC(8, 4), -- Stellar metallicity upper error
    st_meterr2 NUMERIC(8, 4), -- Stellar metallicity lower error
    
    -- Positional data
    ra NUMERIC(12, 8), -- Right Ascension (degrees)
    dec NUMERIC(11, 8), -- Declination (degrees)
    sy_dist NUMERIC(10, 6), -- Distance to system (parsecs)
    sy_disterr1 NUMERIC(10, 6), -- Distance upper error
    sy_disterr2 NUMERIC(10, 6), -- Distance lower error
    
    -- System information
    sy_snum INTEGER, -- Number of stars in system
    sy_pnum INTEGER, -- Number of planets in system
    cb_flag BOOLEAN DEFAULT FALSE, -- Circumbinary flag
    
    -- Derived/calculated fields for app usage
    habitable_zone_flag BOOLEAN DEFAULT FALSE, -- Our calculated habitability flag
    earth_similarity_index NUMERIC(5, 3), -- Calculated ESI (0-1)
    estimated_day_length NUMERIC(8, 2), -- Estimated day length in hours
    surface_gravity NUMERIC(8, 4), -- Surface gravity relative to Earth
    escape_velocity NUMERIC(8, 2), -- Escape velocity (km/s)
    
    -- Display/UI fields
    description TEXT, -- Human-readable description
    notable_features TEXT[], -- Array of notable characteristics
    discovery_story TEXT, -- Story about how it was discovered
    comparison_text TEXT, -- Comparison to Solar System objects
    icon VARCHAR(10) DEFAULT '🪐', -- Emoji icon for display
    color_code VARCHAR(20) DEFAULT 'text-purple-400', -- CSS color class
    
    -- Metadata
    source_database VARCHAR(50) DEFAULT 'NASA Exoplanet Archive',
    nasa_archive_link VARCHAR(500), -- Link to NASA archive entry
    data_quality_flag VARCHAR(20), -- Data quality indicator
    confirmation_status VARCHAR(50), -- Confirmed, candidate, disputed, etc.
    
    -- Timestamps
    rowupdate TIMESTAMP, -- Last update from NASA archive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exoplanets_hostname ON public.exoplanets (hostname);
CREATE INDEX IF NOT EXISTS idx_exoplanets_disc_year ON public.exoplanets (disc_year);
CREATE INDEX IF NOT EXISTS idx_exoplanets_disc_method ON public.exoplanets (disc_method);
CREATE INDEX IF NOT EXISTS idx_exoplanets_habitable ON public.exoplanets (habitable_zone_flag);
CREATE INDEX IF NOT EXISTS idx_exoplanets_size ON public.exoplanets (pl_rade);
CREATE INDEX IF NOT EXISTS idx_exoplanets_distance ON public.exoplanets (sy_dist);
CREATE INDEX IF NOT EXISTS idx_exoplanets_updated ON public.exoplanets (updated_at);
CREATE INDEX IF NOT EXISTS idx_exoplanets_confirmation ON public.exoplanets (confirmation_status);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_exoplanets_size_habitable ON public.exoplanets (pl_rade, habitable_zone_flag) WHERE pl_rade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exoplanets_recent_discoveries ON public.exoplanets (disc_year, created_at) WHERE disc_year >= 2020;

-- Enable Row Level Security (RLS)
ALTER TABLE public.exoplanets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users" ON public.exoplanets
    FOR SELECT USING (TRUE);

-- Create policy for service role to insert/update
CREATE POLICY "Enable full access for service role" ON public.exoplanets
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.exoplanets;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.exoplanets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Function to calculate habitability score
CREATE OR REPLACE FUNCTION public.calculate_habitability_score(
    planet_radius NUMERIC,
    equilibrium_temp NUMERIC,
    stellar_flux NUMERIC,
    orbital_period NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    score NUMERIC := 0;
    temp_score NUMERIC := 0;
    size_score NUMERIC := 0;
    flux_score NUMERIC := 0;
BEGIN
    -- Size score (Earth-like = 1.0)
    IF planet_radius IS NOT NULL THEN
        size_score := 1.0 - ABS(planet_radius - 1.0) / 4.0;
        size_score := GREATEST(0, LEAST(1, size_score));
        score := score + size_score * 0.3;
    END IF;
    
    -- Temperature score (Earth-like = 288K)
    IF equilibrium_temp IS NOT NULL THEN
        temp_score := 1.0 - ABS(equilibrium_temp - 288) / 150.0;
        temp_score := GREATEST(0, LEAST(1, temp_score));
        score := score + temp_score * 0.4;
    END IF;
    
    -- Flux score (Earth flux = 1.0)
    IF stellar_flux IS NOT NULL THEN
        flux_score := 1.0 - ABS(LN(stellar_flux)) / 2.0;
        flux_score := GREATEST(0, LEAST(1, flux_score));
        score := score + flux_score * 0.3;
    END IF;
    
    RETURN ROUND(score, 3);
END;
$$ LANGUAGE plpgsql;

-- Function to generate planet description
CREATE OR REPLACE FUNCTION public.generate_planet_description(planet_row public.exoplanets)
RETURNS TEXT AS $$
DECLARE
    description TEXT := '';
    size_text TEXT := '';
    temp_text TEXT := '';
    discovery_text TEXT := '';
BEGIN
    -- Size description
    IF planet_row.pl_rade IS NOT NULL THEN
        IF planet_row.pl_rade < 0.5 THEN
            size_text := 'sub-Earth sized';
        ELSIF planet_row.pl_rade < 1.5 THEN
            size_text := 'Earth-sized';
        ELSIF planet_row.pl_rade < 2.5 THEN
            size_text := 'super-Earth';
        ELSE
            size_text := 'large rocky planet or mini-Neptune';
        END IF;
    END IF;
    
    -- Temperature description
    IF planet_row.pl_eqt IS NOT NULL THEN
        IF planet_row.pl_eqt < 200 THEN
            temp_text := 'frozen world';
        ELSIF planet_row.pl_eqt < 320 THEN
            temp_text := 'potentially habitable world';
        ELSIF planet_row.pl_eqt < 500 THEN
            temp_text := 'warm planet';
        ELSE
            temp_text := 'scorching hot world';
        END IF;
    END IF;
    
    -- Discovery text
    IF planet_row.disc_year IS NOT NULL THEN
        discovery_text := ' discovered in ' || planet_row.disc_year;
        IF planet_row.disc_method IS NOT NULL THEN
            discovery_text := discovery_text || ' using the ' || LOWER(planet_row.disc_method) || ' method';
        END IF;
    END IF;
    
    -- Combine description
    description := COALESCE(size_text, 'An exoplanet');
    IF temp_text IS NOT NULL THEN
        description := description || ' ' || temp_text;
    END IF;
    
    IF planet_row.sy_dist IS NOT NULL THEN
        description := description || ' located ' || ROUND(planet_row.sy_dist * 3.26, 1) || ' light-years away';
    END IF;
    
    description := description || discovery_text || '.';
    
    RETURN description;
END;
$$ LANGUAGE plpgsql;

-- Create a view for the most interesting exoplanets
CREATE OR REPLACE VIEW public.featured_exoplanets AS
SELECT 
    *,
    calculate_habitability_score(pl_rade, pl_eqt, pl_insol, pl_orbper) as habitability_score,
    generate_planet_description(exoplanets.*) as auto_description
FROM public.exoplanets
WHERE 
    confirmation_status = 'CONFIRMED'
    AND (
        habitable_zone_flag = TRUE
        OR pl_rade BETWEEN 0.5 AND 2.0
        OR sy_dist < 50
        OR disc_year >= 2020
    )
ORDER BY 
    habitable_zone_flag DESC,
    calculate_habitability_score(pl_rade, pl_eqt, pl_insol, pl_orbper) DESC,
    sy_dist ASC NULLS LAST;

-- Create a statistics view
CREATE OR REPLACE VIEW public.exoplanet_stats AS
SELECT 
    COUNT(*) as total_confirmed,
    COUNT(*) FILTER (WHERE disc_year >= 2020) as recent_discoveries,
    COUNT(*) FILTER (WHERE habitable_zone_flag = TRUE) as potentially_habitable,
    COUNT(*) FILTER (WHERE pl_rade BETWEEN 0.8 AND 1.2 AND pl_rade IS NOT NULL) as earth_sized,
    COUNT(*) FILTER (WHERE sy_dist < 100 AND sy_dist IS NOT NULL) as nearby_systems,
    ROUND(AVG(sy_dist * 3.26), 1) as avg_distance_ly,
    ROUND(AVG(pl_rade), 2) as avg_radius_earth,
    MAX(disc_year) as latest_discovery_year,
    MIN(sy_dist * 3.26) as closest_distance_ly
FROM public.exoplanets
WHERE confirmation_status = 'CONFIRMED';

-- Insert some sample data for testing
INSERT INTO public.exoplanets (
    pl_name, hostname, disc_year, disc_method, pl_rade, pl_eqt,
    sy_dist, habitable_zone_flag, description, icon, color_code,
    confirmation_status
) VALUES 
(
    'Proxima Centauri b', 'Proxima Centauri', 2016, 'Radial Velocity',
    1.1, 234, 1.3, TRUE,
    'The closest potentially habitable exoplanet to Earth, orbiting in the habitable zone of the nearest star to the Sun.',
    '🌍', 'text-green-400', 'CONFIRMED'
),
(
    'TRAPPIST-1 e', 'TRAPPIST-1', 2017, 'Transit',
    0.92, 251, 12.5, TRUE,
    'One of seven Earth-sized planets in the TRAPPIST-1 system, located in the habitable zone of an ultra-cool dwarf star.',
    '🌏', 'text-blue-400', 'CONFIRMED'
),
(
    'Kepler-442 b', 'Kepler-442', 2015, 'Transit',
    1.34, 233, 370, TRUE,
    'A super-Earth in the habitable zone of its star, with a 112-day orbital period.',
    '🌎', 'text-purple-400', 'CONFIRMED'
)
ON CONFLICT (pl_name) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON public.exoplanets TO anon;
GRANT SELECT ON public.featured_exoplanets TO anon;
GRANT SELECT ON public.exoplanet_stats TO anon;
GRANT ALL ON public.exoplanets TO service_role;

-- Create batch update logs table
CREATE TABLE IF NOT EXISTS public.batch_update_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    records_processed INTEGER DEFAULT 0,
    new_records INTEGER DEFAULT 0,
    updated_records INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    errors TEXT[],
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exoplanet notifications table
CREATE TABLE IF NOT EXISTS public.exoplanet_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    planets_affected TEXT[],
    severity VARCHAR(20) DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for batch logs and notifications
CREATE INDEX IF NOT EXISTS idx_batch_logs_operation ON public.batch_update_logs (operation, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_batch_logs_success ON public.batch_update_logs (success, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.exoplanet_notifications (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.exoplanet_notifications (read_status, created_at DESC) WHERE read_status = FALSE;

-- Enable RLS for new tables
ALTER TABLE public.batch_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exoplanet_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable read access for batch logs" ON public.batch_update_logs
    FOR SELECT USING (TRUE);

CREATE POLICY "Enable read access for notifications" ON public.exoplanet_notifications
    FOR SELECT USING (TRUE);

CREATE POLICY "Enable full access for service role on batch logs" ON public.batch_update_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable full access for service role on notifications" ON public.exoplanet_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions for new tables
GRANT SELECT ON public.batch_update_logs TO anon;
GRANT SELECT ON public.exoplanet_notifications TO anon;
GRANT ALL ON public.batch_update_logs TO service_role;
GRANT ALL ON public.exoplanet_notifications TO service_role;

-- Comments for documentation
COMMENT ON TABLE public.exoplanets IS 'Cache of exoplanet data from NASA Exoplanet Archive for high-performance queries';
COMMENT ON COLUMN public.exoplanets.pl_name IS 'Official planet name from NASA Exoplanet Archive';
COMMENT ON COLUMN public.exoplanets.habitable_zone_flag IS 'Our calculated flag for potentially habitable worlds';
COMMENT ON COLUMN public.exoplanets.earth_similarity_index IS 'Earth Similarity Index (0-1, where 1 is identical to Earth)';
COMMENT ON VIEW public.featured_exoplanets IS 'Curated list of the most interesting exoplanets for display';
COMMENT ON VIEW public.exoplanet_stats IS 'Summary statistics for exoplanet dashboard';
COMMENT ON TABLE public.batch_update_logs IS 'Logs of batch update operations for monitoring and debugging';
COMMENT ON TABLE public.exoplanet_notifications IS 'Notifications about exoplanet discoveries and data updates';
