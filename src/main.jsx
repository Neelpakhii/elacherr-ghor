import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './site.css'
import App from './App.jsx'

if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0); 
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
