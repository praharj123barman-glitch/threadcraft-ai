export interface ThreadStyle {
  id: string;
  emoji: string;
  title: string;
  description: string;
  preview: string;
  promptGuide: string;
}

export const threadStyles: ThreadStyle[] = [
  {
    id: "storytelling",
    emoji: "📖",
    title: "Storytelling",
    description: "Narrative arc with tension, climax, and lesson learned",
    preview:
      "I almost quit my startup last Tuesday. Here's the 3am phone call that changed everything...",
    promptGuide: `Structure this as a narrative story thread:
- Tweet 1 (HOOK): Open with a dramatic moment, cliffhanger, or "I almost..." statement that creates tension
- Tweets 2-3: Set the scene — what was happening, the stakes, the conflict
- Tweets 4-6: Build tension — obstacles, emotions, turning point
- Second-to-last tweet: The climax and resolution — what happened, the lesson
- Last tweet (CTA): Relate the lesson to the reader's life, ask them to share their story
Use first person. Be vivid and specific. Include dialogue or internal thoughts in quotes.`,
  },
  {
    id: "listicle",
    emoji: "📝",
    title: "Listicle",
    description: "Numbered tips, tools, or insights — easy to consume and save",
    preview:
      "10 VS Code shortcuts that senior devs use daily (but juniors never learn):",
    promptGuide: `Structure this as a listicle thread:
- Tweet 1 (HOOK): "X [things/tools/tips/habits] that [bold claim]:" — make the number specific and the benefit clear
- Each middle tweet: One numbered item with a brief explanation (2-3 lines max). Start with the item name in bold/caps, then explain WHY it matters
- Order from most surprising/valuable to least, front-load the best items
- Last tweet (CTA): Summarize the theme, ask "Which one are you trying first?" or "Save this for later"
Keep each item punchy. Use line breaks between the item and its explanation.`,
  },
  {
    id: "hot-take",
    emoji: "🔥",
    title: "Hot Take",
    description: "Bold, provocative opinion that sparks debate and quote-tweets",
    preview:
      "Unpopular opinion: College degrees are becoming the new high school diplomas. Here's why employers don't care anymore:",
    promptGuide: `Structure this as a hot take / contrarian opinion thread:
- Tweet 1 (HOOK): Start with "Unpopular opinion:", "Hot take:", or a bold declarative statement that challenges conventional wisdom
- Tweet 2: State the counter-argument — what most people believe and why
- Tweets 3-5: Dismantle the conventional view with evidence, examples, or logic. Each tweet should be a separate argument
- Second-to-last tweet: Acknowledge the nuance — "Now, this doesn't mean..." to show intellectual honesty
- Last tweet (CTA): Restate your position strongly. Ask "Agree or disagree?" or "Change my mind"
Be bold but not reckless. Use data and examples to back up claims.`,
  },
  {
    id: "case-study",
    emoji: "📊",
    title: "Case Study",
    description: "Deep-dive analysis of a real example with data and takeaways",
    preview:
      "How Notion went from 0 to $10B without a sales team. A breakdown of their genius growth strategy:",
    promptGuide: `Structure this as a case study thread:
- Tweet 1 (HOOK): "[Company/Person] did [impressive result]. Here's the breakdown:" — use specific numbers
- Tweet 2: Background — who they are, where they started, the challenge they faced
- Tweets 3-5: The strategy — what they did differently, step by step. Include specific numbers, metrics, or quotes if possible
- Tweet 6-7: The results — concrete outcomes with data. Before/after comparisons work great
- Last tweet (CTA): Key takeaways readers can apply to their own work. "The lesson: [principle]. How are you applying this?"
Use specific numbers and data points. Name real companies, tools, or people.`,
  },
  {
    id: "how-to",
    emoji: "🛠️",
    title: "How-To",
    description: "Step-by-step tutorial that teaches a specific skill or process",
    preview:
      "How to build a $10K/month SaaS in 90 days (step-by-step playbook I used):",
    promptGuide: `Structure this as a how-to / tutorial thread:
- Tweet 1 (HOOK): "How to [achieve desirable outcome] (step-by-step):" — be specific about the result
- Each middle tweet: One clear step, numbered. Format as "Step X: [Action]" followed by 1-2 lines explaining HOW to do it
- Include specific tools, resources, or techniques — not vague advice
- Second-to-last tweet: Common mistakes to avoid or pro tips
- Last tweet (CTA): "Follow for more [topic] breakdowns" or "Bookmark this and come back when you're ready to start"
Be actionable and specific. Each step should be something the reader can do TODAY.`,
  },
  {
    id: "contrarian",
    emoji: "🔄",
    title: "Contrarian",
    description: "Flips common advice on its head with a fresh perspective",
    preview:
      "Stop setting goals. Seriously. Here's the counterintuitive system that 10x'd my output:",
    promptGuide: `Structure this as a contrarian / myth-busting thread:
- Tweet 1 (HOOK): "Stop [common advice]. Here's what actually works:" or "Everything you know about [topic] is wrong."
- Tweet 2: Identify the common belief — "Most people think..." or "The usual advice is..."
- Tweets 3-4: Explain WHY the common approach fails — with examples or data
- Tweets 5-7: Present your alternative framework or approach. Explain the logic behind it
- Second-to-last tweet: Show proof — your results, others' results, or logical reasoning
- Last tweet (CTA): Challenge the reader to try your approach. "Try this for 30 days and tell me what happens"
The key is specificity — don't just say the opposite, explain WHY the opposite works better.`,
  },
];

export function getStyleById(id: string): ThreadStyle | undefined {
  return threadStyles.find((s) => s.id === id);
}
