import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), viteSingleFile()],
  build: {
    commonjsOptions: {
      include: ['../../libs/**', /node_modules\//],
    },
  }
})
