// Mariem Patient Knowledge Base
// Comprehensive Q&A database for the 3D avatar patient

export interface KnowledgeBaseEntry {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export const MARIEM_KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  // Personal Information
  {
    question: "What's your name?",
    answer: "I'm Mariem.",
    category: "personal",
    keywords: ["name", "call", "what's your name", "what is your name"]
  },
  {
    question: "How old are you?",
    answer: "I'm 45 years old.",
    category: "personal",
    keywords: ["age", "old", "how old", "years old"]
  },
  {
    question: "Where do you live?",
    answer: "I live in the United Arab Emirates with my family.",
    category: "personal",
    keywords: ["where", "live", "location", "uae", "emirates"]
  },

  // Main Problem
  {
    question: "What's your problem?",
    answer: "Hi doctor, I'm Mariem. I've been dealing with some really frustrating skin issues for quite a while now. My skin gets so dry and itchy, and sometimes it's red and inflamed, especially on my arms and neck. It's been really bothering me and I'm not sure what's going on.",
    category: "main_problem",
    keywords: ["problem", "issue", "what's wrong", "what brings you", "what is your problem"]
  },

  // Symptom Details
  {
    question: "When did this start?",
    answer: "It started a few months ago, but it's been getting progressively worse. I've tried moisturizing, but it doesn't seem to help much. The itching gets really bad, especially at night. I'm really worried about this - it's affecting my sleep and I'm embarrassed to wear short sleeves.",
    category: "symptoms",
    keywords: ["when did this start", "when did symptoms start", "when symptoms started", "when did it start", "started", "begin"]
  },
  {
    question: "Can you describe your symptoms?",
    answer: "My skin gets really dry, itchy, and sometimes it's red and inflamed, especially on my arms and neck. The itching gets really bad, especially at night. Sometimes I wake up scratching and I'm afraid I'm making it worse. It's really affecting my quality of life.",
    category: "symptoms",
    keywords: ["describe symptoms", "symptoms", "what symptoms", "how does it look", "describe your skin"]
  },
  {
    question: "How have your symptoms changed over time?",
    answer: "It started a few months ago, but it's been getting progressively worse. At first it was just a little dry, but now it's constantly itchy and inflamed. I'm really worried about where this is heading if we don't figure out what's causing it.",
    category: "symptoms",
    keywords: ["changed over time", "getting worse", "progression", "how has it changed", "worse"]
  },

  // Family History
  {
    question: "Do you have any family members with allergies or asthma?",
    answer: "Actually, yes. My mother has asthma. Do you think that could be related to what's happening with my skin? I'm really hoping this isn't something serious.",
    category: "family_history",
    keywords: ["family", "allergies", "asthma", "mother", "family history", "anyone in your family"]
  },

  // Previous Experience
  {
    question: "Have you had similar skin issues before?",
    answer: "I've had a few rashes before, but I never really thought about it as something long-term. This feels different though - it's more persistent and really uncomfortable. I'm so frustrated because nothing I try seems to help.",
    category: "previous_experience",
    keywords: ["before", "similar", "previous", "had this before", "experienced this before", "past"]
  },

  // Treatment Attempts
  {
    question: "What have you tried so far to treat your symptoms?",
    answer: "I've tried moisturizing, but it doesn't seem to help much. I've also tried some over-the-counter creams, but they only provide temporary relief. I'm really frustrated because I feel like I'm not getting anywhere with this.",
    category: "treatment",
    keywords: ["tried", "what have you tried", "treatment attempts", "what did you try", "creams", "moisturizing"]
  },

  // Impact on Life
  {
    question: "How do these symptoms affect your daily life?",
    answer: "The itching gets really bad, especially at night, and it's been bothering me a lot. I can't sleep properly, I'm embarrassed to wear certain clothes, and I'm constantly worried about people noticing. It's really taking a toll on me emotionally.",
    category: "impact",
    keywords: ["affect daily life", "daily life", "impact on life", "how does this affect", "daily activities"]
  },

  // Sleep Issues
  {
    question: "How does this affect your sleep?",
    answer: "I wake up multiple times during the night because of the itching. Sometimes I scratch in my sleep and wake up with scratches. I'm exhausted during the day because I'm not getting proper rest. It's really affecting my daily life.",
    category: "sleep",
    keywords: ["sleep", "night", "affect sleep", "sleep issues", "wake up"]
  },

