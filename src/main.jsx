import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="import.meta.env.VITE_GOOGLE_CLIENT_ID">
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
