import { ExploreStop } from './types';

// Venice Food Tour - 5 stops with go-deeper options
export const VENICE_FOOD_TOUR: ExploreStop[] = [
  {
    id: 'stop-1',
    title: 'Rialto Market',
    description: 'Explore Venice\'s bustling fish market where locals have shopped for fresh seafood for over 1000 years.',
    imagePrompt: 'Using the provided character image as reference, show a bustling Rialto fish market scene with Chef Nomi present but not the main focus. PRESERVE the character\'s exact appearance. Emphasize colorful seafood displays on ice, market vendors, and morning light streaming through the stalls.',
    soundscapeFile: 'chef-nomi-delgado_stop1.mp3',
    goDeeper: {
      level1: {
        title: 'Fresh Catch Selection',
        description: 'Watch local chefs select the day\'s best catch and learn how to identify the freshest fish like a Venetian.',
        imagePrompt: 'Show an intimate Rialto market stall scene with glistening seafood on ice, vendors interacting, and Chef Nomi observing at the side. PRESERVE the character\'s exact appearance. Focus on the fish displays and vendor interaction.'
      },
      level2: {
        title: 'Ancient Trading Traditions',
        description: 'Discover the centuries-old trading rituals and hand signals still used by fishmongers and buyers today.',
        imagePrompt: 'Show a weathered Rialto market backdrop with fishmongers using traditional hand gestures, morning shadows casting across the scene, and Chef Nomi nearby observing. PRESERVE the character\'s exact appearance. Focus on the cultural ritual taking place.'
      }
    }
  },
  {
    id: 'stop-2',
    title: 'Bacaro Wine Bar',
    description: 'Step into a cozy Venetian bacaro and discover the culture of cicchetti — small bites paired with local wine.',
    imagePrompt: 'Show the inside of a Venetian bacaro wine bar, with marble counters covered in cicchetti, glowing bottles of wine, and warm lighting. Chef Nomi is present but not the main focus. PRESERVE the character\'s exact appearance. Emphasize the food displays and cozy bar atmosphere.',
    soundscapeFile: 'chef-nomi-delgado_stop1.mp3',
    goDeeper: {
      level1: {
        title: 'Cicchetti Tasting',
        description: 'Sample classic cicchetti like sardines in saor, creamy baccalà, and savory polpette as Chef Nomi explains their history.',
        imagePrompt: 'Show plates of cicchetti spread across the bar counter with wine glasses beside them. Chef Nomi is in the scene but secondary. PRESERVE the character\'s exact appearance. Emphasize the textures of the food and the bar ambiance.'
      },
      level2: {
        title: 'The Ombra Tradition',
        description: 'Learn the story of the Venetian "ombra," a small glass of local wine once enjoyed in the shade of St. Mark\'s bell tower.',
        imagePrompt: 'Show a bar scene with patrons holding small wine glasses ("ombra") and glowing bottles behind the counter. Chef Nomi is nearby but not the focal point. PRESERVE the character\'s exact appearance. Emphasize the glass in hand and cultural atmosphere.'
      }
    }
  },
  {
    id: 'stop-3',
    title: 'Gelateria by the Canal',
    description: 'Pause at a canal-side gelateria and enjoy the Venetian ritual of evening gelato during the passeggiata.',
    imagePrompt: 'Show the exterior of a gelateria by a glowing Venice canal at sunset, colorful gelato tubs visible inside, gondolas drifting in the background. Chef Nomi is present but secondary. PRESERVE the character\'s exact appearance. Emphasize the gelato counter and canal scenery.',
    soundscapeFile: 'chef-nomi-delgado_stop1.mp3',
    goDeeper: {
      level1: {
        title: 'Classic Flavors',
        description: 'Taste timeless flavors like pistachio, stracciatella, and limone while learning how Italians judge the quality of gelato.',
        imagePrompt: 'Show gelato cones with pistachio and stracciatella flavors against the canal backdrop at sunset. Chef Nomi is present but not central. PRESERVE the character\'s exact appearance. Emphasize the gelato and glowing counter light.'
      },
      level2: {
        title: 'Regional Specialties',
        description: 'Discover unique flavors tied to Venetian tradition, like zabaglione or tiramisu gelato.',
        imagePrompt: 'Show a cup of zabaglione gelato in a cozy gelateria interior, with colorful tubs behind the counter. Chef Nomi is nearby but secondary. PRESERVE the character\'s exact appearance. Emphasize the dessert presentation.'
      }
    }
  },
  {
    id: 'stop-4',
    title: 'Campo Santa Margherita',
    description: 'Experience Venice\'s lively square at night, buzzing with students, locals, and sizzling street food stalls.',
    imagePrompt: 'Show Campo Santa Margherita at night, with lantern-lit stalls, sizzling fritto misto, and groups of locals and students gathered. Chef Nomi is present but secondary. PRESERVE the character\'s exact appearance. Emphasize the festive square and food stalls.',
    soundscapeFile: 'chef-nomi-delgado_stop1.mp3',
    goDeeper: {
      level1: {
        title: 'Street Food Snacks',
        description: 'Taste late-night Venetian favorites like fritto misto and arancini served in paper cones.',
        imagePrompt: 'Show a street food stall with fritto misto frying in hot oil and paper cones filled with seafood. Chef Nomi is in the scene but not central. PRESERVE the character\'s exact appearance. Emphasize the sizzling food and lively energy.'
      },
      level2: {
        title: 'Student Life',
        description: 'Learn how this square became the heart of Venetian student culture, blending food, music, and community.',
        imagePrompt: 'Show groups of students laughing and eating in the lantern-lit square. Chef Nomi is present but secondary. PRESERVE the character\'s exact appearance. Emphasize the social energy and festive atmosphere.'
      }
    }
  },
  {
    id: 'stop-5',
    title: 'Grand Canal Terrace Feast',
    description: 'Conclude your journey with a celebratory meal overlooking Venice\'s Grand Canal, the city\'s most iconic view.',
    imagePrompt: 'Show a long terrace table overlooking the Grand Canal at night, glowing canal lights reflecting on the water. Dishes like squid ink risotto and prosecco glasses are set on the table. Chef Nomi is present but not the main focus. PRESERVE the character\'s exact appearance. Emphasize the feast and view of the canal.',
    soundscapeFile: 'chef-nomi-delgado_stop1.mp3',
    goDeeper: {
      level1: {
        title: 'Squid Ink Risotto',
        description: 'Discover the story of risotto al nero di seppia, a Venetian classic rich with local tradition.',
        imagePrompt: 'Show a dramatic bowl of squid ink risotto on the terrace table, lit by candles with the canal in the background. Chef Nomi is in the scene but not central. PRESERVE the character\'s exact appearance. Emphasize the dish and elegant atmosphere.'
      },
      level2: {
        title: 'Final Toast',
        description: 'Raise a glass of prosecco with Chef Nomi to celebrate the journey through Venice\'s flavors.',
        imagePrompt: 'Show prosecco glasses raised in a toast at the terrace table overlooking the Grand Canal. Chef Nomi is present but secondary. PRESERVE the character\'s exact appearance. Emphasize the celebratory toast and shimmering canal lights.'
      }
    }
  }
];

// Helper function to get explore data by character and tour
export const getExploreData = (characterId: string, tourId: string): ExploreStop[] | null => {
  if (characterId === 'chef-nomi-delgado' && tourId === 'venice-food-tour') {
    return VENICE_FOOD_TOUR;
  }
  return null;
};
