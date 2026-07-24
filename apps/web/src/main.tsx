import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { readWebEnvironment } from './config/environment';

const rootElement = globalThis.document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raiz não encontrado.');
}

const environment = readWebEnvironment();

createRoot(rootElement).render(
  <StrictMode>
    <App apiUrl={environment.VITE_API_URL} />
  </StrictMode>,
);
