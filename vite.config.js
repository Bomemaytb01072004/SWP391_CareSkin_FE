import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Chạy trên cổng 5173
    strictPort: true, // Nếu cổng này bận, Vite sẽ không tự chọn cổng khác
    allowedHosts: ['careskinbeauty.shop']
  }
});