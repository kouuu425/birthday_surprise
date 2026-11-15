import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages は https://<user>.github.io/<リポジトリ名>/ で配信されるため、
  // アセットのパスの起点をリポジトリ名に合わせる
  base: '/birthday_surprise/',
})
