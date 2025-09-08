# Lexicon 📝

Lexicon is a modern, Notion-inspired note-taking and workspace management application built with Next.js.

Create, organize, and collaborate on your notes and workspaces with ease.

---

## ✨ Features

- 📋 **Rich Note Editor** – Powerful, intuitive editor for creating and formatting notes
- 🏢 **Workspace Management** – Organize content into multiple workspaces
- 📁 **Hierarchical Organization** – Structure notes with folders and categories
- 🔍 **Search & Filter** – Quickly find your content with advanced search
- 🎨 **Clean Interface** – Minimal and responsive UI for optimal user experience
- ⚡ **Real-time Updates** – Automatic synchronization across all devices
- 🔒 **Secure by Default** – Authentication and data protection with modern practices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Package manager: npm, yarn, pnpm, or bun

### Installation

Clone the repository:

```bash
git clone https://github.com/peterdinis/Lexicon.git
cd Lexicon

npm install
# or
yarn install
# or
pnpm install
# or
bun install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

🛠️ Tech Stack

Framework: Next.js 14 – React framework for production

Styling: Tailwind CSS – Utility-first styling

Typography: Ubuntu font

Backend & Database: Convex – Serverless backend and real-time database for storing notes, folders, and workspaces

Authentication: Clerk – Complete user management (sign-in, sign-up, sessions, profiles)

🔧 Development
Available Scripts

pnpm run dev – Start development server (Next.js + Convex)

pnpm run convex – Run Convex backend locally

pnpm run build – Build for production

pnpm run start – Start production server

pnpm run lint – Run ESLint

Environment Variables

Create a .env.local file in the project root:

# Convex (Backend & Database)
CONVEX_DEPLOYMENT="your_convex_deployment_url"

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

Running Convex locally

Install the Convex CLI:

npm install -g convex


Log in and link your project:

npx convex dev


The Convex dev server will run alongside Next.js and automatically sync schema + functions.

Setting up Clerk

Create a Clerk project at clerk.com

Copy your Publishable Key and Secret Key into .env.local

Wrap your app in <ClerkProvider> (already configured in Lexicon)

🚢 Deployment

The easiest way to deploy Lexicon is via Vercel:

Push your code to GitHub

Import the repository into Vercel

Add your Convex + Clerk environment variables

Deploy 🎉