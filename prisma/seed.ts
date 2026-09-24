import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const student = await prisma.user.upsert({
    where: { email: "student@cognive.academy" },
    update: {},
    create: {
      email: "student@cognive.academy",
      name: "Aanya Sharma",
      passwordHash,
      role: "STUDENT",
    },
  });

  const courses = [
    {
      slug: "python-for-data-tasks",
      title: "Python for Data Tasks",
      shortDescription: "Use Python to automate analysis and work with datasets efficiently.",
      description: "Covers Python data structures, pandas, analytics automation, and practical examples for learning teams.",
      category: "Python",
      level: "Beginner",
      durationHours: 22,
      price: 5499,
      featured: false,
      imageUrl: "/images/python.jpg",
      instructorName: "Manav Shah",
      instructorTitle: "Automation Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Python Essentials",
            description: "Learn Python for data operations and automation.",
            position: 1,
            lectures: {
              create: [
                { title: "Python syntax and workflow", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/python-intro.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "sql-for-analytics",
      title: "SQL for Analytics",
      shortDescription: "Query data, build reports, and analyze business metrics with confidence.",
      description: "A practical learning path for writing effective SQL, joining tables, and solving real analytical questions.",
      category: "SQL",
      level: "Beginner",
      durationHours: 18,
      price: 4999,
      featured: true,
      imageUrl: "/images/sql.jpg",
      instructorName: "Ritika Mehta",
      instructorTitle: "Senior Data Analyst",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "SQL Foundations",
            description: "Learn SELECT, WHERE, ORDER BY, and filters.",
            position: 1,
            lectures: {
              create: [
                { title: "Intro to SQL", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/sql-intro.m3u8" },
                { title: "Filtering and sorting", position: 2, hlsUrl: "https://example.com/hls/sql-filter.m3u8" },
              ],
            },
          },
          {
            title: "Data Relationships",
            description: "Master joins, grouping, and aggregation.",
            position: 2,
            lectures: {
              create: [
                { title: "Joins and relationships", position: 1, hlsUrl: "https://example.com/hls/sql-joins.m3u8" },
                { title: "GROUP BY and aggregates", position: 2, hlsUrl: "https://example.com/hls/sql-groupby.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "django-for-backend-development",
      title: "Django for Backend Development",
      shortDescription: "Create secure, scalable backend systems with Django and Python.",
      description: "Strengthen your backend skills with Django models, views, auth, and API-driven web applications.",
      category: "Django",
      level: "Intermediate",
      durationHours: 26,
      price: 7499,
      featured: false,
      imageUrl: "/images/django.jpg",
      instructorName: "Sahil Verma",
      instructorTitle: "Backend Architect",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Django Foundations",
            description: "Learn project setup, routing, and database models.",
            position: 1,
            lectures: {
              create: [
                { title: "Django setup and app flow", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/django-intro.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "react-for-frontend-development",
      title: "React for Frontend Development",
      shortDescription: "Build interactive interfaces and scalable UI experiences with React.",
      description: "Learn component architecture, state management, hooks, and production-ready frontend patterns in React.",
      category: "React",
      level: "Intermediate",
      durationHours: 24,
      price: 6999,
      featured: false,
      imageUrl: "/images/react.jpg",
      instructorName: "Priya Nair",
      instructorTitle: "Frontend Engineer",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "React Fundamentals",
            description: "Build components, props, and reusable UI.",
            position: 1,
            lectures: {
              create: [
                { title: "Introduction to React", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/react-intro.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "power-bi-dashboarding",
      title: "Power BI Dashboarding",
      shortDescription: "Turn raw data into story-driven dashboards and insights.",
      description: "Master data modeling, dashboard design, and KPI storytelling for business intelligence roles.",
      category: "Power BI",
      level: "Intermediate",
      durationHours: 20,
      price: 5999,
      featured: true,
      imageUrl: "/images/pbi.jpg",
      instructorName: "Nikhil Joshi",
      instructorTitle: "BI Consultant",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Power BI Basics",
            description: "Connect data and build your first report.",
            position: 1,
            lectures: {
              create: [
                { title: "Import data and model", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/pbi-import.m3u8" },
              ],
            },
          },
        ],
      },
    },
    {
      slug: "excel-for-business-analysis",
      title: "Excel for Business Analysis",
      shortDescription: "Analyze data, create reports, and automate everyday business tasks in Excel.",
      description: "Cover formulas, PivotTables, dashboards, and business reporting workflows that make Excel a daily data tool.",
      category: "Excel",
      level: "Beginner",
      durationHours: 16,
      price: 3999,
      featured: false,
      imageUrl: "/images/excel.jpg",
      instructorName: "Ananya Kulkarni",
      instructorTitle: "Business Analyst",
      previewLectureUrl: "https://example.com/preview",
      modules: {
        create: [
          {
            title: "Excel Essentials",
            description: "Learn formulas, formatting, and analysis workflows.",
            position: 1,
            lectures: {
              create: [
                { title: "Excel basics and workbook setup", position: 1, isPreview: true, hlsUrl: "https://example.com/hls/excel-intro.m3u8" },
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
