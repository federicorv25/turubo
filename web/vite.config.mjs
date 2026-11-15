import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  server: {
    fs: {
      allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../content', import.meta.url))]
    }
  }
}))
