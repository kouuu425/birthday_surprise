import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages は https://<user>.github.io/<リポジトリ名>/ で配信されるため、
  // アセットのパスの起点をリポジトリ名に合わせる
  base: '/birthday_surprise/',
  build: {
    rolldownOptions: {
      // ページごとの入口。/birthday_surprise/ と /birthday_surprise/ruriiro/
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ruriiro: resolve(import.meta.dirname, 'ruriiro/index.html'),
      },
    },
  },
})
