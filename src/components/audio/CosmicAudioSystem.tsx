import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Settings, Headphones } from 'lucide-react';

// Audio context for managing Web Audio API
interface AudioLayer {
  id: string;
  name: string;
  category: 'ambient' | 'event' | 'ui' | 'environmental';
  volume: number;
  isActive: boolean;
  oscillator?: OscillatorNode;
  gainNode?: GainNode;
  filter?: BiquadFilterNode;
  parameters?: AudioParameters;
}

interface AudioParameters {
  frequency: number;
  type: OscillatorType;
  filterFreq?: number;
  filterQ?: number;
  modulation?: {
    rate: number;
    depth: number;
  };
}

interface CosmicAudioSystemProps {
  activeTab: string;
  className?: string;
}

export function CosmicAudioSystem({ activeTab, className = '' }: CosmicAudioSystemProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState([50]);
  const [audioLayers, setAudioLayers] = useState<AudioLayer[]>([]);
  const [showControls, setShowControls] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create master gain node
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        masterGainRef.current.gain.value = masterVolume[0] / 100;
        
        console.log('Audio system initialized');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    }
  }, [masterVolume]);

  // Audio layer definitions for different tabs
  const getAudioLayersForTab = (tab: string): AudioLayer[] => {
    const baseLayers: Record<string, AudioLayer[]> = {
      now: [
        {
          id: 'earth-ambient',
          name: 'Earth Atmosphere',
          category: 'ambient',
          volume: 0.6,
          isActive: true,
          parameters: {
            frequency: 110,
            type: 'sine',
            filterFreq: 800,
            filterQ: 1,
            modulation: { rate: 0.1, depth: 0.3 }
          }
        },
        {
          id: 'earth-pulse',
          name: 'Planetary Pulse',
          category: 'environmental',
          volume: 0.4,
          isActive: true,
          parameters: {
            frequency: 55,
            type: 'triangle',
            modulation: { rate: 0.05, depth: 0.2 }
          }
        }
      ],
      galactic: [
        {
          id: 'space-void',
          name: 'Cosmic Void',
          category: 'ambient',
          volume: 0.7,
          isActive: true,
          parameters: {
            frequency: 40,
            type: 'sine',
            filterFreq: 200,
            filterQ: 0.5,
            modulation: { rate: 0.02, depth: 0.5 }
          }
        },
        {
          id: 'stellar-winds',
          name: 'Stellar Winds',
          category: 'environmental',
          volume: 0.5,
          isActive: true,
          parameters: {
            frequency: 80,
            type: 'sawtooth',
            filterFreq: 1200,
            filterQ: 2,
            modulation: { rate: 0.3, depth: 0.4 }
          }
        },
        {
          id: 'nebula-resonance',
          name: 'Nebula Resonance',
          category: 'ambient',
          volume: 0.3,
          isActive: true,
          parameters: {
            frequency: 220,
            type: 'sine',
            modulation: { rate: 0.15, depth: 0.6 }
          }
        }
      ],
      events: [
        {
          id: 'cosmic-activity',
          name: 'Cosmic Activity',
          category: 'event',
          volume: 0.6,
          isActive: true,
          parameters: {
            frequency: 150,
            type: 'square',
            filterFreq: 600,
            filterQ: 1.5,
            modulation: { rate: 0.4, depth: 0.3 }
          }
        },
        {
          id: 'data-stream',
          name: 'Data Streams',
          category: 'ui',
          volume: 0.2,
          isActive: true,
          parameters: {
            frequency: 400,
            type: 'sine',
            modulation: { rate: 2, depth: 0.1 }
          }
        }
      ],
      tracking: [
        {
          id: 'radar-sweep',
          name: 'Radar Sweep',
          category: 'ui',
          volume: 0.4,
          isActive: true,
          parameters: {
            frequency: 800,
            type: 'sine',
            modulation: { rate: 1, depth: 0.2 }
          }
        },
        {
          id: 'satellite-telemetry',
          name: 'Satellite Telemetry',
          category: 'environmental',
          volume: 0.3,
          isActive: true,
          parameters: {
            frequency: 300,
            type: 'square',
            filterFreq: 1000,
            filterQ: 1,
            modulation: { rate: 0.8, depth: 0.15 }
          }
        }
      ],
      wormhole: [
        {
          id: 'quantum-flux',
          name: 'Quantum Flux',
          category: 'ambient',
          volume: 0.8,
          isActive: true,
          parameters: {
            frequency: 60,
            type: 'sine',
            filterFreq: 300,
            filterQ: 3,
            modulation: { rate: 0.7, depth: 0.8 }
          }
        },
        {
          id: 'temporal-distortion',
          name: 'Temporal Distortion',
          category: 'environmental',
          volume: 0.6,
          isActive: true,
          parameters: {
            frequency: 90,
            type: 'sawtooth',
            modulation: { rate: 1.2, depth: 0.5 }
          }
        },
        {
          id: 'wormhole-resonance',
          name: 'Wormhole Resonance',
          category: 'event',
          volume: 0.4,
          isActive: true,
          parameters: {
            frequency: 180,
            type: 'triangle',
            filterFreq: 500,
            filterQ: 2,
            modulation: { rate: 0.3, depth: 0.7 }
          }
        }
      ]
    };

    return baseLayers[tab] || [];
  };

  // Create audio layer with Web Audio API
  const createAudioLayer = useCallback((layer: AudioLayer) => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    try {
      // Create oscillator
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      // Set up oscillator
      oscillator.type = layer.parameters?.type || 'sine';
      oscillator.frequency.setValueAtTime(
        layer.parameters?.frequency || 440,
        audioContextRef.current.currentTime
      );

      // Set up gain
      gainNode.gain.setValueAtTime(
        layer.volume * (layer.isActive ? 1 : 0),
        audioContextRef.current.currentTime
      );

      // Create filter if specified
      let filter: BiquadFilterNode | undefined;
      if (layer.parameters?.filterFreq) {
        filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(
          layer.parameters.filterFreq,
          audioContextRef.current.currentTime
        );
        filter.Q.setValueAtTime(
          layer.parameters.filterQ || 1,
          audioContextRef.current.currentTime
        );
      }

      // Connect nodes
      if (filter) {
        oscillator.connect(filter);
        filter.connect(gainNode);
      } else {
        oscillator.connect(gainNode);
      }
      gainNode.connect(masterGainRef.current);

      // Start oscillator
      oscillator.start();

      // Update layer with nodes
      layer.oscillator = oscillator;
      layer.gainNode = gainNode;
      layer.filter = filter;

      // Apply modulation if specified
      if (layer.parameters?.modulation) {
        const modulationOsc = audioContextRef.current.createOscillator();
        const modulationGain = audioContextRef.current.createGain();
        
        modulationOsc.frequency.setValueAtTime(
          layer.parameters.modulation.rate,
          audioContextRef.current.currentTime
        );
        modulationGain.gain.setValueAtTime(
          layer.parameters.modulation.depth * (layer.parameters.frequency || 440),
          audioContextRef.current.currentTime
        );
        
        modulationOsc.connect(modulationGain);
        modulationGain.connect(oscillator.frequency);
        modulationOsc.start();
      }

    } catch (error) {
      console.error('Error creating audio layer:', error);
    }
  }, []);

  // Stop audio layer
  const stopAudioLayer = useCallback((layer: AudioLayer) => {
    try {
      if (layer.oscillator) {
        layer.oscillator.stop();
        layer.oscillator.disconnect();
        layer.oscillator = undefined;
      }
      if (layer.gainNode) {
        layer.gainNode.disconnect();
        layer.gainNode = undefined;
      }
      if (layer.filter) {
        layer.filter.disconnect();
        layer.filter = undefined;
      }
    } catch (error) {
      console.error('Error stopping audio layer:', error);
    }
  }, []);

  // Update audio layers when tab changes
  useEffect(() => {
    if (!isEnabled) return;

    // Stop all current layers
    audioLayers.forEach(stopAudioLayer);

    // Get new layers for current tab
    const newLayers = getAudioLayersForTab(activeTab);
    setAudioLayers(newLayers);

    // Create new audio layers
    if (audioContextRef.current) {
      newLayers.forEach(createAudioLayer);
    }

    return () => {
      newLayers.forEach(stopAudioLayer);
    };
  }, [activeTab, isEnabled, createAudioLayer, stopAudioLayer]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        masterVolume[0] / 100,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [masterVolume]);

  // Toggle audio system
  const toggleAudio = async () => {
    if (!isEnabled) {
      await initializeAudio();
      setIsEnabled(true);
    } else {
      // Stop all layers
      audioLayers.forEach(stopAudioLayer);
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsEnabled(false);
    }
  };

  // Toggle individual layer
  const toggleLayer = (layerId: string) => {
    setAudioLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newLayer = { ...layer, isActive: !layer.isActive };
        
        // Update gain in real-time
        if (newLayer.gainNode) {
          newLayer.gainNode.gain.setValueAtTime(
            newLayer.volume * (newLayer.isActive ? 1 : 0),
            audioContextRef.current?.currentTime || 0
          );
        }
        
        return newLayer;
      }
      return layer;
    }));
  };

  // Update layer volume
  const updateLayerVolume = (layerId: string, volume: number) => {
    setAudioLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newLayer = { ...layer, volume: volume / 100 };
        
        // Update gain in real-time
        if (newLayer.gainNode) {
          newLayer.gainNode.gain.setValueAtTime(
            newLayer.volume * (newLayer.isActive ? 1 : 0),
            audioContextRef.current?.currentTime || 0
          );
        }
        
        return newLayer;
      }
      return layer;
    }));
  };

  return (
    <div className={`cosmic-audio-system ${className}`}>
      {/* Main Audio Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={toggleAudio}
          variant={isEnabled ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {isEnabled ? 'Audio On' : 'Audio Off'}
        </Button>
        
        <Button
          onClick={() => setShowControls(!showControls)}
          variant="outline"
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        <Badge className="bg-primary/20 text-primary">
          <Headphones className="w-3 h-3 mr-1" />
          {audioLayers.filter(l => l.isActive).length} Active
        </Badge>
      </div>

      {/* Master Volume */}
      {isEnabled && (
        <div className="mb-4">
          <Label className="text-sm font-orbitron text-foreground-secondary mb-2 block">
            Master Volume
          </Label>
          <Slider
            value={masterVolume}
            onValueChange={setMasterVolume}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Audio Layer Controls */}
      {isEnabled && showControls && (
        <Card className="hud-panel p-4">
          <h3 className="text-lg font-orbitron font-bold text-primary mb-4">
            Audio Layers - {activeTab.toUpperCase()}
          </h3>
          
          <div className="space-y-4">
            {audioLayers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-4">
                <Button
                  onClick={() => toggleLayer(layer.id)}
                  variant={layer.isActive ? "default" : "outline"}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {layer.isActive ? 'On' : 'Off'}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{layer.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        layer.category === 'ambient' ? 'text-cyan-400' :
                        layer.category === 'event' ? 'text-yellow-400' :
                        layer.category === 'ui' ? 'text-green-400' :
                        'text-purple-400'
                      }`}
                    >
                      {layer.category}
                    </Badge>
                  </div>
                  
                  <Slider
                    value={[layer.volume * 100]}
                    onValueChange={([value]) => updateLayerVolume(layer.id, value)}
                    max={100}
                    step={1}
                    disabled={!layer.isActive}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-foreground-secondary min-w-[60px] text-right">
                  {layer.parameters?.frequency}Hz
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-foreground-secondary">
            <p>🎵 Procedural ambient soundscapes enhance your cosmic experience</p>
            <p>🔊 Each tab has unique audio layers representing different environments</p>
          </div>
        </Card>
      )}

      {/* Audio Status Indicator */}
      {isEnabled && (
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            audioLayers.some(l => l.isActive) ? 'bg-green-400' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-foreground-secondary font-orbitron">
            AUDIO SYSTEM: {isEnabled ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      )}
    </div>
  );
}
