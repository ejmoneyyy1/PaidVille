export type StockPost = {
  _id: string;
  title: string;
  slug: {current: string};
  author: string;
  publishedAt: string;
  excerpt: string;
  category: string;
  fallbackBg: string;
  fallbackAccent: string;
};

export type StockArticle = {
  title: string;
  author: string;
  publishedAt: string;
  category: string;
  headerBg: string;
  body: string[];
};

export const stockPosts: StockPost[] = [
  {
    _id: 'stock-1',
    title: 'PaidVille Is Here — Welcome to Biased Opinions',
    slug: {current: 'welcome-to-biased-opinions'},
    author: 'PaidVille',
    publishedAt: '2024-01-15',
    excerpt:
      'No filter, no fluff — real takes on events, culture, branding, and building something from the ground up in Arkansas.',
    category: 'CULTURE',
    fallbackBg: '#1A1A1A',
    fallbackAccent: '#B00000',
  },
  {
    _id: 'stock-2',
    title: 'What Makes an Unforgettable Event?',
    slug: {current: 'what-makes-an-unforgettable-event'},
    author: 'PaidVille',
    publishedAt: '2024-02-01',
    excerpt:
      'From 50-person gatherings to 500-person productions — the elements that make people talk for years.',
    category: 'EVENTS',
    fallbackBg: '#B00000',
    fallbackAccent: '#FFFFFF',
  },
  {
    _id: 'stock-3',
    title: "Your Brand Is Priceless. Stop Treating It Like It Isn't.",
    slug: {current: 'your-brand-is-priceless'},
    author: 'PaidVille',
    publishedAt: '2024-02-20',
    excerpt:
      "Most creatives have already built something remarkable. Here's how PaidVille approaches brand identity.",
    category: 'BRANDING',
    fallbackBg: '#2A2A2A',
    fallbackAccent: '#B00000',
  },
  {
    _id: 'stock-4',
    title: "Fayetteville's Creative Scene Is Bigger Than You Think",
    slug: {current: 'fayetteville-creative-scene'},
    author: 'PaidVille',
    publishedAt: '2024-03-05',
    excerpt:
      'ARK USA is sleeping on its own talent. We spotlight the creatives putting Fayetteville on the map.',
    category: 'COMMUNITY',
    fallbackBg: '#111111',
    fallbackAccent: '#B00000',
  },
];

export const stockArticles: Record<string, StockArticle> = {
  'welcome-to-biased-opinions': {
    title: 'PaidVille Is Here — Welcome to Biased Opinions',
    author: 'PaidVille',
    publishedAt: '2024-01-15',
    category: 'CULTURE',
    headerBg: '#1A1A1A',
    body: [
      'This is where we talk. No filter, no fluff.',
      "Biased Opinions is PaidVille's editorial space — built for real takes on events, culture, branding, and what it means to build something from the ground up in Arkansas.",
      "We started in 2018 with a vision: bring premium event experiences to Fayetteville and beyond. Since then we've hosted 50+ events, sold 10,000+ tickets, and built a community that shows up every single time.",
      "This blog is the next chapter. Expect breakdowns of our biggest events, spotlights on local creatives, honest commentary on the culture we're building, and the kind of takes you won't find anywhere else.",
      "We're just getting started. Stay locked in.",
      '— The PaidVille Team',
    ],
  },
  'what-makes-an-unforgettable-event': {
    title: 'What Makes an Unforgettable Event?',
    author: 'PaidVille',
    publishedAt: '2024-02-01',
    category: 'EVENTS',
    headerBg: '#B00000',
    body: [
      "After 50+ events and 10,000 tickets sold, we've learned what separates a good event from one people talk about for years.",
      "It's not the venue. It's not even the lineup.",
      "It's the feeling people have when they walk in the door. The moment they realize this isn't just a party — it's an experience that was built specifically for them.",
      "The best events we've ever produced had three things in common: intentional atmosphere, seamless execution, and moments of genuine surprise.",
      'Atmosphere is everything. Lighting, sound, layout — every detail communicates whether you care or not. When you walk into a PaidVille event, you know immediately that someone thought about you.',
      'Execution is invisible. The best productions are the ones where nothing visibly goes wrong. That takes preparation, the right team, and the ability to solve problems before the crowd arrives.',
      "Surprise creates memories. Every great event has a moment nobody expected. That's what people screenshot, share, and talk about for years.",
      "That's what we build. Every time.",
    ],
  },
  'your-brand-is-priceless': {
    title: "Your Brand Is Priceless. Stop Treating It Like It Isn't.",
    author: 'PaidVille',
    publishedAt: '2024-02-20',
    category: 'BRANDING',
    headerBg: '#2A2A2A',
    body: [
      "Most creatives we work with have already built something remarkable. They just don't know how to show it.",
      "Your brand is not your logo. It's not your color palette or your Instagram aesthetic. Your brand is the promise you make to every person who encounters your work — and whether you keep it.",
      "PaidVille's approach to branding starts with one question: what do you want people to feel?",
      'Not think. Feel.',
      'Because people make decisions emotionally and justify them logically. The brands that win are the ones that understand this and build every touchpoint around creating the right feeling.',
      "We've helped brands in Fayetteville go from unknown to unforgettable. The process is always the same: get clear on the feeling, build a visual language that creates it, and execute consistently across every surface.",
      "Your brand is priceless. It's time to treat it that way.",
    ],
  },
  'fayetteville-creative-scene': {
    title: "Fayetteville's Creative Scene Is Bigger Than You Think",
    author: 'PaidVille',
    publishedAt: '2024-03-05',
    category: 'COMMUNITY',
    headerBg: '#111111',
    body: [
      "People sleep on Arkansas. We're here to wake them up.",
      'Fayetteville has one of the most underrated creative communities in the South. Photographers, designers, event producers, musicians, and entrepreneurs who are building real things — just without the cosign from a major market.',
      "That's changing.",
      "PaidVille was built here intentionally. We could have chased bigger markets from the jump. Instead we chose to plant a flag in Northwest Arkansas and prove that you don't need to leave home to build something world-class.",
      "The talent is here. The audience is here. The only thing missing was the infrastructure — and that's exactly what PaidVille is building.",
      "If you're a creative in Fayetteville and you're ready to elevate, we want to work with you. Reach out. Let's build together.",
      'ARK USA. Est. 2018.',
    ],
  },
};
