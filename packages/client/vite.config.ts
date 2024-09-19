import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      strict: false,
    },
    hmr:{
      overlay:false
    }
  },
  build: {
    target: "es2022",
    minify: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, "../../node_modules/jsbi/dist/jsbi-cjs.js"),
    },
  },
  
  
});