  // Clothing Concerns
  {
    question: "How does this affect your clothing choices?",
    answer: "I avoid wearing short sleeves or anything that shows my arms and neck. I'm embarrassed about people seeing the redness and inflammation. I used to love wearing certain clothes, but now I feel like I have to cover up all the time.",
    category: "clothing",
    keywords: ["clothing", "clothes", "what you wear", "clothing choices", "cover up"]
  },

  // Emotional Impact
  {
    question: "How has this affected you emotionally?",
    answer: "It's been really hard on me. I feel self-conscious all the time, and the constant itching is driving me crazy. I'm worried about what people think when they see my skin, and I'm frustrated that I can't seem to fix it myself.",
    category: "emotional",
    keywords: ["emotionally", "emotional impact", "how do you feel", "frustrated", "worried"]
  },

  // Treatment Concerns
  {
    question: "What are your concerns about treatment options?",
    answer: "I've heard about corticosteroids, but I'm a bit concerned about using them too much. Are they safe for long-term use? I'm worried about side effects, but I'm also desperate for some relief from this itching.",
    category: "treatment_concerns",
    keywords: ["treatment concerns", "treatment options", "concerns about treatment", "steroids", "side effects"]
  },

  // Long-term Outlook
  {
    question: "What are your concerns about the long-term nature of this condition?",
    answer: "Will this condition go away, or is it something I'll have to manage long-term? I'm really hoping this isn't something I'll have to deal with forever. It's been so hard on me emotionally.",
    category: "long_term",
    keywords: ["long term", "forever", "permanent", "manage long term", "go away"]
  },

  // Hope for Relief
  {
    question: "What are you hoping to get from this visit?",
    answer: "I'm really hoping you can help me figure out what's causing this and give me some relief. I want to be able to sleep through the night without itching, and I want to feel confident about my skin again. I'm desperate for some answers.",
    category: "hope",
    keywords: ["hoping", "hope for relief", "what do you hope", "what are you hoping", "relief"]
  },

  // Work Impact
  {
    question: "How does this affect your work?",
    answer: "I work in an office, but this skin problem is making it difficult to focus sometimes because of the itching. I'm constantly distracted and worried about people noticing my skin condition.",
    category: "work",
    keywords: ["work", "job", "office", "focus", "distracted"]
  },

  // Triggers
  {
    question: "What makes your symptoms worse?",
    answer: "I notice it gets worse when I'm stressed, and sometimes certain fabrics make it itch more. Temperature changes seem to affect it too. I've tried to avoid wool and synthetic fabrics, but it doesn't seem to make much difference.",
    category: "triggers",
    keywords: ["worse", "triggers", "what makes it worse", "stress", "fabrics"]
  }
];

// Helper function to find the best matching answer
export const findBestAnswer = (userQuestion: string): string => {
  const question = userQuestion.toLowerCase().trim();
  
  // First, try exact keyword matches
  for (const entry of MARIEM_KNOWLEDGE_BASE) {
    for (const keyword of entry.keywords) {
      if (question.includes(keyword.toLowerCase())) {
        console.log(`✅ Found exact match for keyword: "${keyword}"`);
        return entry.answer;
      }
    }
  }
  
  // If no exact match, try partial matches
  for (const entry of MARIEM_KNOWLEDGE_BASE) {
    const entryQuestion = entry.question.toLowerCase();
    if (question.includes(entryQuestion) || entryQuestion.includes(question)) {
      console.log(`✅ Found partial match for question: "${entry.question}"`);
      return entry.answer;
    }
  }
  
  // Default response if no match found
  return "I'm not sure I understand that question, doctor. Could you explain it differently? I want to make sure I give you the right information to help me.";
};

// Get all questions by category
export const getQuestionsByCategory = (category: string): KnowledgeBaseEntry[] => {
  return MARIEM_KNOWLEDGE_BASE.filter(entry => entry.category === category);
};

// Get all available categories
export const getCategories = (): string[] => {
  return Array.from(new Set(MARIEM_KNOWLEDGE_BASE.map(entry => entry.category)));
}; 