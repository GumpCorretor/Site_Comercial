interface AppProps {
  apiUrl: string;
}

export function App({ apiUrl }: AppProps) {
  return (
    <main>
      <h1>Central Comercial</h1>
      <p>Scaffold web React + Vite em funcionamento.</p>
      <p>API configurada em: {apiUrl}</p>
    </main>
  );
}
