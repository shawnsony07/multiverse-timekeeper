import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, BookOpen, Zap, Star, Globe, History, Users, Mountain, HelpCircle, Rocket, Copy, RefreshCw, Download, Trash2 } from 'lucide-react';

interface CosmicLore {
  id: string;
  planetName: string;
  category: 'description' | 'history' | 'civilization' | 'environment' | 'mystery' | 'discovery_story';
  title: string;
  content: string;
  tone: 'scientific' | 'poetic' | 'mysterious' | 'adventure' | 'documentary';
  length: 'short' | 'medium' | 'long';
  tags: string[];
  generated: boolean;
  timestamp: string;
}

interface LoreGenerationRequest {
  planetData: {
    name: string;
    hostStar?: string;
    discoveryYear?: number;
    discoveryMethod?: string;
    planetRadius?: number;
    planetMass?: number;
    temperature?: number;
    distanceFromEarth?: number;
    habitableZone?: boolean;
    orbitalPeriod?: number;
  };
  category: CosmicLore['category'];
  tone: CosmicLore['tone'];
  length: CosmicLore['length'];
}

interface ExoplanetData {
  name: string;
  hostStar: string;
  discoveryYear: number;
  discoveryMethod: string;
  planetRadius: number;
  planetMass: number;
  temperature: number;
  distanceFromEarth: number;
  habitableZone: boolean;
  orbitalPeriod: number;
}

