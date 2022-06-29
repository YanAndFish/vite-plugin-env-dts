import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import envdts from '../src'

export default defineConfig({
  root: __dirname,
  plugins: [
    envdts({
      convertValue: true,
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.join(__dirname, 'src') },
      { find: /^src\//, replacement: path.join(__dirname, 'src/') },
      { find: '/root/src', replacement: path.join(__dirname, 'src') },
    ],
  },
  build: {
    minify: false,
  },
})
