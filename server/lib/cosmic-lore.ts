// AI-powered cosmic lore generator for enhanced immersion
// This service generates creative planet descriptions, lore, and stories

export interface CosmicLore {
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

export interface LoreGenerationRequest {
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

// Pre-generated lore templates and fragments for fallback
const LORE_TEMPLATES = {
  description: {
    habitable: [
      "A world where {element} meets possibility, {planet} orbits {star} in the precious zone where liquid water could exist.",
      "In the cosmic dance of {star}, {planet} maintains the delicate balance necessary for life as we know it.",
      "This {size} world holds secrets in its {atmosphere}, potentially harboring the conditions for life to flourish."
    ],
    hostile: [
      "A realm of extremes, {planet} challenges our understanding of planetary formation and survival.",
      "Beneath {star}'s harsh embrace, {planet} endures conditions that would be impossible on Earth.",
      "This alien world represents the diversity of planetary environments across the galaxy."
    ]
  },
  history: [
    "Born from the stellar forge of {star} approximately {age} billion years ago, {planet} has witnessed cosmic epochs unfold.",
    "The discovery of {planet} in {year} marked a new chapter in humanity's understanding of distant worlds.",
    "For eons, {planet} has danced around {star}, its story written in the language of orbital mechanics and time."
  ],
  civilization: [
    "If life exists on {planet}, it would have evolved under conditions unlike anything on Earth.",
    "The potential inhabitants of {planet} would experience days of {dayLength} and seasons unlike our own.",
    "Any civilization on {planet} would have developed unique adaptations to their {environment} world."
  ],
  environment: [
    "The surface of {planet} is sculpted by forces both alien and familiar, creating landscapes beyond imagination.",
    "Weather patterns on {planet} follow the rhythm of its {period}-day orbit around {star}.",
    "The environmental conditions on {planet} represent a natural laboratory for understanding planetary science."
  ],
  mystery: [
    "What secrets does {planet} hold in its {atmosphere}? Only future missions may reveal the truth.",
    "The enigma of {planet} continues to puzzle scientists, offering more questions than answers.",
    "Hidden within the data about {planet} are clues to the greater mysteries of planetary formation."
  ],
  discovery_story: [
    "The hunt for {planet} began with tiny variations in starlight, detected by {method} observations.",
    "Astronomers celebrated when {planet} revealed itself through the precise measurements of {method}.",
    "The discovery of {planet} represents humanity's growing ability to find Earth-like worlds among the stars."
  ]
};

// Atmospheric and environmental descriptors
const DESCRIPTORS = {
  size: {
    small: ['diminutive', 'compact', 'modest', 'petite'],
    earth: ['Earth-sized', 'familiar-sized', 'terrestrial', 'comparable'],
    large: ['massive', 'colossal', 'giant', 'enormous'],
    super: ['super-terrestrial', 'super-Earth', 'enhanced', 'amplified']
  },
  temperature: {
    frozen: ['frozen', 'icy', 'glacial', 'arctic', 'crystalline'],
    cool: ['cool', 'temperate', 'mild', 'moderate'],
    warm: ['warm', 'balmy', 'heated', 'sun-kissed'],
    hot: ['scorching', 'blazing', 'infernal', 'molten', 'furnace-like']
  },
  atmosphere: {
    thin: ['wispy', 'delicate', 'gossamer', 'ethereal'],
    thick: ['dense', 'heavy', 'substantial', 'enveloping'],
    toxic: ['poisonous', 'hostile', 'corrosive', 'deadly'],
    mysterious: ['enigmatic', 'shrouded', 'veiled', 'hidden']
  },
  discovery: {
    transit: ['the subtle dance of shadows', 'the dimming of stellar light', 'celestial eclipses'],
    radial_velocity: ['the gravitational whispers', 'stellar wobbles', 'the pull of unseen worlds'],
    direct_imaging: ['captured light from distant realms', 'direct observation', 'photographic evidence'],
    microlensing: ['gravitational lensing', 'the bending of spacetime', 'cosmic magnification']
  }
};

// Generate cosmic lore using templates and creative combinations
export function generateCosmicLore(request: LoreGenerationRequest): CosmicLore {
  const { planetData, category, tone, length } = request;
  
  const lore: CosmicLore = {
    id: `lore_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    planetName: planetData.name,
    category,
    title: generateTitle(planetData, category),
    content: '',
    tone,
    length,
    tags: generateTags(planetData, category),
    generated: true,
    timestamp: new Date().toISOString()
  };

  // Generate content based on category and planet data
  lore.content = generateContent(planetData, category, tone, length);

  return lore;
}

function generateTitle(planetData: any, category: CosmicLore['category']): string {
  const name = planetData.name;
  
  const titleTemplates = {
    description: [
      `${name}: A Cosmic Portrait`,
      `The World of ${name}`,
      `Discovering ${name}`,
      `${name} Unveiled`
    ],
    history: [
      `The Chronicles of ${name}`,
      `${name}: A Cosmic History`,
      `The Story of ${name}`,
      `Through Time: ${name}`
    ],
    civilization: [
      `Life on ${name}`,
      `The Potential of ${name}`,
      `Imagining ${name}'s Inhabitants`,
      `Civilization and ${name}`
    ],
    environment: [
      `The Landscape of ${name}`,
      `${name}'s Alien Environment`,
      `Weather and Worlds: ${name}`,
      `The Surface of ${name}`
    ],
    mystery: [
      `The Enigma of ${name}`,
      `Mysteries of ${name}`,
      `What Lies Hidden on ${name}?`,
      `The Secrets of ${name}`
    ],
    discovery_story: [
      `Finding ${name}`,
      `The Discovery of ${name}`,
      `How We Found ${name}`,
      `${name}: From Signal to World`
    ]
  };

