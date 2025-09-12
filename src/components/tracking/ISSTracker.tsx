import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Satellite, Navigation, Clock, MapPin, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { satelliteApi, spaceWeatherApi, type SatellitePosition, type SatellitePass, type ISSRelativeInfo, type SpaceWeatherAlert } from '@/services/api';

interface ISSTrackerProps {
  className?: string;
}

export function ISSTracker({ className = '' }: ISSTrackerProps) {
  const [issPosition, setIssPosition] = useState<SatellitePosition | null>(null);
  const [passPredictions, setPassPredictions] = useState<SatellitePass[]>([]);
  const [relativeInfo, setRelativeInfo] = useState<ISSRelativeInfo | null>(null);
  const [spaceWeatherAlerts, setSpaceWeatherAlerts] = useState<SpaceWeatherAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
          // Use fallback location (NASA Houston)
          setUserLocation({ lat: 29.5577, lng: -95.0858 });
        }
      );
    } else {
      // Use fallback location
      setUserLocation({ lat: 29.5577, lng: -95.0858 });
    }
  }, []);

  // Fetch ISS data
  const fetchISSData = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const [position, relative, alerts] = await Promise.all([
        satelliteApi.getISSPosition(),
        satelliteApi.getISSRelativeToUser(userLocation.lat, userLocation.lng),
        spaceWeatherApi.getAlerts()
      ]);

      setIssPosition(position);
      setRelativeInfo(relative);
      setSpaceWeatherAlerts(alerts);

      // Get pass predictions separately as it's location-dependent
      const passes = await satelliteApi.getISSPassPredictions(userLocation.lat, userLocation.lng, 7);
      setPassPredictions(passes.slice(0, 5)); // Next 5 passes

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch ISS data:', err);
      setError('Failed to load ISS tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    if (userLocation) {
      fetchISSData();
    }
  }, [userLocation]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!autoRefresh || !userLocation) return;

    const interval = setInterval(fetchISSData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, userLocation]);

  // Format coordinates
  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(2)}° ${direction}`;
  };

  // Format distance
  const formatDistance = (km: number) => {
    if (km < 1000) return `${Math.round(km)} km`;
    return `${(km / 1000).toFixed(1)}k km`;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Get visibility status color
  const getVisibilityColor = (visibility: SatellitePosition['visibility']) => {
    switch (visibility) {
      case 'sunlit': return 'text-yellow-400';
      case 'visible': return 'text-green-400';
      case 'eclipsed': return 'text-gray-400';
      default: return 'text-foreground';
    }
  };

  // Get pass type color
  const getPassTypeColor = (type: SatellitePass['type']) => {
    switch (type) {
      case 'visible': return 'bg-green-500/20 text-green-400';
      case 'civil_twilight': return 'bg-blue-500/20 text-blue-400';
      case 'daylight': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-foreground/20 text-foreground';
    }
  };

  if (loading && !issPosition) {
    return (
      <div className={`flex items-center justify-center p-8 hud-panel ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Satellite className="w-8 h-8 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
          </div>
          <p className="font-orbitron text-cyan-400">Acquiring ISS Signal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`hud-panel ${className}`}>
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="font-orbitron text-destructive font-bold">ISS Tracking Error</p>
          <p className="text-sm text-foreground-secondary text-center">{error}</p>
          <Button onClick={fetchISSData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ISS Current Position */}
      <Card className="hud-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Satellite className="w-6 h-6 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="font-orbitron text-cyan-400">
                  International Space Station
                </CardTitle>
                <CardDescription>
                  Real-time orbital tracking • Updated {lastUpdate.toLocaleTimeString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
              >
                <Radio className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                {autoRefresh ? 'Live' : 'Manual'}
              </Button>
              <Button onClick={fetchISSData} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {issPosition && (
            <>
              {/* Position Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Latitude</span>
                  <span className="font-mono text-lg font-bold text-cyan-400">
                    {formatCoordinate(issPosition.latitude, 'lat')}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Longitude</span>
                  <span className="font-mono text-lg font-bold text-cyan-400">
                    {formatCoordinate(issPosition.longitude, 'lng')}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Altitude</span>
                  <span className="font-mono text-lg font-bold text-purple-400">
                    {issPosition.altitude.toFixed(1)} km
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Velocity</span>
                  <span className="font-mono text-lg font-bold text-green-400">
                    {issPosition.velocity.toFixed(2)} km/s
                  </span>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getVisibilityColor(issPosition.visibility)} bg-transparent border-current`}>
                  {issPosition.visibility.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-foreground-secondary">
                  Footprint: {formatDistance(issPosition.footprint)}
                </Badge>
                <Badge variant="outline" className="text-foreground-secondary">
                  ID: {issPosition.satelliteId}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Relative Position */}
        {relativeInfo && (
          <Card className="hud-panel">
            <CardHeader>
              <CardTitle className="font-orbitron text-purple-400 flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Your Location
              </CardTitle>
              <CardDescription>
                ISS relative to your position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Distance</span>
                  <span className="font-mono text-xl font-bold text-purple-400">
                    {formatDistance(relativeInfo.distanceFromUser)}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-foreground-secondary">Direction</span>
                  <span className="font-mono text-xl font-bold text-cyan-400">
                    {relativeInfo.direction}
                  </span>
                </div>
              </div>

              {relativeInfo.nextPass && (
                <div className="mt-4 p-3 border border-green-500/20 rounded-md bg-green-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Next Visible Pass</span>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-1">
                    {new Date(relativeInfo.nextPass.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Duration: {formatDuration(relativeInfo.nextPass.duration)} • 
                    Max elevation: {relativeInfo.nextPass.maxElevation}°
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pass Predictions */}
        <Card className="hud-panel">
          <CardHeader>
            <CardTitle className="font-orbitron text-green-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pass Predictions
            </CardTitle>
            <CardDescription>
              Next visible passes over your location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {passPredictions.length === 0 ? (
                <p className="text-sm text-foreground-secondary">No visible passes in the next 7 days</p>
              ) : (
                passPredictions.map((pass, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border/30 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPassTypeColor(pass.type)}>
                          {pass.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {new Date(pass.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        {new Date(pass.startTime).toLocaleTimeString()} • 
                        {formatDuration(pass.duration)} • 
                        Max: {pass.maxElevation}°
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {pass.direction} • Magnitude: {pass.magnitude.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      {pass.visible && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          Visible
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Space Weather Alerts */}
      {spaceWeatherAlerts.length > 0 && (
        <Card className="hud-panel">
          <CardHeader>
            <CardTitle className="font-orbitron text-yellow-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Space Weather Alerts
            </CardTitle>
            <CardDescription>
              Current solar activity affecting satellite operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spaceWeatherAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border border-border/30 rounded-md">
                  <div className="text-2xl">{alert.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${alert.color}`}>{alert.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-secondary mb-1">
                      {alert.description}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      Impact: {alert.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
