"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash("password123", 10);
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
            slug: "power-bi-dashboarding",
            title: "Power BI Dashboarding",
            shortDescription: "Turn raw data into story-driven dashboards and insights.",
            description: "Master data modeling, dashboard design, and KPI storytelling for business intelligence roles.",
            category: "POWER_BI",
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
            slug: "python-for-data-tasks",
            title: "Python for Data Tasks",
            shortDescription: "Use Python to automate analysis and work with datasets efficiently.",
            description: "Covers Python data structures, pandas, analytics automation, and practical examples for learning teams.",
            category: "PYTHON",
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
