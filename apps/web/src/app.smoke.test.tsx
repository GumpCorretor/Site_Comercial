import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  it('renderiza a página inicial do scaffold', () => {
    const html = renderToStaticMarkup(<App apiUrl="http://localhost:3001" />);

    expect(html).toContain('Central Comercial');
    expect(html).toContain('Scaffold web React + Vite em funcionamento.');
    expect(html).toContain('http://localhost:3001');
  });
});
