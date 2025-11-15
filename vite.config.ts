import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Base path para GitHub Pages
    // Se o repositório não for username.github.io, use o nome do repositório
    // Exemplo: se o repo for 'meu-projeto', o base será '/meu-projeto/'
    // Para repositórios username.github.io, deixe como '/' ou ''
    const base = process.env.GITHUB_PAGES_BASE || '/';
    
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
