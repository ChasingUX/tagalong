import { NextRequest } from "next/server";
import { getTextModel } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";
import { generateScenes } from "@/lib/scenes";

type Message = { role: "assistant" | "user"; content: string };

const MODEL_NAME = process.env.GEMINI_TEXT_MODEL || "gemini-2.0-flash-exp"; // placeholder

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { characterId, sceneId, messages, quizContext } = body as {
    characterId: string;
    sceneId: string;
    messages: Message[];
    quizContext?: {
      questionId: string;
      question: string;
      options: string[];
    };
  };

  if (!characterId || !sceneId || !messages) {
    return new Response(JSON.stringify({ error: "invalid request" }), { status: 400 });
  }

  // Placeholder Gemini call (non-streaming)
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  let reply = `Got it! Let's tackle: ${lastUser}`;
  
  try {
    // Get character and scene data for context
    const character = getCharacter(characterId);
    const scenes = character ? await generateScenes(character) : [];
    const scene = scenes.find(s => s.id === sceneId);

    const model = getTextModel();
    
    // Create type-specific system prompts
    const typeInstructions = {
      Game: "You are facilitating a game-based experience. Include game mechanics, track progress toward goals, present challenges, and maintain engagement through gameplay elements. Use scoring, levels, or objectives when appropriate.",
      Collab: "You are collaborating as an equal partner. Focus on co-creation, ask for input on decisions, build on the user's ideas, and work together toward a shared outcome. Be collaborative and inclusive in your approach.",
      Learn: "You are teaching and educating. Use pedagogical techniques like asking questions to check understanding, providing clear explanations, offering examples, and when appropriate, present quiz questions or flashcard-style learning. Be patient and encouraging.",
      Roleplay: "You are engaging in roleplay. Stay in character, respond authentically to the scenario, maintain consistency with your character's background and motivations, and help create an immersive narrative experience."
    };

    const rulesContext = scene?.rules && scene.rules.length > 0 
      ? `\nScene rules to follow:\n${scene.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}`
      : '';

    const sceneContext = scene ? `
Scene: "${scene.title}" (${scene.type})
Description: ${scene.description}${rulesContext}
Type-specific approach: ${typeInstructions[scene.type] || ''}
` : '';

    const quizContextText = quizContext ? `
QUIZ CONTEXT:
The user is currently working on a quiz question and has asked for help. Here's the current question:
Question: ${quizContext.question}
Options: ${quizContext.options.map((opt, i) => `${i + 1}. ${opt}`).join(', ')}

Please help the user understand the topic or provide guidance without directly giving away the answer. Focus on teaching and explaining concepts.
` : '';

    const systemPrompt = `You are ${character?.name || 'a helpful character'}, a ${character?.role || 'assistant'}.
${sceneContext}
Character description: ${character?.description || 'A helpful assistant'}
${quizContextText}

VOICE-FIRST FORMATTING REQUIREMENTS:
- This is for a VOICE INTERFACE - keep responses SHORT and conversational
- Maximum 30-50 words per response (2-3 sentences)
- Sound natural when spoken aloud
- Be punchy, engaging, and to the point
- Ask ONE clear question or make ONE clear point per response
- Avoid long explanations - keep it snappy and interactive
- NEVER include voice directions like "(Warm voice)" or "(Enthusiastic tone)" in your response
- Just write the spoken words directly without any stage directions or parenthetical notes

Be proactive, concise, and engaging. Stay in character and maintain the scene's context and type throughout the conversation.`;

    const history = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");
    
    const res = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nConversation:\n${history}` }] },
      ],
    });
    reply = res.response.text() || reply;
    
    // Post-process to ensure paragraph breaks
    reply = reply
      .split(/\n\s*\n/) // Split on double line breaks
      .filter(paragraph => paragraph.trim()) // Remove empty paragraphs
      .join('\n\n'); // Rejoin with consistent double line breaks
      
  } catch (e) {
    console.error('Error in chat generation:', e);
    // Fallback to echo reply
  }

  return new Response(JSON.stringify({ message: reply, model: MODEL_NAME }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


