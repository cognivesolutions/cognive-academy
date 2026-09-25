# Cognive Academy

Cognive Academy is a Next.js learning platform for online courses, live classes, student dashboards, and payment-enabled enrollment flows. The app combines a modern course catalog, authentication, course discovery, student account management, and Prisma-backed persistence.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth credentials authentication
- Razorpay checkout integration

## Features

- Course landing page with featured programs, filters, and search
- Live and recorded course sections
- Student login and signup flow
- Dashboard for enrolled courses and recent transactions
- Prisma data model for users, courses, modules, lectures, orders, and enrollments
- Razorpay order creation and payment callback handling

## Project structure

```bash
.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── auth.ts
│   ├── components/
│   ├── config/
│   ├── data/
│   ├── lib/
│   └── types/
├── .env
├── .gitignore
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL database
- Razorpay account credentials (for payments)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

If you do not have a .env.example file yet, create a `.env` file with the values below.

3. Configure environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cognive_academy?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

4. Generate Prisma client and apply schema:

```bash
npx prisma generate
npx prisma db push
```

Optional: seed the database if seeded data is needed:

```bash
npx prisma db seed
```

5. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Available scripts

```bash
npm run dev         # start the Next.js dev server
npm run build       # generate Prisma client and build the app
npm run start       # start the production server
npm run lint        # run ESLint
npm run generate:favicons  # generate app favicons
```

## Database notes

The Prisma schema defines the core application entities:

- `User`
- `Course`
- `Module`
- `Lecture`
- `Order`
- `Enrollment`

These are configured in [prisma/schema.prisma](prisma/schema.prisma).

## Deployment

This project is ready to deploy to a Node-compatible host such as Vercel or a custom VPS. For production deployments, make sure all environment variables are set in your hosting provider and that your PostgreSQL database is reachable from the deployment environment.

## Notes

- [.gitignore](.gitignore) ignores generated Next.js build artifacts and local environment files.
- [.next](.next) is generated automatically and can be safely removed during cleanup or troubleshooting.
- If you change the Prisma schema, run `npx prisma generate` and apply migrations or push the schema to your database.
