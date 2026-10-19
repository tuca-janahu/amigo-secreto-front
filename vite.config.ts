import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const LOCAL_SITE_URL = 'http://localhost:5173'

function normalizeSiteUrl(url: string) {
  const value = url.trim().replace(/\/+$/, '')

  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function socialMetadataPlugin(siteUrl: string): Plugin {
  return {
    name: 'social-metadata',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const vercelProductionUrl = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || vercelProductionUrl || LOCAL_SITE_URL)

  return {
    plugins: [socialMetadataPlugin(siteUrl), react(), tailwindcss()],
  }
})
