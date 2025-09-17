import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Initialize error tracking
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // TODO: Send to error tracking service
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // TODO: Send to error tracking service
  });
}

// Create root and render app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);
root.render(<App />);