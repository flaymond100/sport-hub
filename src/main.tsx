import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './App.tsx'
import { lazy } from 'react';

const About = lazy(() => import('./pages/about-us/index.tsx'))



createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/sport-hub">
     <Routes>
      <Route path="/" element={<App />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </BrowserRouter>,
)
