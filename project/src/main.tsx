import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply saved dark mode preference before React renders to avoid flash
const savedDark = localStorage.getItem('pref_dark_mode');
if (savedDark === 'true') {
  document.documentElement.classList.add('dark');
} else if (savedDark === 'false') {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
