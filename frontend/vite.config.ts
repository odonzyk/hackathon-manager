
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  console.log(`${packageJson.name} v${packageJson.version}`);
  console.log(`Mode: ${mode}`);
  console.log(`API Port: ${env.VITE_API_PORT || 3000}`);
  console.log(`HOST Port: ${env.VITE_HOST_PORT}`);

  return {
    plugins: [react()],
    server: {
      port: env.VITE_HOST_PORT ? parseInt(env.VITE_HOST_PORT) : 8080, // Setze Port
      strictPort: true, // Falls der Port belegt ist, soll kein alternativer genutzt werden
      host: "0.0.0.0", // Falls du möchtest, dass Vite von anderen Geräten im Netzwerk erreichbar ist
      proxy: {
        "/api": {
          target: `${env.VITE_API_HOST || "http://localhost"}:${env.VITE_API_PORT || 3000}`, // Hier den Port aus der .env verwenden
          changeOrigin: true, // Wichtig, um CORS zu umgehen
          secure: false // Wenn die API nicht HTTPS verwendet
        }
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts"
    },
    optimizeDeps: {
      include: ['jwt-decode'],
      exclude: []
    },
    define: {
      APP_ID: JSON.stringify(env.VITE_APP_ID || "default-app-id"),
      APP_VERSION: JSON.stringify(packageJson.version), // Setze die App-Version als globale Variable
      APP_NAME: JSON.stringify(packageJson.name)
    }
  }
});