export function CosmicLoreGenerator() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetData | null>(null);
  const [customPlanet, setCustomPlanet] = useState({
    name: '',
    hostStar: '',
    discoveryYear: new Date().getFullYear(),
    discoveryMethod: 'Transit',
    planetRadius: 1.0,
    planetMass: 1.0,
    temperature: 288,
    distanceFromEarth: 100,
    habitableZone: false,
    orbitalPeriod: 365
  });
  const [exoplanets, setExoplanets] = useState<ExoplanetData[]>([]);
  const [generatedLore, setGeneratedLore] = useState<CosmicLore[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CosmicLore['category']>('description');
  const [selectedTone, setSelectedTone] = useState<CosmicLore['tone']>('scientific');
  const [selectedLength, setSelectedLength] = useState<CosmicLore['length']>('medium');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [recommendations, setRecommendations] = useState<{ category: CosmicLore['category']; reason: string }[]>([]);

  // Fetch exoplanets from the API
  useEffect(() => {
    fetchExoplanets();
  }, []);

  const fetchExoplanets = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/exoplanets?limit=20');
      if (response.ok) {
        const data = await response.json();
        setExoplanets(data);
      }
    } catch (error) {
      console.error('Error fetching exoplanets:', error);
    }
  };

  // Generate single lore piece
  const generateLore = async () => {
    if (!selectedPlanet && !customPlanet.name) return;
    
    setIsGenerating(true);
    
    const planetData = selectedPlanet || customPlanet;
    const request: LoreGenerationRequest = {
      planetData,
      category: selectedCategory,
      tone: selectedTone,
      length: selectedLength
    };

    try {
      const response = await fetch('http://localhost:4000/api/lore/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const lore: CosmicLore = await response.json();
        setGeneratedLore(prev => [lore, ...prev]);
      }
    } catch (error) {
      console.error('Error generating lore:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate complete lore set
  const generateLoreSet = async () => {
    if (!selectedPlanet && !customPlanet.name) return;
    
    setIsGenerating(true);
    
    const planetData = selectedPlanet || customPlanet;

    try {
      const response = await fetch('http://localhost:4000/api/lore/generate-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planetData }),
      });

      if (response.ok) {
        const loreSet: CosmicLore[] = await response.json();
        setGeneratedLore(prev => [...loreSet, ...prev]);
      }
    } catch (error) {
      console.error('Error generating lore set:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get recommendations for selected planet
  const getRecommendations = async () => {
    if (!selectedPlanet && !customPlanet.name) return;
    
    const planetData = selectedPlanet || customPlanet;

    try {
      const response = await fetch('http://localhost:4000/api/lore/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planetData }),
      });

      if (response.ok) {
        const recs = await response.json();
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Copy lore to clipboard
  const copyLore = (lore: CosmicLore) => {
    const text = `${lore.title}\n\n${lore.content}`;
    navigator.clipboard.writeText(text);
  };

  // Export all lore as text
  const exportLore = () => {
    const text = generatedLore.map(lore => 
      `${lore.title}\nCategory: ${lore.category} | Tone: ${lore.tone} | Length: ${lore.length}\nGenerated: ${new Date(lore.timestamp).toLocaleString()}\n\n${lore.content}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-lore-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryIcons = {
    description: Globe,
    history: History,
    civilization: Users,
    environment: Mountain,
    mystery: HelpCircle,
    discovery_story: Rocket
  };

  const toneColors = {
    scientific: 'text-cyan-400',
    poetic: 'text-purple-400',
    mysterious: 'text-pink-400',
    adventure: 'text-yellow-400',
    documentary: 'text-green-400'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="hud-panel p-8 text-center cosmic-border">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-neon-purple animate-glow" />
          <h2 className="text-3xl font-orbitron font-bold text-neon-purple">
            COSMIC LORE GENERATOR
          </h2>
          <BookOpen className="w-8 h-8 text-neon-purple animate-glow" />
        </div>
        
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-6">
          Harness the power of AI to generate immersive stories, histories, and descriptions 
          for exoplanets across the galaxy. Create compelling narratives that bring distant worlds to life.
        </p>
        
        <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple animate-pulse-cosmic">
          NARRATIVE ENGINE: ACTIVE
        </Badge>
      </Card>

      {/* Planet Selection and Generation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hud-panel p-6">
          <CardHeader className="pb-4">
            <CardTitle className="font-orbitron text-neon-cyan flex items-center gap-2">
              <Star className="w-5 h-5" />
              PLANET SELECTION
            </CardTitle>
            <CardDescription>Choose an exoplanet or create a custom world</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Tabs defaultValue="database">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-4">
                <Select onValueChange={(value) => {
                  const planet = exoplanets.find(p => p.name === value);
                  setSelectedPlanet(planet || null);
                  if (planet) getRecommendations();
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exoplanet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exoplanets.map((planet) => (
                      <SelectItem key={planet.name} value={planet.name}>
                        {planet.name} ({planet.hostStar})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPlanet && (
                  <div className="text-sm space-y-1 bg-surface/30 p-3 rounded">
                    <p><strong>Host Star:</strong> {selectedPlanet.hostStar}</p>
                    <p><strong>Discovery:</strong> {selectedPlanet.discoveryYear} ({selectedPlanet.discoveryMethod})</p>
                    <p><strong>Distance:</strong> {selectedPlanet.distanceFromEarth?.toFixed(1)} ly</p>
                    {selectedPlanet.habitableZone && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Habitable Zone</Badge>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom">
                <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Create Custom Planet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="hud-panel max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-orbitron text-neon-purple">Custom Planet</DialogTitle>
                      <DialogDescription>Design your own world for lore generation</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="planet-name">Planet Name</Label>
                        <Input
                          id="planet-name"
                          value={customPlanet.name}
                          onChange={(e) => setCustomPlanet(prev => ({...prev, name: e.target.value}))}
                          placeholder="e.g. Kepler-442b"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="host-star">Host Star</Label>
                        <Input
                          id="host-star"
                          value={customPlanet.hostStar}
                          onChange={(e) => setCustomPlanet(prev => ({...prev, hostStar: e.target.value}))}
                          placeholder="e.g. Kepler-442"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Discovery Year</Label>
                          <Input
                            type="number"
                            value={customPlanet.discoveryYear}
                            onChange={(e) => setCustomPlanet(prev => ({...prev, discoveryYear: parseInt(e.target.value)}))}
                          />
                        </div>
                        <div>
                          <Label>Distance (ly)</Label>
                          <Input
                            type="number"
                            value={customPlanet.distanceFromEarth}
                            onChange={(e) => setCustomPlanet(prev => ({...prev, distanceFromEarth: parseFloat(e.target.value)}))}
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedPlanet(null);
                          setShowCustomDialog(false);
                          getRecommendations();
                        }}
                        className="w-full"
                        disabled={!customPlanet.name}
                      >
                        Use Custom Planet
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {!selectedPlanet && customPlanet.name && (
                  <div className="text-sm space-y-1 bg-surface/30 p-3 rounded">
                    <p><strong>Name:</strong> {customPlanet.name}</p>
                    <p><strong>Host Star:</strong> {customPlanet.hostStar}</p>
                    <p><strong>Distance:</strong> {customPlanet.distanceFromEarth} ly</p>
                    <Badge className="bg-neon-purple/20 text-neon-purple text-xs">Custom World</Badge>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="hud-panel p-6">
          <CardHeader className="pb-4">
            <CardTitle className="font-orbitron text-neon-cyan flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              GENERATION PARAMETERS
            </CardTitle>
            <CardDescription>Configure the AI narrative engine</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(value: CosmicLore['category']) => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="civilization">Civilization</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="discovery_story">Discovery Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tone</Label>
              <Select value={selectedTone} onValueChange={(value: CosmicLore['tone']) => setSelectedTone(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scientific">Scientific</SelectItem>
                  <SelectItem value="poetic">Poetic</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Length</Label>
              <Select value={selectedLength} onValueChange={(value: CosmicLore['length']) => setSelectedLength(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={generateLore} 
                disabled={isGenerating || (!selectedPlanet && !customPlanet.name)}
                className="flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Lore
              </Button>
              
              <Button 
                onClick={generateLoreSet} 
                disabled={isGenerating || (!selectedPlanet && !customPlanet.name)}
                variant="outline"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="hud-panel p-6">
          <CardHeader className="pb-4">
            <CardTitle className="font-orbitron text-neon-gold flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI RECOMMENDATIONS
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="p-3 bg-surface/30 rounded border border-primary/20 cursor-pointer hover:bg-surface/50 transition-all"
                  onClick={() => setSelectedCategory(rec.category)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs capitalize">{rec.category.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary">{rec.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Lore */}
      {generatedLore.length > 0 && (
        <Card className="hud-panel p-6">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-orbitron text-neon-cyan flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                GENERATED LORE ({generatedLore.length})
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportLore}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button size="sm" variant="outline" onClick={() => setGeneratedLore([])}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {generatedLore.map((lore) => {
                  const CategoryIcon = categoryIcons[lore.category];
                  const toneColor = toneColors[lore.tone];
                  
                  return (
                    <Card key={lore.id} className="bg-surface/30 border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`w-4 h-4 ${toneColor}`} />
                            <CardTitle className="text-lg font-orbitron">{lore.title}</CardTitle>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => copyLore(lore)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge className={`text-xs ${toneColor} bg-transparent border-current`}>
                            {lore.tone}
                          </Badge>
                          <Badge className="text-xs capitalize bg-surface/50">
                            {lore.category.replace('_', ' ')}
                          </Badge>
                          <Badge className="text-xs bg-surface/50">
                            {lore.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-foreground-secondary leading-relaxed">
                          {lore.content}
                        </p>
                        
                        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Planet: {lore.planetName}</span>
                          <span>{new Date(lore.timestamp).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
