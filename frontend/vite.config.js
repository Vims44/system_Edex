import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // слушать все интерфейсы — нужно, чтобы Vite был доступен из контейнера
    watch: {
      // Docker на Windows не пробрасывает файловые события (inotify) внутрь
      // контейнера через смонтированный том — без polling Vite не увидит
      // сохранённые изменения, и придётся перезапускать контейнер вручную.
      usePolling: true,
      interval: 300,
    },
  },
})