  const templates = titleTemplates[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateContent(planetData: any, category: CosmicLore['category'], tone: CosmicLore['tone'], length: CosmicLore['length']): string {
  const placeholders = createPlaceholders(planetData);
  let baseContent = '';

  // Select base template
  if (category === 'description') {
    const isHabitable = planetData.habitableZone;
    const templates = isHabitable ? LORE_TEMPLATES.description.habitable : LORE_TEMPLATES.description.hostile;
    baseContent = templates[Math.floor(Math.random() * templates.length)];
  } else {
    const templates = LORE_TEMPLATES[category];
    baseContent = templates[Math.floor(Math.random() * templates.length)];
  }

  // Replace placeholders
  let content = replacePlaceholders(baseContent, placeholders);

  // Adjust for tone
  content = adjustForTone(content, tone, planetData);

  // Adjust for length
  content = adjustForLength(content, length, planetData, category);

  return content;
}

function createPlaceholders(planetData: any): Record<string, string> {
  const placeholders: Record<string, string> = {
    planet: planetData.name,
    star: planetData.hostStar || 'its parent star',
    year: planetData.discoveryYear?.toString() || 'recent years',
    method: planetData.discoveryMethod || 'astronomical observations',
    period: planetData.orbitalPeriod?.toFixed(1) || 'unknown'
  };

  // Add size descriptor
  if (planetData.planetRadius) {
    if (planetData.planetRadius < 0.8) {
      placeholders.size = getRandomElement(DESCRIPTORS.size.small);
    } else if (planetData.planetRadius <= 1.2) {
      placeholders.size = getRandomElement(DESCRIPTORS.size.earth);
    } else if (planetData.planetRadius <= 2.0) {
      placeholders.size = getRandomElement(DESCRIPTORS.size.super);
    } else {
      placeholders.size = getRandomElement(DESCRIPTORS.size.large);
    }
  } else {
    placeholders.size = 'mysterious';
  }

  // Add temperature descriptor
  if (planetData.temperature) {
    if (planetData.temperature < 200) {
      placeholders.element = getRandomElement(DESCRIPTORS.temperature.frozen);
    } else if (planetData.temperature < 320) {
      placeholders.element = getRandomElement(DESCRIPTORS.temperature.cool);
    } else if (planetData.temperature < 400) {
      placeholders.element = getRandomElement(DESCRIPTORS.temperature.warm);
    } else {
      placeholders.element = getRandomElement(DESCRIPTORS.temperature.hot);
    }
  } else {
    placeholders.element = 'mystery';
  }

  // Add atmosphere descriptor
  placeholders.atmosphere = getRandomElement(DESCRIPTORS.atmosphere.mysterious);

  // Add environment descriptor
  placeholders.environment = placeholders.element;

  // Add discovery method descriptor
  const method = planetData.discoveryMethod?.toLowerCase() || '';
  if (method.includes('transit')) {
    placeholders.methodDesc = getRandomElement(DESCRIPTORS.discovery.transit);
  } else if (method.includes('radial') || method.includes('velocity')) {
    placeholders.methodDesc = getRandomElement(DESCRIPTORS.discovery.radial_velocity);
  } else if (method.includes('imaging')) {
    placeholders.methodDesc = getRandomElement(DESCRIPTORS.discovery.direct_imaging);
  } else if (method.includes('microlensing')) {
    placeholders.methodDesc = getRandomElement(DESCRIPTORS.discovery.microlensing);
  } else {
    placeholders.methodDesc = 'advanced astronomical techniques';
  }

  // Calculate day length estimate
  if (planetData.orbitalPeriod) {
    placeholders.dayLength = `${(planetData.orbitalPeriod * 24).toFixed(1)} hours`;
  } else {
    placeholders.dayLength = 'unknown duration';
  }

  // Estimate age (very rough approximation)
  placeholders.age = ((Math.random() * 10) + 1).toFixed(1);

  return placeholders;
}

function replacePlaceholders(content: string, placeholders: Record<string, string>): string {
  let result = content;
  
  Object.entries(placeholders).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

function adjustForTone(content: string, tone: CosmicLore['tone'], planetData: any): string {
  const toneModifiers = {
    scientific: {
      prefix: 'Scientific analysis reveals that ',
      suffix: ' This data provides valuable insights into planetary formation and evolution.',
      vocabulary: ['observed', 'measured', 'calculated', 'determined', 'analyzed']
    },
    poetic: {
      prefix: 'In the vast tapestry of the cosmos, ',
      suffix: ' Such is the poetry written in starlight and planetary motion.',
      vocabulary: ['dances', 'whispers', 'dreams', 'sings', 'glows']
    },
    mysterious: {
      prefix: 'Hidden within the depths of space, ',
      suffix: ' The full truth remains shrouded in cosmic mystery.',
      vocabulary: ['conceals', 'hints at', 'suggests', 'veils', 'harbors']
    },
    adventure: {
      prefix: 'Imagine embarking on a journey to ',
      suffix: ' What adventures await future explorers of this distant realm?',
      vocabulary: ['beckons', 'challenges', 'invites', 'calls to', 'awaits']
    },
    documentary: {
      prefix: 'Located approximately ' + (planetData.distanceFromEarth?.toFixed(1) || 'unknown') + ' light-years away, ',
      suffix: ' Further observations will continue to refine our understanding.',
      vocabulary: ['exhibits', 'demonstrates', 'shows evidence of', 'presents', 'indicates']
    }
  };

  const modifier = toneModifiers[tone];
  return modifier.prefix + content + modifier.suffix;
}

function adjustForLength(content: string, length: CosmicLore['length'], planetData: any, category: CosmicLore['category']): string {
  if (length === 'short') {
    return content;
  }

  if (length === 'medium') {
    // Add one additional sentence
    const additionalContent = generateAdditionalContent(planetData, category, 'medium');
    return content + ' ' + additionalContent;
  }

  if (length === 'long') {
    // Add multiple additional sentences
    const additionalContent1 = generateAdditionalContent(planetData, category, 'medium');
    const additionalContent2 = generateAdditionalContent(planetData, category, 'long');
    return content + ' ' + additionalContent1 + ' ' + additionalContent2;
  }

  return content;
}

function generateAdditionalContent(planetData: any, category: CosmicLore['category'], length: string): string {
  const additionalTemplates = {
    description: [
      'The orbital characteristics of this world suggest a complex gravitational relationship with its host star.',
      'Surface conditions would be unlike anything experienced on Earth, shaped by unique atmospheric dynamics.',
      'The composition and structure of this planet offer insights into the diversity of worlds beyond our solar system.'
    ],
    history: [
      'Over billions of years, this world has evolved under conditions vastly different from Earth.',
      'The planet\'s formation history is written in its current orbital and physical characteristics.',
      'Cosmic events and stellar evolution have shaped the destiny of this distant world.'
    ],
    civilization: [
      'Any potential life forms would have adapted to the unique environmental pressures of this world.',
      'The concept of seasons, weather, and day-night cycles would be fundamentally different here.',
      'Communication with any civilization would face the challenge of vast interstellar distances.'
    ],
    environment: [
      'Atmospheric composition and pressure would create weather patterns beyond earthly imagination.',
      'The planet\'s surface features would be sculpted by geological processes specific to its formation.',
      'Temperature variations across the planet would create distinct climatic zones and phenomena.'
    ],
    mystery: [
      'Current observational limits prevent us from understanding the full nature of this world.',
      'Future space telescopes may reveal surprising characteristics hidden within current data.',
      'The true nature of this planet challenges our assumptions about planetary science.'
    ],
    discovery_story: [
      'The detection required precise measurements at the very edge of current technological capability.',
      'Multiple observation campaigns were necessary to confirm the planet\'s existence and characteristics.',
      'This discovery contributes to our growing catalog of exoplanets and our understanding of their formation.'
    ]
  };

  const templates = additionalTemplates[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateTags(planetData: any, category: CosmicLore['category']): string[] {
  const tags: string[] = [category];

  // Add planet-specific tags
  if (planetData.habitableZone) tags.push('habitable-zone');
  if (planetData.planetRadius && planetData.planetRadius > 2) tags.push('super-earth');
  if (planetData.temperature && planetData.temperature < 273) tags.push('frozen-world');
  if (planetData.temperature && planetData.temperature > 400) tags.push('hot-world');
  if (planetData.distanceFromEarth && planetData.distanceFromEarth < 50) tags.push('nearby');
  if (planetData.discoveryYear && planetData.discoveryYear >= 2020) tags.push('recent-discovery');

  // Add method-specific tags
  if (planetData.discoveryMethod) {
    const method = planetData.discoveryMethod.toLowerCase();
    if (method.includes('transit')) tags.push('transit-detection');
    if (method.includes('radial')) tags.push('radial-velocity');
    if (method.includes('imaging')) tags.push('direct-imaging');
  }

  return tags;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate multiple lore pieces for a planet
export function generatePlanetLoreSet(planetData: any): CosmicLore[] {
  const loreSet: CosmicLore[] = [];

  // Generate different types of lore
  const categories: CosmicLore['category'][] = ['description', 'history', 'environment', 'mystery'];
  const tones: CosmicLore['tone'][] = ['scientific', 'poetic', 'mysterious'];

  categories.forEach(category => {
    const tone = tones[Math.floor(Math.random() * tones.length)];
    const length = Math.random() > 0.5 ? 'medium' : 'short';

    const lore = generateCosmicLore({
      planetData,
      category,
      tone,
      length
    });

    loreSet.push(lore);
  });

  return loreSet;
}

// Get lore recommendations based on planet characteristics
export function getRecommendedLore(planetData: any): { category: CosmicLore['category']; reason: string }[] {
  const recommendations: { category: CosmicLore['category']; reason: string }[] = [];

  // Always recommend basic description
  recommendations.push({
    category: 'description',
    reason: 'Essential overview of the planet\'s characteristics'
  });

  // Recommend based on planet properties
  if (planetData.habitableZone) {
    recommendations.push({
      category: 'civilization',
      reason: 'Potentially habitable world - explore life possibilities'
    });
  }

  if (planetData.discoveryYear && planetData.discoveryYear >= 2015) {
    recommendations.push({
      category: 'discovery_story',
      reason: 'Recent discovery with interesting detection story'
    });
  }

  if (planetData.temperature && (planetData.temperature < 200 || planetData.temperature > 500)) {
    recommendations.push({
      category: 'environment',
      reason: 'Extreme conditions create unique environmental story'
    });
  }

  if (planetData.distanceFromEarth && planetData.distanceFromEarth > 1000) {
    recommendations.push({
      category: 'mystery',
      reason: 'Distant world with many unknowns to explore'
    });
  }

  // Always include history for context
  recommendations.push({
    category: 'history',
    reason: 'Cosmic context and formation story'
  });

  return recommendations;
}
