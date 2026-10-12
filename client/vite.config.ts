import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ threshold: 1024 }),
    VitePWA({
      registerType: 'autoUpdate',
      // 只预缓存应用外壳（JS/CSS/HTML/图标），音频体积大（700MB+）不预缓存，
      // 改为运行时按需缓存，听过的讲解音频下次离线可听
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        // 音频目录（700MB+）不预缓存，运行时按需缓存
        globIgnores: ['**/audio/**'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.mp3'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'narrations-audio',
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: false, // 使用 public/manifest.json 手写版本
    }),
  ],
  resolve: {
    alias: {
      // react-plotly.js 默认引用完整 bundle（含 3D/gl/financial 等全部 trace），
      // 重定向到项目自定义的精简内核，仅注册实际用到的图表类型，大幅减小体积
      'plotly.js/dist/plotly': new URL('./src/lib/plotly-custom.ts', import.meta.url).pathname,
      // Node.js polyfills for plotly.js
      'buffer/': 'buffer/',
      buffer: 'buffer',
    },
  },
  define: {
    // 为 plotly.js 提供 global 对象
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Plotly 图表库 (最大的依赖，单独分包便于缓存)
          'vendor-plotly': ['react-plotly.js'],
          // 数学库
          'vendor-math': ['mathjs', 'katex', 'react-katex'],
        },
      },
    },
    // plotly 本身就很大，提高警告阈值
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
