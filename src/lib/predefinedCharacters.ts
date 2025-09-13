import type { Character, Scene } from "./types";

// Predefined characters with their scenes
export const PREDEFINED_CHARACTERS: Character[] = [
  {
    id: "chef-nomi-delgado",
    name: "Chef Nomi Delgado",
    role: "Culinary Expert",
    tags: ["cooking", "recipes", "food", "chef"],
    description: "A master chef who creates amazing dishes and teaches culinary skills with passion and creativity.",
    imageUrl: "/characters/chef-nomi-delgado.png",
    imagePrompt: "A professional chef with a warm smile, wearing a crisp white chef's coat, subtle touches of colorful fabric or scarf suggesting creativity, confident and welcoming."
  },
  {
    id: "sage-ellison",
    name: "Sage Ellison",
    role: "Guide/Coach",
    tags: ["coaching", "wellness", "mindfulness", "growth"],
    description: "A supportive guide who helps you navigate challenges and discover your inner strength through mindful practices.",
    imageUrl: "/characters/sage-ellison.png",
    imagePrompt: "A calm, wise coach with a gentle expression, wearing soft layered clothing with simple accessories like a beaded bracelet or scarf, approachable and serene."
  },
  {
    id: "riff-kwan",
    name: "Riff Kwan",
    role: "Comedian",
    tags: ["comedy", "humor", "entertainment", "jokes"],
    description: "A quick-witted comedian who finds humor in everything and helps you see the lighter side of life.",
    imageUrl: "/characters/riff-kwan.png",
    imagePrompt: "A charismatic Black comedian with an expressive face and bright smile, wearing modern casual attire like a stylish hoodie or trendy button-up shirt, confident and witty with a hip contemporary vibe."
  },
  {
    id: "professor-ada-quill",
    name: "Professor Ada Quill",
    role: "Teacher",
    tags: ["education", "learning", "knowledge", "teaching"],
    description: "A dedicated educator who makes complex topics accessible and learning an exciting adventure.",
    imageUrl: "/characters/professor-ada-quill.png",
    imagePrompt: "A friendly professor with glasses and a warm smile, dressed in a cardigan or tweed jacket with pens or a notebook as subtle cues, intellectual and approachable."
  },
  {
    id: "terra-novak",
    name: "Terra Novák",
    role: "Explorer",
    tags: ["travel", "adventure", "culture", "geography"],
    description: "An experienced explorer who shares knowledge about different cultures and places around the world.",
    imageUrl: "/characters/terra-novak.png",
    imagePrompt: "An adventurous explorer with a confident expression, wearing practical travel gear such as a jacket, scarf, or wide-brim hat, curious and worldly."
  },
  {
    id: "mira-solange",
    name: "Mira Solange",
    role: "Artist",
    tags: ["art", "creativity", "design", "visual"],
    description: "A passionate artist who explores various mediums and helps others discover their creative potential.",
    imageUrl: "/characters/mira-solange.png",
    imagePrompt: "An artistic creator with a spirited expression, wearing a paint-stained apron or colorful patterned clothing, inspiring and imaginative."
  },
  {
    id: "dr-elias-archivus",
    name: "Dr. Elias Archivus",
    role: "Historian",
    tags: ["history", "knowledge", "research", "past"],
    description: "A knowledgeable historian who brings the past to life with fascinating stories and insights.",
    imageUrl: "/characters/dr-elias-archivus.png",
    imagePrompt: "A scholarly historian with a thoughtful expression, wearing a tailored vest or coat with subtle accessories like spectacles or a pocket watch, wise and knowledgeable."
  },
  {
    id: "jax-rivera",
    name: "Jax Rivera",
    role: "Personal Trainer",
    tags: ["fitness", "health", "exercise", "motivation"],
    description: "An energetic fitness trainer who helps others achieve their health and wellness goals with enthusiasm.",
    imageUrl: "/characters/jax-rivera.png",
    imagePrompt: "A fit personal trainer with a motivational expression, wearing athletic gear with details like a whistle lanyard or armband, energetic and inspiring."
  },
  {
    id: "lola-starr",
    name: "Lola Starr",
    role: "Gossip Maven",
    tags: ["celebrity", "gossip", "entertainment", "pop culture"],
    description: "A charismatic gossip maven who knows all the latest celebrity news and pop culture trends.",
    imageUrl: "/characters/lola-starr.png",
    imagePrompt: "A glamorous gossip columnist with a stylish expression, wearing chic clothing and accessories like oversized sunglasses or a sparkling necklace, fashionable and engaging."
  },
  {
    id: "miles-cutter",
    name: "Miles Cutter",
    role: "TV Show Expert",
    tags: ["television", "entertainment", "shows", "analysis"],
    description: "A TV show expert who knows everything about series, characters, and can recommend the perfect show for any mood.",
    imageUrl: "/characters/miles-cutter.png",
    imagePrompt: "A laid-back TV enthusiast with a relaxed expression, wearing casual clothing like a hoodie or graphic tee, maybe holding a remote or wearing fun pop-culture pins, knowledgeable and entertaining."
  }
];

