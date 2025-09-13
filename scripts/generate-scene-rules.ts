import fs from 'fs';
import path from 'path';
import type { Scene, SceneType } from '../src/lib/types';

// Rule templates for each scene type
const RULE_TEMPLATES = {
  Collab: [
    "{goalDescription}",
    "{collaborationFlow}",
    "{artifactDescription}"
  ],
  Learn: [
    "{topicDescription}",
    "{practiceMethod}",
    "{feedbackMethod}"
  ],
  Game: [
    "{gameRules}",
    "{gameplayFlow}",
    "{outcomeDescription}"
  ],
  Roleplay: [
    "{sceneContext}",
    "{interactionStyle}",
    "{adaptationDescription}"
  ]
};

// Content generators for each template variable
const CONTENT_GENERATORS = {
  // Collab generators
  goalDescription: (scene: Scene) => {
    const goalMap: Record<string, string> = {
      'write': 'We\'ll create written content together',
      'design': 'We\'ll design something visual together',
      'plan': 'We\'ll develop a comprehensive plan',
      'build': 'We\'ll construct something step by step',
      'create': 'We\'ll make something new from scratch',
      'develop': 'We\'ll build and refine an idea together'
    };
    
    for (const [key, value] of Object.entries(goalMap)) {
      if (scene.title.toLowerCase().includes(key) || scene.description?.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'We\'ll work together to create something meaningful';
  },

  collaborationFlow: (scene: Scene) => {
    return 'You share ideas and preferences, I build on them with expertise';
  },

  artifactDescription: (scene: Scene) => {
    const artifactMap: Record<string, string> = {
      'sketch': 'a complete comedy sketch you can perform or share',
      'routine': 'a polished comedy routine ready for performance',
      'recipe': 'a detailed recipe you can cook and enjoy',
      'menu': 'a complete menu plan you can use for your event',
      'workout': 'a personalized workout plan you can follow',
      'plan': 'a detailed plan you can implement',
      'design': 'a finished design you can use or modify'
    };

    for (const [key, value] of Object.entries(artifactMap)) {
      if (scene.title.toLowerCase().includes(key) || scene.description?.toLowerCase().includes(key)) {
        return `We'll end with ${value}`;
      }
    }
    return 'We\'ll create something tangible you can save and use';
  },

  // Learn generators
  topicDescription: (scene: Scene) => {
    return `I'll guide you through ${scene.title.toLowerCase().replace(/^learn\s+/, '')}`;
  },

  practiceMethod: (scene: Scene) => {
    const methods = [
      'We\'ll use flashcards, quizzes, and interactive exercises',
      'You\'ll practice with step-by-step guidance and examples',
      'We\'ll go through concepts with questions and explanations'
    ];
    return methods[Math.floor(Math.random() * methods.length)];
  },

  feedbackMethod: (scene: Scene) => {
    return 'You\'ll get immediate feedback and track your understanding';
  },

  // Game generators
  gameRules: (scene: Scene) => {
    const ruleMap: Record<string, string> = {
      'quiz': 'I\'ll ask questions and you choose or guess the answers',
      'challenge': 'You\'ll face creative challenges with time or resource limits',
      'competition': 'We\'ll compete in rounds with points and winners',
      'guessing': 'You\'ll make guesses based on clues I provide',
      'trivia': 'Answer trivia questions to earn points and advance'
    };

    for (const [key, value] of Object.entries(ruleMap)) {
      if (scene.title.toLowerCase().includes(key) || scene.description?.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'Simple rules with clear objectives and win conditions';
  },

  gameplayFlow: (scene: Scene) => {
    return 'You make choices or responses, I react and keep score';
  },

  outcomeDescription: (scene: Scene) => {
    return 'Success earns points or reveals, with fun reactions either way';
  },

  // Roleplay generators
  sceneContext: (scene: Scene) => {
    const contextMap: Record<string, string> = {
      'training': 'You\'re in a training scenario where I\'m your instructor',
      'session': 'We\'re in a one-on-one session focused on your goals',
      'competition': 'You\'re competing or being judged in a formal setting',
      'collaboration': 'We\'re working together as professional partners',
      'consultation': 'You\'re getting expert advice in a consultation setting'
    };

    for (const [key, value] of Object.entries(contextMap)) {
      if (scene.title.toLowerCase().includes(key) || scene.description?.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'You\'re in a realistic scenario with clear context and stakes';
  },

  interactionStyle: (scene: Scene) => {
    return 'Respond naturally as yourself, make choices, and engage authentically';
  },

  adaptationDescription: (scene: Scene) => {
    return 'I\'ll adapt to your responses and the story branches based on your choices';
  }
};

function generateRulesForScene(scene: Scene): string[] {
  const templates = RULE_TEMPLATES[scene.type];
  if (!templates) return [];

  return templates.map(template => {
    return template.replace(/\{(\w+)\}/g, (match, variable) => {
      const generator = CONTENT_GENERATORS[variable as keyof typeof CONTENT_GENERATORS];
      if (generator) {
        return generator(scene);
      }
      return match; // Return original if no generator found
    });
  });
}

async function processSceneFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const scenes: Scene[] = JSON.parse(content);
    
    const updatedScenes = scenes.map(scene => ({
      ...scene,
      rules: generateRulesForScene(scene)
    }));

    fs.writeFileSync(filePath, JSON.stringify(updatedScenes, null, 2));
    console.log(`✅ Updated ${path.basename(filePath)} with ${scenes.length} scenes`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  const scenesDir = path.join(process.cwd(), 'data', 'scenes');
  const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('.json'));

  console.log('🔧 Generating systematic rules for all scenes...\n');

  for (const file of files) {
    const filePath = path.join(scenesDir, file);
    await processSceneFile(filePath);
  }

  console.log('\n✨ All scene files updated with mechanics-focused rules!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateRulesForScene, RULE_TEMPLATES, CONTENT_GENERATORS };
