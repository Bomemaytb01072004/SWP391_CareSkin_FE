import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(

    // <React.StrictMode >
        <GoogleOAuthProvider clientId="88963733513-s5g6dv8172pphdd1daa1150ern9l356o.apps.googleusercontent.com">
            <App />
        </GoogleOAuthProvider>
    // </React.StrictMode>
);
