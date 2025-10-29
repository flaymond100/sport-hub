import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './App.tsx'
import { Header } from './components/Header'
import { lazy } from 'react';

const About = lazy(() => import('./pages/about-us/index.tsx'))



createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/sport-hub">
    <div className="min-h-screen bg-gray-50">
    <Header />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/about" element={<About />} />
    </Routes>
    </div>
  </BrowserRouter>,
)
