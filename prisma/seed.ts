import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const courseCatalog = [
  {
    slug: "full-stack-javascript-bootcamp",
    title: "Full Stack JavaScript Bootcamp",
    shortDescription: "Build production-ready web apps with JavaScript, React, Node.js, and modern deployment workflows.",
    description:
      "This live cohort helps you build end-to-end web applications using modern JavaScript tools. You will work through frontend architecture, backend APIs, data flows, and deployment habits used in real product teams.",
    category: "Software Development",
    level: "Beginner",
    durationHours: 32,
    price: 14999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Senior Full Stack Engineer",
    previewLectureUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    modules: [
      {
        title: "Frontend foundations",
        description: "Understand the browser, DOM, JavaScript fundamentals, and UI composition patterns.",
        lectures: [
          { title: "JavaScript essentials and tooling", isPreview: true },
          { title: "Building responsive UI with React", isPreview: false },
          { title: "Component patterns and state management", isPreview: false },
        ],
      },
      {
        title: "Backend and APIs",
        description: "Create secure APIs, connect databases, and structure application logic for real products.",
        lectures: [
          { title: "Node.js and Express basics", isPreview: false },
          { title: "REST APIs and authentication", isPreview: false },
          { title: "Database integration and validation", isPreview: false },
        ],
      },
      {
        title: "Deployment and project launch",
        description: "Ship your project with performance tuning, environment configuration, and deployment flows.",
        lectures: [
          { title: "CI/CD workflow basics", isPreview: false },
          { title: "Deploying on Vercel and Render", isPreview: false },
          { title: "Final project review and optimization", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "react-nextjs-production-course",
    title: "React & Next.js Production Course",
    shortDescription: "Ship production-grade frontend apps with routing, rendering, APIs, and design systems.",
    description:
      "This recorded pathway is tailored for developers who want to master modern React and Next.js patterns for professional projects. You will implement scalable UI architecture, data fetching, and production-ready design decisions.",
    category: "Software Development",
    level: "Intermediate",
    durationHours: 28,
    price: 11999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Frontend Architect",
    previewLectureUrl: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
    modules: [
      {
        title: "React architecture",
        description: "Master component design, hooks, rendering strategies, and state modeling in real systems.",
        lectures: [
          { title: "Understanding React rendering", isPreview: true },
          { title: "Hooks and data flow design", isPreview: false },
          { title: "Reusable patterns for UI systems", isPreview: false },
        ],
      },
      {
        title: "Next.js app patterns",
        description: "Use routing, server actions, and layout patterns for scalable apps.",
        lectures: [
          { title: "App Router fundamentals", isPreview: false },
          { title: "Server components and data loading", isPreview: false },
          { title: "Authentication and protected routes", isPreview: false },
        ],
      },
      {
        title: "Production polish",
        description: "Improve performance, quality, and maintainability with observability and testing workflows.",
        lectures: [
          { title: "Performance tuning and Lighthouse", isPreview: false },
          { title: "Testing and quality gates", isPreview: false },
          { title: "Launching a portfolio-grade product", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "distributed-systems-nodejs",
    title: "Distributed Systems with Node.js",
    shortDescription: "Design resilient backend systems, queues, communication patterns, and operational thinking for scale.",
    description:
      "This live advanced course is designed for engineers who want to go beyond CRUD apps and think in systems. You will work with async flows, scaling patterns, reliability, observability, and queue-based design.",
    category: "Software Development",
    level: "Advanced",
    durationHours: 36,
    price: 18999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Platform Engineer",
    previewLectureUrl: "https://www.youtube.com/watch?v=7vQG5m7qfD4",
    modules: [
      {
        title: "System design mindset",
        description: "Learn how to evaluate bottlenecks, failure modes, and scaling trade-offs in backend systems.",
        lectures: [
          { title: "Scaling fundamentals and trade-offs", isPreview: true },
          { title: "Queues and async processing", isPreview: false },
          { title: "Load patterns and service boundaries", isPreview: false },
        ],
      },
      {
        title: "Reliability engineering",
        description: "Design for retry, observability, and graceful degradation in production systems.",
        lectures: [
          { title: "Retries, timeouts, and circuit breakers", isPreview: false },
          { title: "Monitoring and observability", isPreview: false },
          { title: "Incident response workflows", isPreview: false },
        ],
      },
      {
        title: "Real-world architecture lab",
        description: "Plan and evaluate a resilient architecture for a product with real traffic and complexity.",
        lectures: [
          { title: "Architecture workshop", isPreview: false },
          { title: "Trade-offs and decision review", isPreview: false },
          { title: "Final architecture teardown", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "ai-foundations-for-developers",
    title: "AI Foundations for Developers",
    shortDescription: "Learn the core concepts behind LLMs, prompt design, and practical AI product workflows.",
    description:
      "This beginner-friendly live course helps developers get confident with AI tooling, reasoning patterns, and practical product workflows. You will explore how AI fits into software, search, automation, and creative problem solving.",
    category: "AI Engineering",
    level: "Beginner",
    durationHours: 20,
    price: 9999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "AI Product Mentor",
    previewLectureUrl: "https://www.youtube.com/watch?v=JtQfNYq4bX8",
    modules: [
      {
        title: "AI basics and mental models",
        description: "Learn how language models work conceptually and how to use them in real workflows.",
        lectures: [
          { title: "How AI models reason and generate", isPreview: true },
          { title: "Prompting foundations", isPreview: false },
          { title: "Choosing the right AI workflow", isPreview: false },
        ],
      },
      {
        title: "Production AI use cases",
        description: "Explore examples from search, support, research, and automation.",
        lectures: [
          { title: "AI for task automation", isPreview: false },
          { title: "Building AI workflows for teams", isPreview: false },
          { title: "Human-in-the-loop quality checks", isPreview: false },
        ],
      },
      {
        title: "Responsible AI practice",
        description: "Use AI safely with evaluation, verification, and guardrails.",
        lectures: [
          { title: "Bias, safety, and limitations", isPreview: false },
          { title: "Evaluation patterns for outputs", isPreview: false },
          { title: "Capstone prompt design lab", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "llm-app-development-bootcamp",
    title: "LLM App Development Bootcamp",
    shortDescription: "Build AI-powered products with prompts, retrieval pipelines, and product-thinking workflows.",
    description:
      "This recorded intermediate course walks through production patterns for LLM-powered applications. You will explore RAG, prompt orchestration, tooling, and feedback loops used in AI product teams.",
    category: "AI Engineering",
    level: "Intermediate",
    durationHours: 24,
    price: 13999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "AI Systems Coach",
    previewLectureUrl: "https://www.youtube.com/watch?v=az9D9H5TQvY",
    modules: [
      {
        title: "LLM app foundations",
        description: "Learn the architecture behind AI products and assistant experiences.",
        lectures: [
          { title: "Prompt architecture basics", isPreview: true },
          { title: "Context and memory design", isPreview: false },
          { title: "Evaluation and iteration loops", isPreview: false },
        ],
      },
      {
        title: "Retrieval and knowledge systems",
        description: "Create retrieval pipelines, document search, and grounded answer generation.",
        lectures: [
          { title: "Vector search and embeddings", isPreview: false },
          { title: "Grounding responses in documents", isPreview: false },
          { title: "AI copilots using context layers", isPreview: false },
        ],
      },
      {
        title: "Operation and monitoring",
        description: "Track quality, degrade gracefully, and improve user trust over time.",
        lectures: [
          { title: "Metrics and prompt evaluation", isPreview: false },
          { title: "Feedback collection and refinement", isPreview: false },
          { title: "Capstone build and review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "mlops-production-ai-systems",
    title: "MLOps & Production AI Systems",
    shortDescription: "Operationalize AI pipelines, monitoring, deployment, and evaluation in enterprise workflows.",
    description:
      "This advanced live course covers machine learning operations for AI products at scale. You will look at deployment pipelines, evaluation gates, retraining decisions, and reliability practices used in production systems.",
    category: "AI Engineering",
    level: "Advanced",
    durationHours: 34,
    price: 18999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "ML Infrastructure Lead",
    previewLectureUrl: "https://www.youtube.com/watch?v=2KlLm8vNc5M",
    modules: [
      {
        title: "Model lifecycle operations",
        description: "Understand how models move from experimentation to reliable deployment.",
        lectures: [
          { title: "From notebook to deployment", isPreview: true },
          { title: "CI/CD for ML workflows", isPreview: false },
          { title: "Versioning data and models", isPreview: false },
        ],
      },
      {
        title: "Evaluation and drift",
        description: "Deploy systems that maintain quality and explain their performance over time.",
        lectures: [
          { title: "Quality metrics and guardrails", isPreview: false },
          { title: "Monitoring drift and regressions", isPreview: false },
          { title: "Safety and rollout readouts", isPreview: false },
        ],
      },
      {
        title: "Enterprise AI ops",
        description: "Plan production governance, cost control, and pipeline reliability for real organizations.",
        lectures: [
          { title: "Cost, governance, and policy", isPreview: false },
          { title: "Platform design workshop", isPreview: false },
          { title: "Final architecture review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "data-engineering-essentials",
    title: "Data Engineering Essentials",
    shortDescription: "Learn ingestion, transformation, warehousing, and daily pipeline operations for real data work.",
    description:
      "This beginner live course introduces the building blocks of modern data systems. You will understand ingestion pipelines, storage patterns, transformations, and how teams keep data reliable and accessible.",
    category: "Data Engineering",
    level: "Beginner",
    durationHours: 26,
    price: 10999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Data Platform Instructor",
    previewLectureUrl: "https://www.youtube.com/watch?v=yeY2mA7C7z4",
    modules: [
      {
        title: "Data pipeline foundations",
        description: "Learn where data comes from, how it moves, and how systems store it for analysis.",
        lectures: [
          { title: "Sources, sinks, and data flows", isPreview: true },
          { title: "ETL fundamentals", isPreview: false },
          { title: "Storage patterns and schema design", isPreview: false },
        ],
      },
      {
        title: "Warehouse and transformations",
        description: "Use SQL and logic to prepare clean datasets for downstream consumption.",
        lectures: [
          { title: "Building trusted tables", isPreview: false },
          { title: "Data quality and validation", isPreview: false },
          { title: "Modeling for reporting", isPreview: false },
        ],
      },
      {
        title: "Operate and monitor",
        description: "Create a practical operating rhythm for data reliability and freshness.",
        lectures: [
          { title: "Monitoring pipeline health", isPreview: false },
          { title: "Failure handling patterns", isPreview: false },
          { title: "Case study review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "modern-data-pipelines-airflow",
    title: "Modern Data Pipelines with Airflow",
    shortDescription: "Build orchestration flows, dependency graphs, and production-grade data job scheduling.",
    description:
      "This recorded intermediate course focuses on pipeline orchestration with Airflow and modern data stack patterns. You will implement workflows that handle batching, dependency handling, retries, and alerting.",
    category: "Data Engineering",
    level: "Intermediate",
    durationHours: 30,
    price: 14999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Cloud Data Engineer",
    previewLectureUrl: "https://www.youtube.com/watch?v=Yl9M93T2U1I",
    modules: [
      {
        title: "Orchestration basics",
        description: "Understand why workflow orchestration matters and how to model job dependencies.",
        lectures: [
          { title: "What orchestration solves", isPreview: true },
          { title: "DAG design and scheduling", isPreview: false },
          { title: "Task dependencies and retries", isPreview: false },
        ],
      },
      {
        title: "Production flows",
        description: "Implement data movement pipelines with observability and operational stability.",
        lectures: [
          { title: "Airflow operators and tasks", isPreview: false },
          { title: "Alerts and backfills", isPreview: false },
          { title: "Monitoring and notifications", isPreview: false },
        ],
      },
      {
        title: "Scaling pipelines",
        description: "Plan for failure handling, performance, and team collaboration in growing systems.",
        lectures: [
          { title: "Resource planning", isPreview: false },
          { title: "Data quality gates", isPreview: false },
          { title: "Pipeline hardening lab", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "lakehouse-architecture-streaming",
    title: "Lakehouse Architecture & Streaming",
    shortDescription: "Work with modern lakehouse patterns, streaming data, and high-scale analytical systems.",
    description:
      "This advanced live course covers the modern data stack for high-scale analytics. You will move through lakehouse design, event processing, schema evolution, and operational decision-making for streaming data products.",
    category: "Data Engineering",
    level: "Advanced",
    durationHours: 38,
    price: 21999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Data Architecture Lead",
    previewLectureUrl: "https://www.youtube.com/watch?v=s3o1r6A02SU",
    modules: [
      {
        title: "Lakehouse design",
        description: "Understand how analytical systems merge data lakes and warehouse patterns into one architecture.",
        lectures: [
          { title: "Lakehouse fundamentals", isPreview: true },
          { title: "Storage layers and transactions", isPreview: false },
          { title: "Data contracts and modeling", isPreview: false },
        ],
      },
      {
        title: "Streaming pipelines",
        description: "Learn how event-driven systems support operational and analytical needs in real time.",
        lectures: [
          { title: "Events, streams, and consumers", isPreview: false },
          { title: "Kafka and stream processing", isPreview: false },
          { title: "Latent data and real-time quality", isPreview: false },
        ],
      },
      {
        title: "Production architecture review",
        description: "Assess complex systems for performance, reliability, and cost efficiency.",
        lectures: [
          { title: "Trade-off analysis workshop", isPreview: false },
          { title: "Choosing the right stack", isPreview: false },
          { title: "Final design critique", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "data-analytics-for-business-teams",
    title: "Data Analytics for Business Teams",
    shortDescription: "Use dashboards, SQL, and reporting to make business decisions with confidence.",
    description:
      "This beginner live program blends business thinking with practical analytics. You will learn how to ask the right questions, map metrics, and build views that help teams track performance and make clear decisions.",
    category: "Data Analytics",
    level: "Beginner",
    durationHours: 22,
    price: 8999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Analytics Consultant",
    previewLectureUrl: "https://www.youtube.com/watch?v=ycI3rM-6NUI",
    modules: [
      {
        title: "Analytics foundations",
        description: "Understand metrics, KPI logic, and business storytelling through numbers.",
        lectures: [
          { title: "Metrics that matter", isPreview: true },
          { title: "Business questions and dashboards", isPreview: false },
          { title: "Data hygiene basics", isPreview: false },
        ],
      },
      {
        title: "SQL and reporting",
        description: "Use SQL to pull meaningful summaries and prepare analyses for stakeholders.",
        lectures: [
          { title: "Querying business data", isPreview: false },
          { title: "Groupings, filters, and joins", isPreview: false },
          { title: "Weekly reporting patterns", isPreview: false },
        ],
      },
      {
        title: "Storytelling with data",
        description: "Turn metrics into recommendations that stakeholders can act on quickly.",
        lectures: [
          { title: "Dashboard narratives", isPreview: false },
          { title: "Executive storytelling", isPreview: false },
          { title: "Capstone business review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "sql-powerbi-reporting-lab",
    title: "SQL + Power BI Reporting Lab",
    shortDescription: "Turn raw business data into dashboards, KPI scorecards, and decision-ready reports.",
    description:
      "This recorded intermediate course teaches analytics professionals how to combine SQL and Power BI to build polished reports. You will work with transforms, relationships, DAX basics, and executive-ready dashboards.",
    category: "Data Analytics",
    level: "Intermediate",
    durationHours: 27,
    price: 12999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Power BI Analyst",
    previewLectureUrl: "https://www.youtube.com/watch?v=G_SuQ_qD55M",
    modules: [
      {
        title: "Data prep and modeling",
        description: "Convert source data into consistent, reusable reporting models.",
        lectures: [
          { title: "Data import and shaping", isPreview: true },
          { title: "Relationships and star schema", isPreview: false },
          { title: "Modeling for KPI reporting", isPreview: false },
        ],
      },
      {
        title: "Power BI dashboards",
        description: "Design visual storytelling that supports analysis and decisions.",
        lectures: [
          { title: "Visual hierarchy and layout", isPreview: false },
          { title: "Using DAX for business logic", isPreview: false },
          { title: "Interactive report design", isPreview: false },
        ],
      },
      {
        title: "Reporting for business teams",
        description: "Create dashboards that help managers and executives act decisively.",
        lectures: [
          { title: "Executive dashboard patterns", isPreview: false },
          { title: "Storyboarding insights", isPreview: false },
          { title: "Final dashboard critique", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "experimentation-decision-intelligence",
    title: "Experimentation & Decision Intelligence",
    shortDescription: "Measure performance, test ideas, and guide strategy with analytical evidence.",
    description:
      "This advanced live course focuses on analytical decision making in modern organizations. You will cover experimentation, KPI design, product metrics, and decision frameworks used by strong data teams.",
    category: "Data Analytics",
    level: "Advanced",
    durationHours: 31,
    price: 16999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Analytics Strategy Lead",
    previewLectureUrl: "https://www.youtube.com/watch?v=s0lA8uX2yqI",
    modules: [
      {
        title: "Decision frameworks",
        description: "Translate business questions into measurable hypotheses and success metrics.",
        lectures: [
          { title: "What makes a decision testable", isPreview: true },
          { title: "Defining metrics and guardrails", isPreview: false },
          { title: "Experiment design basics", isPreview: false },
        ],
      },
      {
        title: "Experimentation practice",
        description: "Evaluate methods for testing changes with valid analysis and operational logic.",
        lectures: [
          { title: "A/B testing fundamentals", isPreview: false },
          { title: "Statistical thinking and sample size", isPreview: false },
          { title: "Risk and bias in experiments", isPreview: false },
        ],
      },
      {
        title: "Decision intelligence lab",
        description: "Use evidence to drive decisions across teams and business priorities.",
        lectures: [
          { title: "Decision maps and trade-offs", isPreview: false },
          { title: "Executive recommendation deck", isPreview: false },
          { title: "Capstone final review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "dsa-for-coding-interviews",
    title: "DSA for Coding Interviews",
    shortDescription: "Master core data structures and algorithms for interview readiness and confident problem solving.",
    description:
      "This recorded beginner-friendly course helps you build confidence with data structures, time complexity, and problem-solving patterns. You will practice the fundamentals that power interview prep and technical problem solving.",
    category: "Data Structure & Algorithms",
    level: "Beginner",
    durationHours: 25,
    price: 9999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "DSA Mentor",
    previewLectureUrl: "https://www.youtube.com/watch?v=8hly31xKli0",
    modules: [
      {
        title: "Core data structures",
        description: "Work through arrays, strings, stacks, queues, and hash maps.",
        lectures: [
          { title: "Arrays and strings basics", isPreview: true },
          { title: "Hash maps and sets", isPreview: false },
          { title: "Stacks and queues", isPreview: false },
        ],
      },
      {
        title: "Algorithm patterns",
        description: "Learn the core patterns behind interview solution building.",
        lectures: [
          { title: "Two pointers and sliding window", isPreview: false },
          { title: "Greedy and sorting strategies", isPreview: false },
          { title: "Binary search fundamentals", isPreview: false },
        ],
      },
      {
        title: "Interview practice",
        description: "Translate problem solving into crisp, explainable interview answers.",
        lectures: [
          { title: "How to explain your approach", isPreview: false },
          { title: "Complexity analysis", isPreview: false },
          { title: "Mock interview drills", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "advanced-dsa-problem-solving",
    title: "Advanced DSA Problem Solving",
    shortDescription: "Go deeper into dynamic programming, graphs, and optimization-focused algorithmic thinking.",
    description:
      "This live intermediate course strengthens your algorithmic toolkit for technical interviews and real engineering problem solving. You will work through DP, graph traversal, and optimization strategies used in product and platform engineering.",
    category: "Data Structure & Algorithms",
    level: "Intermediate",
    durationHours: 30,
    price: 14999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Algorithm Coach",
    previewLectureUrl: "https://www.youtube.com/watch?v=QfX0qD-kKQ8",
    modules: [
      {
        title: "Dynamic programming",
        description: "Build repeatable strategies for optimization and decision-heavy problems.",
        lectures: [
          { title: "DP fundamentals", isPreview: true },
          { title: "State design and transitions", isPreview: false },
          { title: "Optimization and memoization", isPreview: false },
        ],
      },
      {
        title: "Graphs and trees",
        description: "Learn traversal, shortest path, and connected-component reasoning.",
        lectures: [
          { title: "Graph traversal patterns", isPreview: false },
          { title: "Tree recursion and BFS", isPreview: false },
          { title: "Shortest path and topological ordering", isPreview: false },
        ],
      },
      {
        title: "Advanced interview drills",
        description: "Solve complex problems under time pressure and communicate your reasoning clearly.",
        lectures: [
          { title: "High-difficulty pattern review", isPreview: false },
          { title: "Mock interviews and live debug", isPreview: false },
          { title: "Final problem-solving sprint", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "graph-algorithms-system-design",
    title: "Graph Algorithms & System Design",
    shortDescription: "Understand graphs, optimization, and design thinking for hard engineering and interview challenges.",
    description:
      "This recorded advanced course explores graph traversal, design reasoning, and the systematic approach to solving complex engineering problems. It is designed for learners who want to strengthen both algorithmic thinking and product architecture judgment.",
    category: "Data Structure & Algorithms",
    level: "Advanced",
    durationHours: 33,
    price: 17999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Systems Thinker",
    previewLectureUrl: "https://www.youtube.com/watch?v=0V3lXMz6dUI",
    modules: [
      {
        title: "Graph theory and optimization",
        description: "Understand graph representations, traversal, and condensed problem logic.",
        lectures: [
          { title: "Weighted graphs and traversal", isPreview: true },
          { title: "Shortest path and cycle detection", isPreview: false },
          { title: "Optimization via graph modeling", isPreview: false },
        ],
      },
      {
        title: "System design reasoning",
        description: "Transform technical constraints into resilient architecture choices.",
        lectures: [
          { title: "Design constraints and trade-offs", isPreview: false },
          { title: "Scaling and modularity", isPreview: false },
          { title: "API and service boundaries", isPreview: false },
        ],
      },
      {
        title: "Advanced synthesis",
        description: "Combine graph reasoning and product thinking in hard engineering problem solving.",
        lectures: [
          { title: "Complex challenge walkthrough", isPreview: false },
          { title: "Design review and trade-offs", isPreview: false },
          { title: "Final capstone analysis", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "prompt-engineering-studio",
    title: "Prompt Engineering Studio",
    shortDescription: "Design better prompts, refine outputs, and create reliable AI-driven workflows for real tasks.",
    description:
      "This unpublished cohort helps learners practice prompt design for research, analysis, and automation. It is built for teams exploring AI workflows without over-engineering the process.",
    category: "AI Engineering",
    level: "Beginner",
    durationHours: 18,
    price: 7999,
    featured: false,
    isPublished: false,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Prompt Design Coach",
    previewLectureUrl: "https://www.youtube.com/watch?v=2U4QZH7XxHg",
    modules: [
      {
        title: "Prompt patterns",
        description: "Practice clear, targeted prompts to get reliable outputs from AI tools.",
        lectures: [
          { title: "Prompt anatomy", isPreview: true },
          { title: "Role, context, and constraints", isPreview: false },
          { title: "Structured prompt design", isPreview: false },
        ],
      },
      {
        title: "AI task workflows",
        description: "Create workflows for analysis, ideation, and operational support.",
        lectures: [
          { title: "Using AI for research", isPreview: false },
          { title: "Workflow templates for teams", isPreview: false },
          { title: "Quality check process", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "excel-to-insight-workflow",
    title: "Excel to Insight Workflow",
    shortDescription: "Move from spreadsheet operations to structured insights and business reporting.",
    description:
      "This unpublished recorded course introduces analysts to a workflow that moves from raw spreadsheet data to structured insights. It is designed for learners who want a practical route into analytics work.",
    category: "Data Analytics",
    level: "Intermediate",
    durationHours: 19,
    price: 6999,
    featured: false,
    isPublished: false,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Business Analyst Mentor",
    previewLectureUrl: "https://www.youtube.com/watch?v=ifAAZ15iK0g",
    modules: [
      {
        title: "Spreadsheet workflows",
        description: "Understand how to organize, clean, and transform data in Excel and larger workflows.",
        lectures: [
          { title: "Spreadsheet cleanup and formulas", isPreview: true },
          { title: "Pivot tables and summaries", isPreview: false },
          { title: "Data cleaning exercise", isPreview: false },
        ],
      },
      {
        title: "Insight generation",
        description: "Turn cleaned data into business-friendly narratives and recommendations.",
        lectures: [
          { title: "Pattern discovery", isPreview: false },
          { title: "Dashboard summary design", isPreview: false },
          { title: "Final business case review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "backend-apis-fastapi",
    title: "Backend APIs with FastAPI",
    shortDescription: "Build secure, fast, and scalable backend services for modern products and apps.",
    description:
      "This unpublished live course focuses on API design, authentication, validation, and backend architecture using FastAPI. It is a strong practical path for developers building production-ready services.",
    category: "Software Development",
    level: "Intermediate",
    durationHours: 24,
    price: 11999,
    featured: false,
    isPublished: false,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Backend Systems Mentor",
    previewLectureUrl: "https://www.youtube.com/watch?v=PPjW4y1WQ2s",
    modules: [
      {
        title: "API design fundamentals",
        description: "Learn request/response patterns, route modeling, and clean API structure.",
        lectures: [
          { title: "REST and route design", isPreview: true },
          { title: "Validation and schemas", isPreview: false },
          { title: "Error handling and status codes", isPreview: false },
        ],
      },
      {
        title: "Auth and data layers",
        description: "Secure services with session patterns, JWT, and database-backed application logic.",
        lectures: [
          { title: "Authentication patterns", isPreview: false },
          { title: "Modeling service layers", isPreview: false },
          { title: "Database integration patterns", isPreview: false },
        ],
      },
      {
        title: "Launch readiness",
        description: "Harden your backend for deployment, monitoring, and maintainability.",
        lectures: [
          { title: "Performance and observability", isPreview: false },
          { title: "Deployment checklist", isPreview: false },
          { title: "Final project walkthrough", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "warehouse-modeling-workshop",
    title: "Warehouse Modeling Workshop",
    shortDescription: "Design and optimize warehouse and analytics data models for real operational teams.",
    description:
      "This unpublished recorded course dives into modeling principles for data warehousing, dimensional modeling, and stable reporting. It is intended for practitioners who want to strengthen their data design skills.",
    category: "Data Engineering",
    level: "Advanced",
    durationHours: 26,
    price: 16999,
    featured: false,
    isPublished: false,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Warehouse Modeling Expert",
    previewLectureUrl: "https://www.youtube.com/watch?v=WSmLcjf6cJQ",
    modules: [
      {
        title: "Warehouse design",
        description: "Learn fact tables, dimension tables, and data modeling trade-offs.",
        lectures: [
          { title: "Star vs snowflake", isPreview: true },
          { title: "Fact table patterns", isPreview: false },
          { title: "Dimension modeling best practices", isPreview: false },
        ],
      },
      {
        title: "Modeling for analytics",
        description: "Build robust data models that support consistent business reporting.",
        lectures: [
          { title: "SCD and slowly changing dimensions", isPreview: false },
          { title: "Data granularity and lineage", isPreview: false },
          { title: "Testing warehouse models", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "dynamic-programming-mastery",
    title: "Dynamic Programming Mastery",
    shortDescription: "Solve complex optimization problems with confidence using DP patterns and structured reasoning.",
    description:
      "This unpublished live course is focused on dynamic programming and optimization-heavy interview problems. It is a strong choice for developers preparing for advanced technical interviews or algorithmic product roles.",
    category: "Data Structure & Algorithms",
    level: "Advanced",
    durationHours: 28,
    price: 15999,
    featured: false,
    isPublished: false,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "DP Specialist",
    previewLectureUrl: "https://www.youtube.com/watch?v=H1v7xg1X9lY",
    modules: [
      {
        title: "DP foundations",
        description: "Learn state definition, recurrence, and optimization patterns for complex workloads.",
        lectures: [
          { title: "Understanding DP state", isPreview: true },
          { title: "Memoization and tabulation", isPreview: false },
          { title: "Classic DP patterns", isPreview: false },
        ],
      },
      {
        title: "Hard optimization problems",
        description: "Practice advanced problem layouts and teach your reasoning clearly.",
        lectures: [
          { title: "Knapsack and partition problems", isPreview: false },
          { title: "Grid DP and path counting", isPreview: false },
          { title: "Live problem-solving session", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "product-management-strategy-accelerator",
    title: "Product Management Strategy Accelerator",
    shortDescription: "Translate customer insight, roadmap thinking, and business analysis into confident product decisions.",
    description:
      "This premium live course is designed for product managers and aspiring PMs who want to combine user research, prioritization, analytics, and execution strategy. You will work through product frameworks used by strong teams to move from insight to impact.",
    category: "Product Management",
    level: "Intermediate",
    durationHours: 24,
    price: 17999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Sushanta Kumar",
    instructorTitle: "Director",
    previewLectureUrl: "https://www.youtube.com/watch?v=4u7iM3mUg0I",
    modules: [
      {
        title: "Product thinking and strategy",
        description: "Learn how to frame problems, define outcomes, and prioritize decisions with business context.",
        lectures: [
          { title: "Product strategy essentials", isPreview: true },
          { title: "Roadmaps and prioritization", isPreview: false },
          { title: "Outcome-based decision making", isPreview: false },
        ],
      },
      {
        title: "Research and market positioning",
        description: "Turn customer insight into product decisions and compelling value propositions.",
        lectures: [
          { title: "Customer interviews and insight synthesis", isPreview: false },
          { title: "Market analysis and positioning", isPreview: false },
          { title: "Experimenting with PM frameworks", isPreview: false },
        ],
      },
      {
        title: "Execution and stakeholder alignment",
        description: "Drive product execution through clear communication, metrics, and cross-functional coordination.",
        lectures: [
          { title: "Metrics and product operations", isPreview: false },
          { title: "Stakeholder management", isPreview: false },
          { title: "Final product strategy workshop", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "machine-learning-engineer-track",
    title: "Machine Learning Engineer Track",
    shortDescription: "Build production-focused ML systems with modeling, deployment, and evaluation strategies.",
    description:
      "This premium live track is built for engineers who want to go from experimentation to deployment in machine learning. It covers model lifecycle, feature engineering, pipeline design, and operational decision-making for real systems.",
    category: "Machine Learning",
    level: "Advanced",
    durationHours: 36,
    price: 21999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Shrikant Swain",
    instructorTitle: "Architect",
    previewLectureUrl: "https://www.youtube.com/watch?v=yyd_xB6B7ZE",
    modules: [
      {
        title: "ML system fundamentals",
        description: "Understand the workflow from data to model performance and production deployment.",
        lectures: [
          { title: "Model lifecycle overview", isPreview: true },
          { title: "Feature engineering and data quality", isPreview: false },
          { title: "Model selection and benchmarking", isPreview: false },
        ],
      },
      {
        title: "Production ML pipelines",
        description: "Build robust modeling pipelines with monitoring, validation, and retraining strategies.",
        lectures: [
          { title: "Training and serving pipelines", isPreview: false },
          { title: "Drift and quality monitoring", isPreview: false },
          { title: "Model observability and rollback", isPreview: false },
        ],
      },
      {
        title: "Real-world ML architecture",
        description: "Assess trade-offs, governance, and operational checks for production ML solutions.",
        lectures: [
          { title: "Production architecture workshop", isPreview: false },
          { title: "ML governance and model risk", isPreview: false },
          { title: "Final decision review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "data-science-ai-bootcamp",
    title: "Data Science & AI Bootcamp",
    shortDescription: "Combine statistical thinking, experimentation, and AI workflows to solve real business problems.",
    description:
      "This premium live bootcamp is built for professionals who want a complete data science and AI toolkit. You will work across analytics, modeling, experimentation, and practical AI use cases with a business-first mindset.",
    category: "Data Science",
    level: "Advanced",
    durationHours: 34,
    price: 22999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Shrikant Swain",
    instructorTitle: "Architect",
    previewLectureUrl: "https://www.youtube.com/watch?v=iq1s2Z1LbbI",
    modules: [
      {
        title: "Statistics and modeling foundations",
        description: "Learn the core statistical and modeling concepts used in data science projects.",
        lectures: [
          { title: "Probability, variance, and distributions", isPreview: true },
          { title: "Hypothesis testing and significance", isPreview: false },
          { title: "Model evaluation fundamentals", isPreview: false },
        ],
      },
      {
        title: "Applied data science workflows",
        description: "Create end-to-end workflows for analysis, prediction, and AI-enabled decision support.",
        lectures: [
          { title: "Feature engineering and model design", isPreview: false },
          { title: "Model training and validation", isPreview: false },
          { title: "Business interpretation of results", isPreview: false },
        ],
      },
      {
        title: "Decision-ready AI and insights",
        description: "Turn model output into strategy and product decisions that stakeholders can use.",
        lectures: [
          { title: "AI-powered recommendation patterns", isPreview: false },
          { title: "Business decision frameworks", isPreview: false },
          { title: "Final capstone for data teams", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "frontend-specialization-react-ui-systems",
    title: "Frontend Specialization: React & UI Systems",
    shortDescription: "Master scalable frontend architecture, design systems, and product-grade user experiences.",
    description:
      "This premium recorded specialization is tailored for frontend engineers who want to move from coding screens to designing robust product systems. You will work through component architecture, state patterns, UX, and performance thinking.",
    category: "Frontend Development",
    level: "Advanced",
    durationHours: 30,
    price: 19999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Abhishek Kumar Singh",
    instructorTitle: "Lead",
    previewLectureUrl: "https://www.youtube.com/watch?v=K8c5pHzrT9E",
    modules: [
      {
        title: "Component systems and architecture",
        description: "Design reusable frontend patterns for performance, maintainability, and user clarity.",
        lectures: [
          { title: "Design systems and interface thinking", isPreview: true },
          { title: "Reusable component patterns", isPreview: false },
          { title: "State and composition strategy", isPreview: false },
        ],
      },
      {
        title: "High-quality user experience",
        description: "Apply accessibility, responsiveness, and interaction quality to product flows.",
        lectures: [
          { title: "Accessibility and UI polish", isPreview: false },
          { title: "Performance and rendering issues", isPreview: false },
          { title: "Micro-interactions and design decisions", isPreview: false },
        ],
      },
      {
        title: "Portfolio-ready frontend delivery",
        description: "Package your work for production and stakeholder review with polished implementation patterns.",
        lectures: [
          { title: "Frontend production checklist", isPreview: false },
          { title: "Code review and refactoring", isPreview: false },
          { title: "Capstone UI system build", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "backend-engineering-systems-track",
    title: "Backend Engineering Systems Track",
    shortDescription: "Design backend services with APIs, architecture decisions, resilience, and practical scaling flows.",
    description:
      "This premium recorded track helps backend engineers build reliable, maintainable systems using service design, API thinking, and production best practices. It is a strong path for those moving into senior backend roles.",
    category: "Backend Development",
    level: "Advanced",
    durationHours: 32,
    price: 20999,
    featured: true,
    isPublished: true,
    isLive: false,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Shobhag Kumar Prajapat",
    instructorTitle: "Sr. Software Engineer",
    previewLectureUrl: "https://www.youtube.com/watch?v=F3W0m_Xm7p0",
    modules: [
      {
        title: "System design for backend engineers",
        description: "Understand service boundaries, contracts, and architecture trade-offs in real products.",
        lectures: [
          { title: "Service design fundamentals", isPreview: true },
          { title: "API contracts and boundaries", isPreview: false },
          { title: "Data access and caching", isPreview: false },
        ],
      },
      {
        title: "Reliability and resilience",
        description: "Use retries, failover, observability, and timeouts to build dependable services.",
        lectures: [
          { title: "Resilience patterns", isPreview: false },
          { title: "Monitoring and tracing", isPreview: false },
          { title: "Operational readiness", isPreview: false },
        ],
      },
      {
        title: "Backend production systems",
        description: "Prepare your backend implementation for scale, team collaboration, and monitoring.",
        lectures: [
          { title: "High-scale system thinking", isPreview: false },
          { title: "Queue and async workflows", isPreview: false },
          { title: "Final architecture review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "advanced-backend-scaling-engineering",
    title: "Advanced Backend Scaling Engineering",
    shortDescription: "Handle scaling decisions, API performance, and resilient architecture for production-grade systems.",
    description:
      "This premium live course is designed for senior and lead backend engineers who want to sharpen system scaling judgment. It covers sharding, queueing, data consistency, and platform architecture decisions used in production teams.",
    category: "Backend Development",
    level: "Advanced",
    durationHours: 35,
    price: 23999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vikash Singh",
    instructorTitle: "Sr. Software Engineer",
    previewLectureUrl: "https://www.youtube.com/watch?v=Z5QvH7eY0UA",
    modules: [
      {
        title: "Scale-aware architecture",
        description: "Learn to reason through throughput, latency, concurrency, and failure patterns.",
        lectures: [
          { title: "Scalability fundamentals", isPreview: true },
          { title: "Concurrency and queueing", isPreview: false },
          { title: "Caching and request flow", isPreview: false },
        ],
      },
      {
        title: "Production resilience",
        description: "Build graceful degradation paths and support system reliability even under load.",
        lectures: [
          { title: "Fallbacks and retry design", isPreview: false },
          { title: "Observability and alerts", isPreview: false },
          { title: "Incident response workflows", isPreview: false },
        ],
      },
      {
        title: "Architecture review lab",
        description: "Evaluate a production system for bottlenecks, scale, and supportability.",
        lectures: [
          { title: "Architecture review exercise", isPreview: false },
          { title: "Decision trade-offs and risk", isPreview: false },
          { title: "Final strategy workshop", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "data-analytics-ai-specialist-track",
    title: "Data Analytics & AI Specialist Track",
    shortDescription: "Blend analytics, AI workflows, and business problem solving for modern data-driven roles.",
    description:
      "This premium career-track course brings together analytics fundamentals, AI-assisted decision making, and business-ready communication. It is designed for professionals who want to move into analytics and AI specialist roles with real execution depth.",
    category: "Data Analytics",
    level: "Advanced",
    durationHours: 33,
    price: 21999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Vishwajeet Singh",
    instructorTitle: "Data Analytics & AI Specialist (Sr. Software Engineer)",
    previewLectureUrl: "https://www.youtube.com/watch?v=TobtxB3d0T8",
    modules: [
      {
        title: "Analytics to AI integration",
        description: "Use business analysis and AI-powered workflows to support modern data decision making.",
        lectures: [
          { title: "Analytics foundations and business metrics", isPreview: true },
          { title: "AI-assisted problem solving", isPreview: false },
          { title: "Decision support with evidence", isPreview: false },
        ],
      },
      {
        title: "Data storytelling and execution",
        description: "Translate technical insights into practical change across teams and stakeholders.",
        lectures: [
          { title: "Dashboard story arcs", isPreview: false },
          { title: "AI use cases for analysis", isPreview: false },
          { title: "Executive communication patterns", isPreview: false },
        ],
      },
      {
        title: "Career-level capstone",
        description: "Combine analysis and AI strategy to design a complete business-ready project.",
        lectures: [
          { title: "Capstone brief and scoping", isPreview: false },
          { title: "Build the final analytics workflow", isPreview: false },
          { title: "Final presentation and critique", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "ai-leadership-executive-track",
    title: "AI Leadership Executive Track",
    shortDescription: "Lead AI transformation with governance, strategy, investment thinking, and scalable execution plans.",
    description:
      "This enterprise-grade leadership program helps founders, product leaders, and executives navigate AI transformation with a strategic lens. You will learn how to prioritize use cases, create governance models, measure value, and drive adoption responsibly across teams.",
    category: "AI Leadership",
    level: "Advanced",
    durationHours: 28,
    price: 24999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Sushanta Kumar",
    instructorTitle: "Director",
    previewLectureUrl: "https://www.youtube.com/watch?v=62yDEI0KfZ8",
    modules: [
      {
        title: "AI strategy and operating model",
        description: "Learn how to align AI investments with business priorities and operating realities.",
        lectures: [
          { title: "AI vision and business case", isPreview: true },
          { title: "Portfolio prioritization", isPreview: false },
          { title: "Capability mapping and org design", isPreview: false },
        ],
      },
      {
        title: "Governance and risk",
        description: "Design policies, trust standards, and control points for safe enterprise AI adoption.",
        lectures: [
          { title: "Responsible AI governance", isPreview: false },
          { title: "Risk, privacy, and compliance", isPreview: false },
          { title: "Measuring adoption and value", isPreview: false },
        ],
      },
      {
        title: "Executive decision lab",
        description: "Build an AI roadmap and executive narrative with realistic trade-offs and decision frameworks.",
        lectures: [
          { title: "AI roadmap workshop", isPreview: false },
          { title: "Stakeholder alignment playbook", isPreview: false },
          { title: "Final board-ready strategy review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "mlops-ai-platform-engineering",
    title: "MLOps & AI Platform Engineering",
    shortDescription: "Turn ML experimentation into secure, scalable, production-grade AI systems and platform operations.",
    description:
      "This enterprise MLOps program helps engineers and platform teams build reliable AI systems with deployment pipelines, monitoring, hardening, and governance. It covers how to productize model delivery at scale while keeping systems maintainable and accountable.",
    category: "MLOps",
    level: "Advanced",
    durationHours: 38,
    price: 26999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Shrikant Swain",
    instructorTitle: "Architect",
    previewLectureUrl: "https://www.youtube.com/watch?v=4yCVAw7mLJk",
    modules: [
      {
        title: "MLOps foundations",
        description: "Understand the platform workflows that move AI from experimentation to stable delivery.",
        lectures: [
          { title: "Machine learning lifecycle", isPreview: true },
          { title: "Pipelines, models, and release design", isPreview: false },
          { title: "CI/CD for ML systems", isPreview: false },
        ],
      },
      {
        title: "Reliability and monitoring",
        description: "Create robust quality gates, observability, and fallback patterns for production AI systems.",
        lectures: [
          { title: "Model monitoring and drift", isPreview: false },
          { title: "Tracing and failure response", isPreview: false },
          { title: "Guardrails and rollback patterns", isPreview: false },
        ],
      },
      {
        title: "Enterprise AI platform blueprint",
        description: "Design an enterprise-ready platform architecture with cost, risk, and governance in mind.",
        lectures: [
          { title: "Platform blueprint workshop", isPreview: false },
          { title: "Governance controls and access", isPreview: false },
          { title: "Final enterprise architecture review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "product-analytics-experimentation-masterclass",
    title: "Product Analytics & Experimentation Masterclass",
    shortDescription: "Measure product value, run experiments, and price decisions with analytical discipline and product insight.",
    description:
      "This enterprise program is built for product, growth, and analytics leaders who want to create a rigorous experimentation culture. It blends product analytics, customer behavior analysis, cohort work, and evidence-led decision making.",
    category: "Product Analytics",
    level: "Advanced",
    durationHours: 30,
    price: 23999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Sushanta Kumar",
    instructorTitle: "Director",
    previewLectureUrl: "https://www.youtube.com/watch?v=Qk2d0JwQ19o",
    modules: [
      {
        title: "Product metrics and signal design",
        description: "Learn how to design the right metrics and interpret behavior across the product journey.",
        lectures: [
          { title: "North star and KPI design", isPreview: true },
          { title: "Cohorts, funnels, and retention", isPreview: false },
          { title: "Behavior analytics and user journeys", isPreview: false },
        ],
      },
      {
        title: "Experimentation discipline",
        description: "Plan and run high-confidence experiments with valid analysis and business interpretation.",
        lectures: [
          { title: "A/B testing fundamentals", isPreview: false },
          { title: "Sample size and decision thresholds", isPreview: false },
          { title: "Risk, bias, and reporting", isPreview: false },
        ],
      },
      {
        title: "Executive product analytics lab",
        description: "Turn experiment insights into product strategy and roadmap decisions for growth teams.",
        lectures: [
          { title: "Experiment review workshop", isPreview: false },
          { title: "Roadmap and investment decisions", isPreview: false },
          { title: "Final executive case review", isPreview: false },
        ],
      },
    ],
  },
  {
    slug: "senior-fullstack-architecture-pathway",
    title: "Senior Full-Stack Architecture Pathway",
    shortDescription: "Move into senior product engineering with end-to-end system design, platform thinking, and delivery leadership.",
    description:
      "This enterprise pathway prepares engineers for senior full-stack ownership across architecture, delivery, reliability, and cross-functional communication. It blends frontend strength, backend reasoning, deployment strategy, and leadership accountability.",
    category: "Senior Full-Stack",
    level: "Advanced",
    durationHours: 40,
    price: 27999,
    featured: true,
    isPublished: true,
    isLive: true,
    language: "en",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Abhishek Kumar Singh",
    instructorTitle: "Lead",
    previewLectureUrl: "https://www.youtube.com/watch?v=5d7jB9Lr8ho",
    modules: [
      {
        title: "Senior engineering foundations",
        description: "Understand how strong senior engineers balance product goals, code quality, and delivery decisions.",
        lectures: [
          { title: "Senior technical judgment", isPreview: true },
          { title: "System decomposition and product flow", isPreview: false },
          { title: "Leading resilient architecture decisions", isPreview: false },
        ],
      },
      {
        title: "Frontend and backend integration",
        description: "Build connected and scalable product layers across the full application stack.",
        lectures: [
          { title: "Architectural integration patterns", isPreview: false },
          { title: "API design and client contracts", isPreview: false },
          { title: "Deployment strategy and quality gates", isPreview: false },
        ],
      },
      {
        title: "Engineering leadership lab",
        description: "Practice trade-off evaluation, stakeholder communication, and roadmap-driven execution.",
        lectures: [
          { title: "Technical leadership scenarios", isPreview: false },
          { title: "Review and risk management", isPreview: false },
          { title: "Final senior architecture presentation", isPreview: false },
        ],
      },
    ],
  },
];

function buildCoursePayload(course: (typeof courseCatalog)[number]) {
  return {
    ...course,
    modules: {
      create: course.modules.map((module, moduleIndex) => ({
        title: module.title,
        description: module.description,
        position: moduleIndex + 1,
        lectures: {
          create: module.lectures.map((lecture, lectureIndex) => ({
            title: lecture.title,
            description: lecture.title,
            position: lectureIndex + 1,
            isPreview: lecture.isPreview,
            hlsUrl: `https://example.com/hls/${course.slug}-${lectureIndex + 1}.m3u8`,
            videoUrl: `https://example.com/videos/${course.slug}-${lectureIndex + 1}.mp4`,
          })),
        },
      })),
    },
  };
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "student@cognive.academy" },
    update: {
      name: "Vishwajeet Singh",
      passwordHash,
      role: "STUDENT",
    },
    create: {
      email: "student@cognive.academy",
      name: "Vishwajeet Singh",
      passwordHash,
      role: "STUDENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@cognive.academy" },
    update: {
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: "admin@cognive.academy",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const course of courseCatalog) {
    const { modules: _modules, ...courseFields } = course;

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        ...courseFields,
      },
      create: buildCoursePayload(course),
    });
  }

  const featuredPublishedCourse = await prisma.course.findFirst({
    where: { isPublished: true, isLive: true },
    orderBy: { createdAt: "asc" },
  });

  if (featuredPublishedCourse) {
    const student = await prisma.user.findUnique({ where: { email: "student@cognive.academy" } });
    if (student) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: featuredPublishedCourse.id,
          },
        },
        update: {},
        create: {
          userId: student.id,
          courseId: featuredPublishedCourse.id,
          accessGranted: true,
        },
      });
    }
  }

  console.log(`Seeded ${courseCatalog.length} courses successfully`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
