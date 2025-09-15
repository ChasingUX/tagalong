import { NextRequest, NextResponse } from 'next/server';
import { getTextModel } from '@/lib/ai';
import { getCharacter } from '@/lib/characters';
import { generateScenes } from '@/lib/scenes';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GenerateQuizRequest {
  characterId: string;
  sceneId: string;
  sceneTitle: string;
  sceneDescription?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuizRequest = await request.json();
    const { characterId, sceneId, sceneTitle, sceneDescription } = body;

    console.log('🎯 Quiz API: Generating questions for:', { characterId, sceneId, sceneTitle });

    // Generate questions based on scene content
    const questions: QuizQuestion[] = await generateQuestionsForScene({
      characterId,
      sceneId,
      sceneTitle,
      sceneDescription
    });

    return NextResponse.json({ 
      questions,
      success: true 
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz questions', success: false },
      { status: 500 }
    );
  }
}

async function generateQuestionsForScene({
  characterId,
  sceneId,
  sceneTitle,
  sceneDescription
}: GenerateQuizRequest): Promise<QuizQuestion[]> {
  try {
    // Get character and scene data for context
    const character = getCharacter(characterId);
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }

    const scenes = await generateScenes(character);
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    console.log('🎯 Quiz Generation: Using AI to generate questions for:', {
      character: character.name,
      role: character.role,
      sceneTitle,
      sceneDescription
    });

    // Create AI prompt for quiz generation
    const model = getTextModel();
    const prompt = `You are an expert quiz creator working with ${character.name}, a ${character.role}.

CONTEXT:
- Character: ${character.name} (${character.role})
- Character Description: ${character.description}
- Quiz Topic: "${sceneTitle}"
- Quiz Description: ${sceneDescription || 'No additional description provided'}
- Character Tags: ${character.tags.join(', ')}

TASK:
Generate 5 high-quality, educational multiple-choice quiz questions about "${sceneTitle}" that would be appropriate for ${character.name}'s expertise as a ${character.role}.

REQUIREMENTS:
1. Questions should test real knowledge and understanding of the topic
2. Each question should have exactly 4 answer options
3. Each answer option must be 40 characters or less (very concise)
4. Only one option should be correct
5. Include detailed, educational explanations for the correct answers
6. Questions should be challenging but fair
7. Avoid overly obvious or trick questions
8. Focus on practical, applicable knowledge
9. Make questions engaging and relevant to the topic
10. Keep answer options short and direct - use abbreviations if needed

RESPONSE FORMAT:
Return ONLY a valid JSON array with exactly this structure:
[
  {
    "id": "1",
    "question": "Your question here?",
    "options": ["Short A", "Short B", "Short C", "Short D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct and educational context."
  },
  {
    "id": "2",
    "question": "Your second question here?",
    "options": ["Brief A", "Brief B", "Brief C", "Brief D"],
    "correctAnswer": 1,
    "explanation": "Detailed explanation of why this answer is correct and educational context."
  }
  // ... continue for 5 questions total
]

CRITICAL CONSTRAINTS:
- Each option in the "options" array MUST be 40 characters or less
- Use abbreviations, short phrases, single words when possible
- correctAnswer is the index (0, 1, 2, or 3) of the correct option
- Return ONLY the JSON array, no other text
- Ensure all JSON is properly formatted and valid
- Prioritize brevity in answer options while maintaining clarity`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = response.response.text();
    console.log('🎯 Quiz Generation: Raw AI response length:', responseText.length);

    // Parse the JSON response
    let questions: QuizQuestion[];
    try {
      // Clean the response to extract just the JSON array
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const jsonText = jsonMatch[0];
      questions = JSON.parse(jsonText);
      
      // Validate the structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error('Invalid questions array structure');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.id || !q.question || !Array.isArray(q.options) || 
            q.options.length !== 4 || typeof q.correctAnswer !== 'number' ||
            q.correctAnswer < 0 || q.correctAnswer > 3 || !q.explanation) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
        
        // Validate option length (40 character max)
        q.options.forEach((option, optionIndex) => {
          if (typeof option !== 'string' || option.length > 40) {
            console.warn(`🎯 Quiz Generation: Option too long at question ${index}, option ${optionIndex}: "${option}" (${option.length} chars)`);
            // Truncate if too long
            if (option.length > 40) {
              q.options[optionIndex] = option.substring(0, 37) + '...';
            }
          }
        });
      });

      console.log('🎯 Quiz Generation: Successfully generated', questions.length, 'questions');
      return questions;

    } catch (parseError) {
      console.error('🎯 Quiz Generation: Failed to parse AI response:', parseError);
      console.error('🎯 Quiz Generation: Raw response:', responseText);
      
      // Fall back to hardcoded questions for cooking/spice topics
      return getFallbackQuestions(sceneTitle);
    }

  } catch (error) {
    console.error('🎯 Quiz Generation: AI generation failed:', error);
    
    // Fall back to hardcoded questions
    return getFallbackQuestions(sceneTitle);
  }
}

