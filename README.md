# MusicWave - Modern Music Streaming Platform

A modern, responsive music streaming platform built with React, TypeScript, and Next.js. Features a beautiful UI powered by Shadcn UI and seamless music playback integration.

## 🎵 Features

- **Modern UI/UX**: Built with Shadcn UI and Tailwind CSS
- **Responsive Design**: Optimized for all devices with mobile-first approach
- **Music Streaming**: Integrated with Deezer API for vast music library
- **Playlist Management**: Create, edit, and manage playlists
- **Artist Pages**: Detailed artist profiles and discographies
- **Search Functionality**: Search tracks, artists, and albums
- **Real-time Updates**: Powered by React Query for seamless data fetching
- **Type Safety**: Full TypeScript support
- **Performance Optimized**: Fast loading and optimal Core Web Vitals

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/musiqwave-chorus-stream.git

# Navigate to project directory
cd musiqwave-chorus-stream

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: Next.js App Router
- **API Integration**: Deezer API
- **Deployment**: Vercel

## 📦 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
├── lib/                 # Utilities and store
├── types/              # TypeScript types
└── styles/             # Global styles
```

## 🔧 Configuration

1. Create a `.env.local` file in the root directory
2. Add the following environment variables:

# API Keys (if required)
NEXT_PUBLIC_DEEZER_APP_ID=your_deezer_app_id
NEXT_PUBLIC_DEEZER_SECRET_KEY=your_deezer_secret_key

# Other Configuration
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
NODE_ENV=production
```

For Vercel deployment:
1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add each of the above variables
4. Redeploy your application

Note: Make sure to replace the placeholder values with your actual API keys and configuration.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🚀 Deployment

### Vercel Deployment

1. Fork this repository
2. Create a new project on Vercel
3. Connect your forked repository
4. Configure environment variables
5. Set up build configuration:
   ```bash
   Build Command: npm run build
   Install Command: npm install
   Output Directory: dist
   Node.js Version: 18.x
   ```
6. Deploy!

Vercel will automatically detect the configuration and run the build process:
- First, it runs `npm install` to install dependencies
- Then, it executes `npm run build` to create the production build
- Finally, it serves the content from the `dist` directory

### Manual Deployment

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- Lighthouse Score:
  - Performance: 95+
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com) for the beautiful components
- [Deezer API](https://developers.deezer.com) for the music data
- [Vercel](https://vercel.com) for hosting

## 🔄 Updates

- 2025-01: Initial release with Deezer integration
- 2025-02: Added mobile responsiveness
- 2025-03: Performance optimizations

## 📞 Support

For support, email support@musicwave.com or join our Discord server.
