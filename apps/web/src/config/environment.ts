import { parseWebEnvironment, type WebEnvironment } from '../../environment.schema.js';

export function readWebEnvironment(): WebEnvironment {
  return parseWebEnvironment({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });
}
