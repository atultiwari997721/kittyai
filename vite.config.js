import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || ''),
      'process.env.NVIDIA_API_KEY': JSON.stringify(env.NVIDIA_API_KEY || env.VITE_NVIDIA_API_KEY || ''),
    },
    envPrefix: ['VITE_', 'GROQ_', 'GEMINI_', 'OPENAI_', 'NVIDIA_'],
    server: {
      port: 9972,
      host: true
    },
    preview: {
      port: 9972,
      host: true
    }
  }
})
