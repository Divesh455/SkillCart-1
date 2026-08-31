import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Helper function to handle proxy connection errors silently
const handleProxyError = (proxy) => {
  proxy.on('error', (err, _req, res) => {
    if (res && !res.headersSent && typeof res.writeHead === 'function') {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy connection error', details: err?.message }));
    }
  });
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api-proxy/railway': {
        target: 'https://skillcartcampany.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy\/railway/, ''),
        configure: handleProxyError,
      },
      '/api-proxy/resume-server': {
        target: 'http://10.111.57.115:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy\/resume-server/, ''),
        configure: handleProxyError,
      },
      '/api-proxy/render-ai': {
        target: 'https://skillcart-ai.fastapicloud.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy\/render-ai/, ''),
        configure: handleProxyError,
      },
    },
  },
})
