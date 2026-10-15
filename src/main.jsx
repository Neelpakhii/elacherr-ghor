import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './site.css'
import App from './App.jsx'

if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0); 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
