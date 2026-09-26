import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const student = await prisma.user.upsert({
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

  const admin = await prisma.user.upsert({
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

  const courses = [
    {
      slug: "python-live-english",
      title: "Python for Data & Automation",
      shortDescription: "Learn Python from scratch with real business use cases, automation, and analytics workflows.",
      description: "This live cohort focuses on core Python concepts, data handling, automation patterns, and practical business problem solving. You will work on exercises that mirror real-world reporting, scripting, and data tasks.",
      category: "Python",
      level: "Beginner",
      durationHours: 24,
      price: 7999,
      featured: true,
      isLive: true,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Python Foundations",
            description: "Build a strong base in Python syntax, variables, functions, and logic.",
            position: 1,
            lectures: {
              create: [
                { title: "Python overview and setup", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/python-live-1.m3u8" },
                { title: "Control flow and functions", position: 2, hlsUrl: "https://example.com/hls/python-live-2.m3u8" },
              ],
            },
          },
          {
            title: "Working with Data",
            description: "Use Python to process files, clean data, and automate repetitive analysis tasks.",
            position: 2,
            lectures: {
              create: [
                { title: "Lists, loops, and dictionaries", position: 1, hlsUrl: "https://example.com/hls/python-live-3.m3u8" },
                { title: "Data cleaning and automation", position: 2, hlsUrl: "https://example.com/hls/python-live-4.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "sql-live-english",
      title: "SQL for Business Analytics",
      shortDescription: "Master SQL joins, filtering, aggregation, and reporting queries for data roles.",
      description: "This live program helps you learn SQL as a practical analytical skill. You will work with joins, grouped queries, business reporting patterns, and database logic used in real data projects.",
      category: "SQL",
      level: "Beginner",
      durationHours: 22,
      price: 7499,
      featured: true,
      isLive: true,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "SQL Essentials",
            description: "Understand tables, queries, filters, and data retrieval basics.",
            position: 1,
            lectures: {
              create: [
                { title: "SELECT, WHERE, and sorting", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/sql-live-1.m3u8" },
                { title: "Functions and expressions", position: 2, hlsUrl: "https://example.com/hls/sql-live-2.m3u8" },
              ],
            },
          },
          {
            title: "Analytics with SQL",
            description: "Combine grouped metrics, filters, and multi-table analysis for actionable insights.",
            position: 2,
            lectures: {
              create: [
                { title: "Joins and unions", position: 1, hlsUrl: "https://example.com/hls/sql-live-3.m3u8" },
                { title: "Reporting with aggregates", position: 2, hlsUrl: "https://example.com/hls/sql-live-4.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "power-bi-live-english",
      title: "Power BI Dashboarding Masterclass",
      shortDescription: "Build impactful dashboards using data modeling, measures, and storytelling for business decisions.",
      description: "Learn how to turn raw data into polished decision-making dashboards. This live session covers Power BI modeling, DAX fundamentals, KPI design, and dashboard presentation techniques used in professional analytics teams.",
      category: "Power BI",
      level: "Intermediate",
      durationHours: 26,
      price: 8999,
      featured: true,
      isLive: true,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Power BI Foundations",
            description: "Connect to data sources and shape a clean analytical model.",
            position: 1,
            lectures: {
              create: [
                { title: "Importing and cleaning data", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/pbi-live-1.m3u8" },
                { title: "Data modeling basics", position: 2, hlsUrl: "https://example.com/hls/pbi-live-2.m3u8" },
              ],
            },
          },
          {
            title: "Dashboard Design & DAX",
            description: "Build business-friendly dashboards with visuals, measures, and storytelling logic.",
            position: 2,
            lectures: {
              create: [
                { title: "Calculated columns and measures", position: 1, hlsUrl: "https://example.com/hls/pbi-live-3.m3u8" },
                { title: "Dashboard storytelling", position: 2, hlsUrl: "https://example.com/hls/pbi-live-4.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "gen-ai-live-english",
      title: "Generative AI for Modern Workflows",
      shortDescription: "Use Gen AI tools to automate tasks, create workflows, and boost productivity with practical usage.",
      description: "This live class helps you understand the real-world application of generative AI in everyday work. You will explore prompt design, AI-assisted workflows, productivity automation, and safe usage patterns for business and technical tasks.",
      category: "Gen AI",
      level: "Beginner",
      durationHours: 20,
      price: 8499,
      featured: false,
      isLive: true,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Gen AI Foundations",
            description: "Learn how AI models work and where they add value in practical workflows.",
            position: 1,
            lectures: {
              create: [
                { title: "What is Gen AI and where it fits", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/genai-live-1.m3u8" },
                { title: "Designing prompts for real work", position: 2, hlsUrl: "https://example.com/hls/genai-live-2.m3u8" },
              ],
            },
          },
          {
            title: "AI Workflows & Productivity",
            description: "Build automation and content-driven workflows that improve speed and quality.",
            position: 2,
            lectures: {
              create: [
                { title: "AI-created content and automation", position: 1, hlsUrl: "https://example.com/hls/genai-live-3.m3u8" },
                { title: "Responsible AI usage", position: 2, hlsUrl: "https://example.com/hls/genai-live-4.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "git-live-hindi",
      title: "Git & Version Control in Hindi",
      shortDescription: "Understand Git workflows, branching, collaboration, and project hygiene in a practical Hindi session.",
      description: "This Hindi live workshop covers the essential Git workflow used in tech teams—commit history, branching, merging, pull requests, and collaboration practices that make projects manageable.",
      category: "Git",
      level: "Beginner",
      durationHours: 18,
      price: 6999,
      featured: false,
      isLive: true,
      language: "hi",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Git Basics",
            description: "Learn commit, branch, merge, and revert concepts in a team-friendly workflow.",
            position: 1,
            lectures: {
              create: [
                { title: "Git ka basics", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/git-hi-1.m3u8" },
                { title: "Branching aur merging", position: 2, hlsUrl: "https://example.com/hls/git-hi-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "devops-live-hindi",
      title: "DevOps Essentials in Hindi",
      shortDescription: "Learn DevOps foundations, deployment flow, CI/CD basics, and delivery practices in Hindi.",
      description: "This live Hindi course introduces the essential DevOps mindset, CI/CD pipelines, infrastructure basics, and deployment principles so learners can understand production workflows more clearly.",
      category: "DevOps",
      level: "Intermediate",
      durationHours: 24,
      price: 8999,
      featured: false,
      isLive: true,
      language: "hi",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "DevOps Overview",
            description: "Understand the pipeline between code, deployment, automation, and monitoring.",
            position: 1,
            lectures: {
              create: [
                { title: "DevOps overview and workflow", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/devops-hi-1.m3u8" },
                { title: "CI/CD basics", position: 2, hlsUrl: "https://example.com/hls/devops-hi-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "python-beginner-recorded-english",
      title: "Python for Beginner",
      shortDescription: "Start with Python basics and practical exercises designed for beginners in a self-paced format.",
      description: "This beginner-friendly recorded course introduces Python syntax, problem solving, scripting basics, and real-world examples so you can build confidence before moving to projects or advanced learning.",
      category: "Python",
      level: "Beginner",
      durationHours: 18,
      price: 4999,
      featured: false,
      isLive: false,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Beginner Python",
            description: "Work through syntax, variables, loops, and function-building fundamentals.",
            position: 1,
            lectures: {
              create: [
                { title: "Python at a glance", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/python-beginner-1.m3u8" },
                { title: "Hands-on beginner exercises", position: 2, hlsUrl: "https://example.com/hls/python-beginner-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "sql-beginner-recorded-english",
      title: "SQL for Beginner",
      shortDescription: "Learn SQL fundamentals with filtering, grouping, and data retrieval in a beginner-friendly format.",
      description: "This recorded course introduces SQL basics with practical examples, focusing on queries, table structure, joins, and reporting logic used in data analysis work.",
      category: "SQL",
      level: "Beginner",
      durationHours: 16,
      price: 4499,
      featured: false,
      isLive: false,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "SQL Fundamentals",
            description: "Explore tables, joins, filters, and the core SQL query lifecycle.",
            position: 1,
            lectures: {
              create: [
                { title: "Database basics and SELECT", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/sql-beginner-1.m3u8" },
                { title: "WHERE, GROUP BY, and ORDER BY", position: 2, hlsUrl: "https://example.com/hls/sql-beginner-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "excel-beginner-recorded-english",
      title: "Excel for Beginner",
      shortDescription: "Build essential Excel workflows for formulas, charts, and business analysis tasks.",
      description: "This recorded course gives you a practical introduction to Excel spreadsheets, formulas, common analytical functions, charts, and reporting patterns used in business environments.",
      category: "Excel",
      level: "Beginner",
      durationHours: 15,
      price: 3999,
      featured: false,
      isLive: false,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Excel Essentials",
            description: "Cover basic formulas, tables, formatting, and business-use spreadsheet practices.",
            position: 1,
            lectures: {
              create: [
                { title: "Excel basics", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/excel-beginner-1.m3u8" },
                { title: "Charts and summaries", position: 2, hlsUrl: "https://example.com/hls/excel-beginner-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "power-bi-dashboarding-recorded-english",
      title: "Power BI for Dashboarding",
      shortDescription: "Develop dashboards and analytical reports using Power BI visual design and KPI thinking.",
      description: "This recorded course focuses on building business dashboards in Power BI, covering data transformation, visuals, DAX basics, and effective reporting layouts that support decisions.",
      category: "Power BI",
      level: "Intermediate",
      durationHours: 20,
      price: 6999,
      featured: true,
      isLive: false,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Dashboard Planning",
            description: "Understand business requirements and translate them into Power BI visuals.",
            position: 1,
            lectures: {
              create: [
                { title: "Dashboard design flow", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/pbi-recorded-1.m3u8" },
                { title: "Interactivity and KPI design", position: 2, hlsUrl: "https://example.com/hls/pbi-recorded-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "gen-ai-beginner-recorded-english",
      title: "Gen AI for Beginner",
      shortDescription: "Explore practical Gen AI usage for automation, prompt workflows, and productivity improvements.",
      description: "This recorded course introduces beginners to generative AI concepts, prompt engineering, AI-assisted thinking, and safe productivity use cases to help them build confidence quickly.",
      category: "Gen AI",
      level: "Beginner",
      durationHours: 17,
      price: 5999,
      featured: false,
      isLive: false,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Prompting Essentials",
            description: "Create better prompts, evaluate outputs, and apply Gen AI in real tasks.",
            position: 1,
            lectures: {
              create: [
                { title: "Gen AI in daily work", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/genai-recorded-1.m3u8" },
                { title: "Prompt design templates", position: 2, hlsUrl: "https://example.com/hls/genai-recorded-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "sql-advance-recorded-hindi",
      title: "SQL for Advance",
      shortDescription: "Go beyond beginner SQL with advanced joins, performance thinking, and analytical problem solving in Hindi.",
      description: "This Hindi recorded course focuses on advanced SQL concepts, complex queries, optimization mindset, and data analysis patterns required for real problem-solving and reporting responsibilities.",
      category: "SQL",
      level: "Advanced",
      durationHours: 22,
      price: 7299,
      featured: false,
      isLive: false,
      language: "hi",
      imageUrl: "https://images.unsplash.com/photo-1558494949cc3f4d17a2d2d1b7d8a7ff5?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Advanced SQL Queries",
            description: "Master advanced joins, subqueries, and analytical SQL techniques.",
            position: 1,
            lectures: {
              create: [
                { title: "Advanced joins", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/sql-advance-hi-1.m3u8" },
                { title: "Subqueries and window thinking", position: 2, hlsUrl: "https://example.com/hls/sql-advance-hi-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "python-advance-recorded-hindi",
      title: "Python for Advance",
      shortDescription: "Take Python skills to the next level with automation, functions, and real problem-solving in Hindi.",
      description: "This Hindi recorded course helps learners with advanced Python thinking, reusable code design, structured projects, and automation patterns used in modern business workflows.",
      category: "Python",
      level: "Advanced",
      durationHours: 24,
      price: 7999,
      featured: false,
      isLive: false,
      language: "hi",
      imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Advanced Python Patterns",
            description: "Focus on modular programming, logic design, and robust script development.",
            position: 1,
            lectures: {
              create: [
                { title: "Functions and reusable code", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/python-advance-hi-1.m3u8" },
                { title: "Automation patterns", position: 2, hlsUrl: "https://example.com/hls/python-advance-hi-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "gen-ai-advance-recorded-hindi",
      title: "Gen AI for Advance",
      shortDescription: "Understand advanced prompting, AI workflows, and responsible AI use in a Hindi recorded course.",
      description: "This advanced Hindi course helps learners think beyond basic prompting. It covers workflow design, automation opportunities, and practical ways to make AI useful in technical and business contexts.",
      category: "Gen AI",
      level: "Advanced",
      durationHours: 20,
      price: 7499,
      featured: false,
      isLive: false,
      language: "hi",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      instructorName: "Vishwajeet Singh",
      instructorTitle: "Sr. Software Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Advanced AI Workflow Design",
            description: "Create high-quality prompts and workflows for real business and technical productivity.",
            position: 1,
            lectures: {
              create: [
                { title: "Advanced prompting patterns", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/genai-advance-hi-1.m3u8" },
                { title: "AI workflows and implementation", position: 2, hlsUrl: "https://example.com/hls/genai-advance-hi-2.m3u8" },
              ],
            },
          },
        ],
      },
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: {
        ...course,
        price: course.price,
      },
    });
  }

  const firstCourse = await prisma.course.findUnique({ where: { slug: "sql-for-analytics" } });

  if (firstCourse) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: firstCourse.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: firstCourse.id,
        accessGranted: true,
      },
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
