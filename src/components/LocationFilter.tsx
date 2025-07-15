import React from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/form-input';
import { useGeolocation } from '../hooks/useGeolocation';
import { cn } from '../lib/utils';

interface LocationFilterProps {
  onLocationChange: (latitude: number | null, longitude: number | null) => void;
  isEnabled: boolean;
  className?: string;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  onLocationChange,
  isEnabled,
  className,
}) => {
  const { latitude, longitude, error, loading } = useGeolocation();

  React.useEffect(() => {
    onLocationChange(latitude, longitude);
  }, [latitude, longitude]); // Removed onLocationChange and isEnabled from dependencies to prevent infinite loop

  const toggleLocation = () => {
    if (isEnabled) {
      onLocationChange(null, null);
    } else if (latitude && longitude) {
      onLocationChange(latitude, longitude);
    }
  };

  const getLocationText = () => {
    if (!isEnabled) return 'Enable Location Filter';
    if (loading) return 'Getting location...';
    if (error) return 'Location unavailable';
    if (latitude && longitude) return 'Location-based filtering active';
    return 'Enable Location Filter';
  };

  const getLocationIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={toggleLocation}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {getLocationIcon()}
        {getLocationText()}
      </Button>

      {error && (
        <div className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {isEnabled && latitude && longitude && (
        <div className="text-xs text-muted-foreground">
          Showing news near your location
        </div>
      )}
    </div>
  );
};