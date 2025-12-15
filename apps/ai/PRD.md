Uxie is an AI-powered educational platform that transforms static learning into interactive experiences using dynamic visualizations, adaptive exercises, and quizzes. Users input topics, optionally upload documents or images, customize course parameters, and access a personalized dashboard with generated chapters, per-chapter quizzes, and AI chat assistants. The platform targets students and lifelong learners in Indonesia and English-speaking regions, emphasizing accessibility and engagement through modern tech stacks like Next.js, Mastra AI backend, and Supabase infrastructure.

​
Target Audience and Goals

Primary users include high school and university students, aspiring developers, and professionals seeking skill upgrades, aligning with interests in iOS development, hackathons, and entrepreneurship. Key goals: deliver personalized, interactive courses in 0-30 hours; support Indonesian and English; ensure adaptive learning via AI for better retention. Success metrics: 80% course completion rate, 4.5+ user ratings, and 20% monthly active users growth.

​
Key Features

    Topic Input and Customization: Users enter topics, upload documents/images; select duration (0-30 hours), difficulty (easy/medium/hard), language (Indonesian/English).

    Review and Generation: Summary page for confirmation; loading screen with "notify me" option; AI generates course using Google Gemini 2.5 Pro.

    Dashboard: Displays title, description, header image, estimated time, progress bar, "Start Learning" button, and chapter list.

    Chapter Interactions: Per-chapter quizzes for assessment; AI chat assistant for queries, powered by Mastra with LibSQL memory.

    Auth and Progress: Supabase-handled login/signup; realtime progress syncing and storage.

    ​

User Flows

    Landing → Login/Signup → Topic input (text + optional uploads) → Duration/Difficulty/Language selection → Review → Loading/Notify.

    Post-generation: Dashboard → Select chapter → Content + visualizations/exercises → Quiz → AI chat → Progress update.

    Additional: Resume sessions, edit courses, share progress; mobile-responsive design for seamless access.

    ​

Technical Architecture

Monorepo with Turborepo (builds), pnpm (packages), TypeScript (all). Web app: Next.js 16/React 19, Tailwind CSS 4, Radix UI. Backend: Mastra AI (Gemini 2.5 Pro, evaluators, LibSQL). Infra: Supabase (Postgres DB, auth, storage, realtime). Shared: @uxie/eslint-config, @uxie/typescript-config. MVP prioritizes core flow; scale with caching for performance.

​
Non-Functional Requirements

    Performance: <2s AI responses, optimized for mobile/desktop; use caching/load-balancing.

​

Security: Supabase auth, data encryption for uploads/learning data; GDPR-compliant for minors.

​

Accessibility: WCAG 2.1, multilingual support, bright/clean UI with intuitive buttons.

​

Scalability: Serverless Supabase; monitor via Mastra observability. Local dev setup ready.
​