// Predefined scenes for each character
export const PREDEFINED_SCENES: Record<string, Scene[]> = {
  "professor-ada-quill": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "professor-ada-quill",
      title: "Plan a lesson together",
      caption: "Co-create an engaging lesson plan on any topic you choose",
      type: "Collab",
      description: "Design interactive lessons with Professor Ada using creative teaching methods."
    },
    {
      id: "2", 
      characterId: "professor-ada-quill",
      title: "Create study materials",
      caption: "Make flashcards, guides, and visual aids for learning",
      type: "Collab",
      description: "Craft effective study materials and learning resources together with Ada."
    },
    {
      id: "3",
      characterId: "professor-ada-quill",
      title: "Design a curriculum",
      caption: "Build a complete learning path for a subject of interest",
      type: "Collab",
      description: "Structure comprehensive curricula with clear learning objectives and milestones."
    },
    
    // Learning scenes
    {
      id: "4",
      characterId: "professor-ada-quill",
      title: "Master study techniques",
      caption: "Learn effective note-taking, memory, and test-taking strategies",
      type: "Learn",
      description: "Discover proven study methods and learning strategies from an expert educator."
    },
    {
      id: "5",
      characterId: "professor-ada-quill",
      title: "Explore any subject deeply",
      caption: "Get personalized tutoring on topics you want to understand",
      type: "Learn",
      description: "Receive expert guidance and explanations tailored to your learning style."
    },
    {
      id: "6",
      characterId: "professor-ada-quill",
      title: "Research skills workshop",
      caption: "Learn to find, evaluate, and cite reliable sources",
      type: "Learn",
      description: "Master academic research methods and critical information evaluation skills."
    },
    
    // Game scenes
    {
      id: "7",
      characterId: "professor-ada-quill",
      title: "Knowledge trivia challenge",
      caption: "Test your knowledge across various academic subjects",
      type: "Game",
      description: "Challenge yourself with trivia spanning history, science, literature, and more."
    },
    {
      id: "8",
      characterId: "professor-ada-quill", 
      title: "Vocabulary building game",
      caption: "Expand your vocabulary with word games and etymology",
      type: "Game",
      description: "Learn new words through engaging games and discover their fascinating origins."
    },
    {
      id: "9",
      characterId: "professor-ada-quill",
      title: "Logic puzzle workshop",
      caption: "Solve riddles, brain teasers, and critical thinking puzzles",
      type: "Game",
      description: "Sharpen analytical thinking with challenging puzzles and logical reasoning games."
    },
    
    // Roleplay scenes
    {
      id: "10",
      characterId: "professor-ada-quill",
      title: "Be her teaching assistant",
      caption: "Help Professor Ada prepare and conduct her university classes",
      type: "Roleplay",
      description: "Assist with lectures, grade assignments, and mentor students in Ada's classroom."
    },
    {
      id: "11",
      characterId: "professor-ada-quill",
      title: "Academic conference presentation",
      caption: "Present research findings at a scholarly conference together",
      type: "Roleplay",
      description: "Co-present academic research and engage with fellow scholars at conferences."
    },
    {
      id: "12",
      characterId: "professor-ada-quill",
      title: "Student office hours",
      caption: "Role-play as a student seeking help during office hours",
      type: "Roleplay",
      description: "Experience personalized academic guidance and support in Professor Ada's office."
    }
  ],
  "chef-nomi-delgado": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "chef-nomi-delgado",
      title: "Build a signature dish",
      caption: "Build a signature dish together with ingredients you choose",
      type: "Collab",
      description: "Create your signature dish with Chef Nomi using your favorite ingredients."
    },
    {
      id: "2", 
      characterId: "chef-nomi-delgado",
      title: "Create a themed dinner menu",
      caption: "Create a themed dinner menu (date night, fantasy feast)",
      type: "Collab",
      description: "Design complete themed dinner menus for date nights and special occasions."
    },
    {
      id: "3",
      characterId: "chef-nomi-delgado", 
      title: "Invent a cocktail/mocktail",
      caption: "Invent a cocktail/mocktail with them as mixologist",
      type: "Collab",
      description: "Craft unique cocktails and mocktails with Chef Nomi as your mixologist."
    },
    // Learn scenes
    {
      id: "4",
      characterId: "chef-nomi-delgado",
      title: "World spices & cooking methods",
      caption: "Flashcards on world spices, cooking methods",
      type: "Learn", 
      description: "Learn world spices and essential cooking methods through interactive flashcards."
    },
    {
      id: "5",
      characterId: "chef-nomi-delgado",
      title: "Identify cuisines by ingredients",
      caption: "Quiz: identify cuisines by ingredient list",
      type: "Learn",
      description: "Match ingredient lists to cuisines in this fun culinary knowledge quiz."
    },
    {
      id: "6",
      characterId: "chef-nomi-delgado",
      title: "Cooking technique breakdowns",
      caption: "Cooking technique breakdowns (e.g. sauté vs braise)", 
      type: "Learn",
      description: "Master essential cooking techniques like sautéing, braising, and more."
    },
    // Game scenes  
    {
      id: "7",
      characterId: "chef-nomi-delgado",
      title: "Mystery Basket Challenge",
      caption: "Mystery Basket Challenge (random ingredient combos)",
      type: "Game",
      description: "Create amazing dishes using surprise random ingredient combinations and creativity."
    },
    {
      id: "8",
      characterId: "chef-nomi-delgado", 
      title: "Emoji dish guessing game",
      caption: "Emoji → dish guessing game",
      type: "Game",
      description: "Decode food emojis to identify dishes and ingredients in this fun game."
    },
    {
      id: "9",
      characterId: "chef-nomi-delgado",
      title: "Food close-up ID challenge",
      caption: "Food close-up ID challenge", 
      type: "Game",
      description: "Identify dishes from extreme close-up photos showing only tiny details."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "chef-nomi-delgado",
      title: "Compete on their cooking show",
      caption: "Compete on their cooking show",
      type: "Roleplay",
      description: "Compete as a contestant on Chef Nomi's cooking show and impress the judges."
    },
    {
      id: "11",
      characterId: "chef-nomi-delgado",
      title: "Be sous-chef in their kitchen",
      caption: "Be sous-chef in their restaurant kitchen",
      type: "Roleplay",
      description: "Work as Chef Nomi's trusted sous-chef during busy restaurant dinner service."
    },
    {
      id: "12",
      characterId: "chef-nomi-delgado",
      title: "Judge dishes together",
      caption: "Judge dishes together on a parody food competition",
      type: "Roleplay",
      description: "Co-judge a fun food competition show with Chef Nomi and critique the dishes."
    }
  ],
  "sage-ellison": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "sage-ellison",
      title: "Set life goals together",
      caption: "Define meaningful personal and professional objectives",
      type: "Collab",
      description: "Create actionable life goals with Sage using proven goal-setting frameworks."
    },
    {
      id: "2",
      characterId: "sage-ellison",
      title: "Build a habit system",
      caption: "Design sustainable routines and positive habit stacks",
      type: "Collab",
      description: "Develop personalized habit systems that stick using behavioral science principles."
    },
    {
      id: "3",
      characterId: "sage-ellison",
      title: "Create a life vision board",
      caption: "Visualize your ideal future across all life areas",
      type: "Collab",
      description: "Design inspiring vision boards that align with your values and aspirations."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "sage-ellison",
      title: "Master mindfulness techniques",
      caption: "Learn meditation, breathing, and present-moment awareness",
      type: "Learn",
      description: "Discover practical mindfulness techniques for stress reduction and clarity."
    },
    {
      id: "5",
      characterId: "sage-ellison",
      title: "Emotional intelligence training",
      caption: "Develop self-awareness and interpersonal skills",
      type: "Learn",
      description: "Build emotional intelligence through guided exercises and reflection."
    },
    {
      id: "6",
      characterId: "sage-ellison",
      title: "Time management mastery",
      caption: "Learn productivity systems and energy management",
      type: "Learn",
      description: "Master time management techniques that align with your natural rhythms."
    },
    // Game scenes
    {
      id: "7",
      characterId: "sage-ellison",
      title: "Values clarification game",
      caption: "Discover your core values through interactive exercises",
      type: "Game",
      description: "Identify your authentic values through engaging self-discovery activities."
    },
    {
      id: "8",
      characterId: "sage-ellison",
      title: "Strengths assessment challenge",
      caption: "Uncover hidden talents and natural abilities",
      type: "Game",
      description: "Explore your unique strengths through fun assessment games and scenarios."
    },
    {
      id: "9",
      characterId: "sage-ellison",
      title: "Decision-making scenarios",
      caption: "Practice making tough choices with confidence",
      type: "Game",
      description: "Navigate complex decision scenarios using structured thinking frameworks."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "sage-ellison",
      title: "Life coaching session",
      caption: "Experience a personalized one-on-one coaching session",
      type: "Roleplay",
      description: "Receive personalized guidance and breakthrough insights from Coach Sage."
    },
    {
      id: "11",
      characterId: "sage-ellison",
      title: "Accountability partnership",
      caption: "Be accountability partners supporting each other's growth",
      type: "Roleplay",
      description: "Create mutual accountability and support each other's personal development."
    },
    {
      id: "12",
      characterId: "sage-ellison",
      title: "Mentor a fellow seeker",
      caption: "Guide someone else on their personal growth journey",
      type: "Roleplay",
      description: "Practice coaching skills by mentoring others with Sage's guidance."
    }
  ],
  "riff-kwan": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "riff-kwan",
      title: "Write comedy sketches",
      caption: "Co-create hilarious sketches and comedy bits together",
      type: "Collab",
      description: "Brainstorm and craft comedy sketches with Riff's expert comedic timing."
    },
    {
      id: "2",
      characterId: "riff-kwan",
      title: "Develop a comedy routine",
      caption: "Build a stand-up set with jokes, timing, and delivery",
      type: "Collab",
      description: "Create and refine a comedy routine with professional comedic structure."
    },
    {
      id: "3",
      characterId: "riff-kwan",
      title: "Roast session planning",
      caption: "Craft witty roasts and comeback lines for any occasion",
      type: "Collab",
      description: "Master the art of clever roasts and quick-witted comebacks with Riff."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "riff-kwan",
      title: "Comedy writing techniques",
      caption: "Learn joke structure, timing, and comedic principles",
      type: "Learn",
      description: "Master the fundamentals of comedy writing and joke construction."
    },
    {
      id: "5",
      characterId: "riff-kwan",
      title: "Stand-up performance skills",
      caption: "Develop stage presence, delivery, and crowd work",
      type: "Learn",
      description: "Learn professional stand-up techniques for commanding the stage."
    },
    {
      id: "6",
      characterId: "riff-kwan",
      title: "Improv comedy training",
      caption: "Master spontaneous humor and quick thinking",
      type: "Learn",
      description: "Develop improvisational skills for spontaneous comedy and quick wit."
    },
    // Game scenes
    {
      id: "7",
      characterId: "riff-kwan",
      title: "Pun battle royale",
      caption: "Compete in rapid-fire pun competitions",
      type: "Game",
      description: "Engage in hilarious pun battles and wordplay competitions with Riff."
    },
    {
      id: "8",
      characterId: "riff-kwan",
      title: "Comedy improv games",
      caption: "Play spontaneous comedy games and scenarios",
      type: "Game",
      description: "Participate in classic improv games and comedic scene work."
    },
    {
      id: "9",
      characterId: "riff-kwan",
      title: "Meme creation challenge",
      caption: "Create viral-worthy memes and internet humor",
      type: "Game",
      description: "Craft hilarious memes and internet content with comedic expertise."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "riff-kwan",
      title: "Comedy club open mic",
      caption: "Perform at a comedy club with Riff as your host",
      type: "Roleplay",
      description: "Experience the thrill of performing stand-up at Riff's comedy club."
    },
    {
      id: "11",
      characterId: "riff-kwan",
      title: "Comedy writing room",
      caption: "Work as writers on a comedy show together",
      type: "Roleplay",
      description: "Collaborate in a professional comedy writing room creating TV content."
    },
    {
      id: "12",
      characterId: "riff-kwan",
      title: "Roast battle judge",
      caption: "Judge a comedy roast battle with Riff",
      type: "Roleplay",
      description: "Co-judge a roast battle competition and critique comedic performances."
    }
  ],
  "terra-novak": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "terra-novak",
      title: "Plan an expedition",
      caption: "Design an adventure to remote destinations worldwide",
      type: "Collab",
      description: "Plan epic expeditions to unexplored territories with expert guidance."
    },
    {
      id: "2",
      characterId: "terra-novak",
      title: "Create survival guides",
      caption: "Develop wilderness survival manuals and safety protocols",
      type: "Collab",
      description: "Craft comprehensive survival guides for various challenging environments."
    },
    {
      id: "3",
      characterId: "terra-novak",
      title: "Design adventure challenges",
      caption: "Create outdoor challenges and exploration activities",
      type: "Collab",
      description: "Design thrilling adventure challenges that test skills and courage."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "terra-novak",
      title: "Wilderness survival skills",
      caption: "Learn essential survival techniques for any environment",
      type: "Learn",
      description: "Master fire-making, shelter-building, and navigation in the wilderness."
    },
    {
      id: "5",
      characterId: "terra-novak",
      title: "World geography deep dive",
      caption: "Explore fascinating places and cultures around the globe",
      type: "Learn",
      description: "Discover hidden gems and cultural treasures from Terra's global adventures."
    },
    {
      id: "6",
      characterId: "terra-novak",
      title: "Adventure photography",
      caption: "Capture stunning landscapes and expedition moments",
      type: "Learn",
      description: "Learn photography techniques for documenting incredible adventures."
    },
    // Game scenes
    {
      id: "7",
      characterId: "terra-novak",
      title: "Geography quiz challenge",
      caption: "Test your knowledge of world locations and landmarks",
      type: "Game",
      description: "Challenge yourself with geography trivia from Terra's global expeditions."
    },
    {
      id: "8",
      characterId: "terra-novak",
      title: "Survival scenario game",
      caption: "Navigate challenging survival situations and decisions",
      type: "Game",
      description: "Test survival instincts in realistic wilderness emergency scenarios."
    },
    {
      id: "9",
      characterId: "terra-novak",
      title: "Landmark identification",
      caption: "Identify famous landmarks and hidden gems worldwide",
      type: "Game",
      description: "Guess locations from photos and clues from Terra's travel adventures."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "terra-novak",
      title: "Expedition team member",
      caption: "Join Terra's team on a dangerous expedition",
      type: "Roleplay",
      description: "Experience the thrill and challenges of a real expedition team member."
    },
    {
      id: "11",
      characterId: "terra-novak",
      title: "Adventure documentary crew",
      caption: "Document expeditions for a nature documentary",
      type: "Roleplay",
      description: "Work as a documentary crew capturing Terra's incredible adventures."
    },
    {
      id: "12",
      characterId: "terra-novak",
      title: "Wilderness rescue mission",
      caption: "Participate in a high-stakes wilderness rescue operation",
      type: "Roleplay",
      description: "Join Terra in a dramatic wilderness rescue mission to save lives."
    }
  ],
  "mira-solange": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "mira-solange",
      title: "Create an art piece together",
      caption: "Collaborate on paintings, sculptures, or mixed media art",
      type: "Collab",
      description: "Co-create stunning artworks using various mediums and techniques."
    },
    {
      id: "2",
      characterId: "mira-solange",
      title: "Design a gallery exhibition",
      caption: "Curate and plan an art exhibition or gallery show",
      type: "Collab",
      description: "Plan immersive gallery exhibitions that tell compelling artistic stories."
    },
    {
      id: "3",
      characterId: "mira-solange",
      title: "Develop art concepts",
      caption: "Brainstorm creative concepts and artistic themes",
      type: "Collab",
      description: "Explore profound artistic concepts and translate ideas into visual form."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "mira-solange",
      title: "Art techniques masterclass",
      caption: "Learn painting, drawing, and sculpting fundamentals",
      type: "Learn",
      description: "Master essential art techniques from color theory to composition."
    },
    {
      id: "5",
      characterId: "mira-solange",
      title: "Art history exploration",
      caption: "Discover influential artists and movements throughout time",
      type: "Learn",
      description: "Journey through art history and understand influential artistic movements."
    },
    {
      id: "6",
      characterId: "mira-solange",
      title: "Creative inspiration methods",
      caption: "Unlock creativity and overcome artistic blocks",
      type: "Learn",
      description: "Discover techniques for finding inspiration and maintaining creative flow."
    },
    // Game scenes
    {
      id: "7",
      characterId: "mira-solange",
      title: "Art style guessing game",
      caption: "Identify art movements and famous artists from artworks",
      type: "Game",
      description: "Test art knowledge by identifying styles, periods, and famous artists."
    },
    {
      id: "8",
      characterId: "mira-solange",
      title: "Color palette challenge",
      caption: "Create art using specific color combinations and themes",
      type: "Game",
      description: "Challenge creativity with constrained color palettes and themes."
    },
    {
      id: "9",
      characterId: "mira-solange",
      title: "Abstract interpretation game",
      caption: "Interpret and discuss abstract artworks and their meanings",
      type: "Game",
      description: "Explore abstract art interpretation and develop artistic vocabulary."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "mira-solange",
      title: "Artist studio assistant",
      caption: "Work as Mira's studio assistant on major art projects",
      type: "Roleplay",
      description: "Experience the daily life of a professional artist's studio assistant."
    },
    {
      id: "11",
      characterId: "mira-solange",
      title: "Gallery opening night",
      caption: "Host an art gallery opening with collectors and critics",
      type: "Roleplay",
      description: "Navigate the art world at an exclusive gallery opening event."
    },
    {
      id: "12",
      characterId: "mira-solange",
      title: "Art critique session",
      caption: "Participate in professional art critique and discussion",
      type: "Roleplay",
      description: "Engage in thoughtful artistic critique and constructive feedback sessions."
    }
  ],
  "dr-elias-archivus": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "dr-elias-archivus",
      title: "Research historical mysteries",
      caption: "Investigate unsolved historical puzzles and ancient secrets",
      type: "Collab",
      description: "Uncover historical mysteries using archaeological evidence and research."
    },
    {
      id: "2",
      characterId: "dr-elias-archivus",
      title: "Create historical timelines",
      caption: "Build comprehensive timelines of civilizations and events",
      type: "Collab",
      description: "Construct detailed historical timelines connecting events across cultures."
    },
    {
      id: "3",
      characterId: "dr-elias-archivus",
      title: "Analyze ancient artifacts",
      caption: "Study archaeological finds and decode their significance",
      type: "Collab",
      description: "Examine ancient artifacts and uncover their cultural and historical meaning."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "dr-elias-archivus",
      title: "Ancient civilizations deep dive",
      caption: "Explore the rise and fall of great civilizations",
      type: "Learn",
      description: "Journey through ancient civilizations from Egypt to Mesopotamia and beyond."
    },
    {
      id: "5",
      characterId: "dr-elias-archivus",
      title: "Historical research methods",
      caption: "Learn to analyze primary sources and historical evidence",
      type: "Learn",
      description: "Master techniques for evaluating historical sources and evidence."
    },
    {
      id: "6",
      characterId: "dr-elias-archivus",
      title: "Archaeology fundamentals",
      caption: "Understand excavation techniques and artifact analysis",
      type: "Learn",
      description: "Learn archaeological methods for uncovering and interpreting the past."
    },
    // Game scenes
    {
      id: "7",
      characterId: "dr-elias-archivus",
      title: "Historical timeline challenge",
      caption: "Test knowledge of chronological events and dates",
      type: "Game",
      description: "Challenge your knowledge of historical chronology and cause-and-effect."
    },
    {
      id: "8",
      characterId: "dr-elias-archivus",
      title: "Ancient artifact identification",
      caption: "Identify historical objects and their cultural origins",
      type: "Game",
      description: "Test expertise in identifying artifacts from different cultures and periods."
    },
    {
      id: "9",
      characterId: "dr-elias-archivus",
      title: "Historical figure guessing game",
      caption: "Guess famous historical figures from clues and context",
      type: "Game",
      description: "Identify influential historical figures from biographical clues and achievements."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "dr-elias-archivus",
      title: "Archaeological expedition",
      caption: "Join Dr. Archivus on a historical excavation site",
      type: "Roleplay",
      description: "Experience the excitement of an archaeological dig and historical discovery."
    },
    {
      id: "11",
      characterId: "dr-elias-archivus",
      title: "Museum curator collaboration",
      caption: "Help curate a historical exhibition at a prestigious museum",
      type: "Roleplay",
      description: "Work with Dr. Archivus to create compelling historical museum exhibitions."
    },
    {
      id: "12",
      characterId: "dr-elias-archivus",
      title: "Historical documentary expert",
      caption: "Provide historical expertise for a documentary production",
      type: "Roleplay",
      description: "Serve as historical consultant for an educational documentary project."
    }
  ],
  "jax-rivera": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "jax-rivera",
      title: "Design workout routines",
      caption: "Create personalized fitness plans for any goal",
      type: "Collab",
      description: "Develop customized workout routines tailored to specific fitness goals."
    },
    {
      id: "2",
      characterId: "jax-rivera",
      title: "Plan nutrition strategies",
      caption: "Build sustainable meal plans and nutrition guidelines",
      type: "Collab",
      description: "Create balanced nutrition plans that support fitness and health goals."
    },
    {
      id: "3",
      characterId: "jax-rivera",
      title: "Set fitness challenges",
      caption: "Design motivating fitness challenges and milestones",
      type: "Collab",
      description: "Create engaging fitness challenges that build strength and motivation."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "jax-rivera",
      title: "Exercise form and technique",
      caption: "Master proper form for all major exercises",
      type: "Learn",
      description: "Learn correct exercise techniques to maximize results and prevent injury."
    },
    {
      id: "5",
      characterId: "jax-rivera",
      title: "Nutrition science basics",
      caption: "Understand macros, calories, and healthy eating principles",
      type: "Learn",
      description: "Master nutrition fundamentals for optimal health and fitness performance."
    },
    {
      id: "6",
      characterId: "jax-rivera",
      title: "Recovery and wellness",
      caption: "Learn about rest, sleep, and recovery optimization",
      type: "Learn",
      description: "Understand the importance of recovery for achieving fitness goals."
    },
    // Game scenes
    {
      id: "7",
      characterId: "jax-rivera",
      title: "Fitness knowledge quiz",
      caption: "Test understanding of exercise science and nutrition",
      type: "Game",
      description: "Challenge your knowledge of fitness principles and exercise science."
    },
    {
      id: "8",
      characterId: "jax-rivera",
      title: "Workout planning challenge",
      caption: "Create effective workouts for different fitness levels",
      type: "Game",
      description: "Design workout routines for various fitness goals and experience levels."
    },
    {
      id: "9",
      characterId: "jax-rivera",
      title: "Healthy recipe competition",
      caption: "Create nutritious meals that taste amazing",
      type: "Game",
      description: "Compete to create the most delicious and nutritious meal combinations."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "jax-rivera",
      title: "Personal training session",
      caption: "Experience one-on-one training with Jax",
      type: "Roleplay",
      description: "Get personalized fitness coaching and motivation from trainer Jax."
    },
    {
      id: "11",
      characterId: "jax-rivera",
      title: "Gym buddy partnership",
      caption: "Work out together as fitness accountability partners",
      type: "Roleplay",
      description: "Train together as workout partners supporting each other's fitness journey."
    },
    {
      id: "12",
      characterId: "jax-rivera",
      title: "Fitness competition prep",
      caption: "Prepare for a fitness competition with Jax's guidance",
      type: "Roleplay",
      description: "Train intensively for a fitness competition with expert coaching."
    }
  ],
  "lola-starr": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "lola-starr",
      title: "Create celebrity gossip content",
      caption: "Write entertaining celebrity news and commentary",
      type: "Collab",
      description: "Craft engaging celebrity gossip content with insider knowledge and flair."
    },
    {
      id: "2",
      characterId: "lola-starr",
      title: "Plan red carpet coverage",
      caption: "Design comprehensive coverage for awards shows and premieres",
      type: "Collab",
      description: "Plan detailed red carpet coverage strategies for major entertainment events."
    },
    {
      id: "3",
      characterId: "lola-starr",
      title: "Analyze celebrity trends",
      caption: "Study fashion, relationships, and entertainment industry patterns",
      type: "Collab",
      description: "Analyze celebrity trends and predict the next big entertainment stories."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "lola-starr",
      title: "Entertainment industry insights",
      caption: "Learn how Hollywood and the entertainment business works",
      type: "Learn",
      description: "Understand the inner workings of the entertainment industry and celebrity culture."
    },
    {
      id: "5",
      characterId: "lola-starr",
      title: "Celebrity fashion analysis",
      caption: "Study red carpet fashion and celebrity style evolution",
      type: "Learn",
      description: "Analyze celebrity fashion choices and understand style trends and influences."
    },
    {
      id: "6",
      characterId: "lola-starr",
      title: "Social media strategy for fame",
      caption: "Learn how celebrities build and maintain their public image",
      type: "Learn",
      description: "Understand celebrity social media strategies and public relations tactics."
    },
    // Game scenes
    {
      id: "7",
      characterId: "lola-starr",
      title: "Celebrity trivia showdown",
      caption: "Test knowledge of celebrity facts, relationships, and scandals",
      type: "Game",
      description: "Challenge your celebrity knowledge with the latest gossip and entertainment trivia."
    },
    {
      id: "8",
      characterId: "lola-starr",
      title: "Paparazzi photo guessing",
      caption: "Identify celebrities from candid photos and situations",
      type: "Game",
      description: "Test celebrity recognition skills with candid photos and behind-the-scenes shots."
    },
    {
      id: "9",
      characterId: "lola-starr",
      title: "Awards show prediction game",
      caption: "Predict winners and fashion choices for major awards shows",
      type: "Game",
      description: "Make predictions about award winners, fashion, and memorable moments."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "lola-starr",
      title: "Entertainment reporter",
      caption: "Work as Lola's co-host on an entertainment news show",
      type: "Roleplay",
      description: "Co-host an entertainment news show covering the latest celebrity stories."
    },
    {
      id: "11",
      characterId: "lola-starr",
      title: "Red carpet interviewer",
      caption: "Interview celebrities at a major Hollywood premiere",
      type: "Roleplay",
      description: "Experience the excitement of interviewing A-list celebrities at premieres."
    },
    {
      id: "12",
      characterId: "lola-starr",
      title: "Celebrity publicist team",
      caption: "Help manage a celebrity's public image and media presence",
      type: "Roleplay",
      description: "Work behind the scenes managing celebrity publicity and media relations."
    }
  ],
  "miles-cutter": [
    // Collaboration scenes
    {
      id: "1",
      characterId: "miles-cutter",
      title: "Create TV show reviews",
      caption: "Write in-depth reviews and analysis of current shows",
      type: "Collab",
      description: "Craft insightful TV show reviews and episode breakdowns with expert analysis."
    },
    {
      id: "2",
      characterId: "miles-cutter",
      title: "Design binge-watch guides",
      caption: "Create curated viewing lists for different moods and genres",
      type: "Collab",
      description: "Develop personalized binge-watching guides for every taste and occasion."
    },
    {
      id: "3",
      characterId: "miles-cutter",
      title: "Predict show outcomes",
      caption: "Analyze plot threads and predict future storylines",
      type: "Collab",
      description: "Use TV expertise to predict plot twists and analyze narrative patterns."
    },
    // Learning scenes
    {
      id: "4",
      characterId: "miles-cutter",
      title: "TV production deep dive",
      caption: "Learn how television shows are created and produced",
      type: "Learn",
      description: "Understand the television production process from concept to screen."
    },
    {
      id: "5",
      characterId: "miles-cutter",
      title: "Genre evolution study",
      caption: "Explore how TV genres have changed over the decades",
      type: "Learn",
      description: "Trace the evolution of television genres and storytelling techniques."
    },
    {
      id: "6",
      characterId: "miles-cutter",
      title: "Streaming strategy analysis",
      caption: "Understand how streaming platforms choose and promote content",
      type: "Learn",
      description: "Learn how streaming services curate content and influence viewing habits."
    },
    // Game scenes
    {
      id: "7",
      characterId: "miles-cutter",
      title: "TV show trivia marathon",
      caption: "Test knowledge across all genres and decades of television",
      type: "Game",
      description: "Challenge your TV knowledge with trivia spanning decades of television history."
    },
    {
      id: "8",
      characterId: "miles-cutter",
      title: "Show recommendation engine",
      caption: "Match viewers with perfect shows based on their preferences",
      type: "Game",
      description: "Test recommendation skills by matching shows to viewer preferences perfectly."
    },
    {
      id: "9",
      characterId: "miles-cutter",
      title: "Plot twist prediction game",
      caption: "Predict surprising plot developments before they happen",
      type: "Game",
      description: "Use TV expertise to predict plot twists and surprise developments."
    },
    // Roleplay scenes
    {
      id: "10",
      characterId: "miles-cutter",
      title: "TV critic collaboration",
      caption: "Co-host a television review podcast with Miles",
      type: "Roleplay",
      description: "Co-host a popular TV review podcast discussing the latest shows and trends."
    },
    {
      id: "11",
      characterId: "miles-cutter",
      title: "Streaming service consultant",
      caption: "Advise a streaming platform on content acquisition",
      type: "Roleplay",
      description: "Work as content consultants helping streaming services choose winning shows."
    },
    {
      id: "12",
      characterId: "miles-cutter",
      title: "TV show pitch meeting",
      caption: "Pitch new show concepts to network executives",
      type: "Roleplay",
      description: "Present original TV show concepts to network executives with Miles' expertise."
    }
  ]
};