function getFallbackQuestions(sceneTitle: string): QuizQuestion[] {
  console.log('🎯 Quiz Generation: Using fallback questions for:', sceneTitle);
  
  // Use the existing cooking questions for spice/cooking topics
  if (sceneTitle.toLowerCase().includes('spice') || sceneTitle.toLowerCase().includes('cooking')) {
    return [
      {
        id: "1",
        question: "Which spice is known as the 'king of spices' and is one of the most expensive spices in the world?",
        options: ["Cardamom", "Saffron", "Vanilla", "Black Pepper"],
        correctAnswer: 1,
        explanation: "Saffron is known as the 'king of spices' due to its intense flavor, aroma, and high price. It's harvested from the flower of Crocus sativus and requires about 150 flowers to produce just 1 gram of saffron."
      },
      {
        id: "2", 
        question: "What cooking method involves cooking food slowly in liquid at a temperature just below boiling?",
        options: ["Sautéing", "Braising", "Poaching", "Grilling"],
        correctAnswer: 2,
        explanation: "Poaching involves cooking food gently in liquid (water, broth, wine, etc.) at temperatures between 160-180°F (71-82°C), just below boiling. This method is perfect for delicate foods like eggs, fish, and fruits."
      },
      {
        id: "3",
        question: "Which spice blend is essential in Indian cuisine and typically contains cumin, coriander, turmeric, and other spices?",
        options: ["Garam Masala", "Curry Powder", "Berbere", "Za'atar"],
        correctAnswer: 1,
        explanation: "Curry powder is a spice blend that typically includes turmeric (giving it the yellow color), cumin, coriander, and various other spices. While garam masala is also important in Indian cuisine, curry powder is more universally recognized for these specific base ingredients."
      },
      {
        id: "4",
        question: "What is the primary difference between sautéing and stir-frying?",
        options: ["Temperature of the pan", "Amount of oil used", "Size of food pieces", "Type of pan used"],
        correctAnswer: 2,
        explanation: "The main difference is the size of food pieces. Sautéing typically uses larger pieces of food that are cooked in a single layer, while stir-frying uses smaller, uniformly cut pieces that are constantly moved around the pan."
      },
      {
        id: "5",
        question: "Which spice gives curry its characteristic yellow color?",
        options: ["Cumin", "Coriander", "Turmeric", "Paprika"],
        correctAnswer: 2,
        explanation: "Turmeric is responsible for the bright yellow color in curry. It contains curcumin, which gives it both its vibrant color and many of its health benefits."
      }
    ];
  }

  // Generic fallback questions for other topics
  return [
    {
      id: "1",
      question: `What is a fundamental concept in "${sceneTitle}"?`,
      options: ["Foundation A", "Foundation B", "Foundation C", "Foundation D"],
      correctAnswer: 0,
      explanation: `This question tests understanding of fundamental concepts in ${sceneTitle}. The correct answer represents a key principle that forms the foundation of this subject area.`
    },
    {
      id: "2",
      question: `Which approach is most effective when working with "${sceneTitle}"?`,
      options: ["Systematic", "Intuitive", "Collaborative", "Individual"],
      correctAnswer: 1,
      explanation: `In ${sceneTitle}, the most effective approach often depends on understanding the underlying principles and applying them thoughtfully to each situation.`
    },
    {
      id: "3",
      question: `What is an important consideration when applying "${sceneTitle}"?`,
      options: ["Speed", "Context", "Preference", "Tradition"],
      correctAnswer: 1,
      explanation: `Context and environment are crucial when applying knowledge in ${sceneTitle}, as different situations may require adapted approaches for optimal results.`
    },
    {
      id: "4",
      question: `How would you best develop skills in "${sceneTitle}"?`,
      options: ["Practice", "Study", "Observe", "Trial & error"],
      correctAnswer: 0,
      explanation: `Regular practice is essential for developing proficiency in ${sceneTitle}, as it allows for the development of both technical skills and intuitive understanding.`
    },
    {
      id: "5",
      question: `What is a common mistake to avoid in "${sceneTitle}"?`,
      options: ["Too slow", "Too rushed", "Ask for help", "Follow methods"],
      correctAnswer: 1,
      explanation: `Rushing without proper understanding is a common mistake in ${sceneTitle}. Taking time to understand the fundamentals leads to better long-term results.`
    }
  ];
}
