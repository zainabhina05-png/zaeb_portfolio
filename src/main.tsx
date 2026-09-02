import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SmoothScrollProvider } from './motion/SmoothScrollProvider.tsx';
import { SectionThemeProvider } from './motion/SectionTheme.tsx';
import { GsapLenisBridge } from './motion/GsapLenisBridge.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScrollProvider>
      <SectionThemeProvider>
        <GsapLenisBridge />
        <App />
      </SectionThemeProvider>
    </SmoothScrollProvider>
  </StrictMode>,
);
