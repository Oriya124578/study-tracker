import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Self-heal stale code-split chunks after a deploy. When an already-open client
// tries to lazy-load a chunk whose hashed filename no longer exists on the
// server, the SPA rewrite returns index.html (text/html) → "not a valid
// JavaScript MIME type". Reload once (guarded) to fetch the fresh index + chunks.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('cl_chunk_reloaded')) {
    sessionStorage.setItem('cl_chunk_reloaded', '1');
    window.location.reload();
  }
});
// Clear the guard once a navigation succeeds so future deploys can self-heal too.
window.addEventListener('load', () => {
  setTimeout(() => sessionStorage.removeItem('cl_chunk_reloaded'), 4000);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
