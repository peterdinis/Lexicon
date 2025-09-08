# Lexicon 📝

A modern, Notion-inspired note-taking and workspace management application built with Next.js. Create, organize, and manage your notes and workspaces with ease.

![Lexicon Banner](https://via.placeholder.com/800x200/2D3748/FFFFFF?text=Lexicon+-+Your+Digital+Workspace)

## ✨ Features

- **📋 Rich Note Editor**: Create and edit notes with a powerful, intuitive editor
- **🏢 Workspace Management**: Organize your content into separate workspaces
- **📁 Hierarchical Organization**: Structure your notes with folders and categories
- **🔍 Search & Filter**: Quickly find your content with advanced search capabilities
- **🎨 Clean Interface**: Modern, responsive design for optimal user experience
- **⚡ Real-time Updates**: Instant synchronization across all your devices
- **🔒 Secure**: Your data is protected with modern security practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/peterdinis/Lexicon.git
   cd Lexicon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) - React framework for production
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Typography**: Ubuntu
- **Database**: Clerk
- **Authentication**: Clerk

## 🔧 Development

### Available Scripts

- `pnpm run dev` - Start development server (runs both Next.js and Convex)
- `pnpm run convex` - Start Convex development environment
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your_database_url"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Additional environment variables...
```

## 🚢 Deployment

The easiest way to deploy Lexicon is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

For other deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).


## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for hosting and font optimization
- [Notion](https://notion.so/) for the inspiration
- All contributors who help improve this project

## 📞 Support

If you have any questions or need help, please:

- 🐛 [Open an issue](https://github.com/peterdinis/Lexicon/issues) for bug reports
- 💡 [Start a discussion](https://github.com/peterdinis/Lexicon/discussions) for feature requests
- 📧 Contact the maintainer: [your-email@example.com]

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/peterdinis">Peter Dinis</a></strong>
</div>