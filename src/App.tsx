import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import Playlists from "@/pages/Playlists";
import Artist from "@/pages/Artist";
import Album from "@/pages/Album";
import NotFound from "@/pages/NotFound";
import { Genre } from "@/pages/Genre";
import Playlist from "@/pages/Playlist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function setupMetadata() {
  document.title = 'MusicWave - Stream Music Online';
  
  const metaTags = {
    'description': 'Stream millions of songs, create playlists, and discover new music.',
    'keywords': 'music, streaming, playlists, songs, artists, albums',
    'theme-color': '#000000',
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=1',
  };

  Object.entries(metaTags).forEach(([name, content]) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
}

const App = () => {
  setupMetadata();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="/genre/:id" element={<Genre />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
          <Sonner />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
