
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";
import packageJson from "./package.json";

const envMap = {
  production: "prod",
  prod: "prod",
  development: "dev",
  dev: "dev",
  staging: "stage",
  stage: "stage",
};


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const path = process.cwd() + '/volumes/config';
  const viteMode = envMap[mode as keyof typeof envMap];
  const envFile = ".env." + viteMode;
  dotenv.config({ path: `${path}/${envFile}` });
  
  const config = {
    name: packageJson.name,
    version: packageJson.version,
    env: viteMode,
    config_name: check(process.env.CONFIG_NAME, "default"),
    appId: check(process.env.APP_ID, "hackathon-manager-frontend"),
    logLevel: check(process.env.LOG_LEVEL, "info"),
    apiUrl: check(process.env.VITE_API_URL, "http://localhost"),
    hostUrl: check(process.env.VITE_HOST_URL, "http://localhost"),
    hostPort: check(process.env.VITE_HOST_PORT, "8080"),
    apiPort: check(process.env.VITE_API_PORT, "3005"),
    apiSecret: check(process.env.API_SECRET, "your-api-secret"),
    supportEmail: check(process.env.SUPPORT_EMAIL, "you@yourdomain.de"),
  
  };

  console.log(`${packageJson.name} v${packageJson.version}`);
  console.log(`path: ${path}`);
  console.log(`Mode: ${config.env}`)
  console.log(`API Port: ${config.apiPort}`);
  console.log(`HOST Port: ${config.hostPort}`);

  
function check(value: unknown, defaultValue: string | number | boolean): string | number | boolean {
  if (typeof value === "undefined" || value === null) {
    return defaultValue;
  }
  if (typeof defaultValue === "number") {
    return isNaN(Number(value)) ? defaultValue : Number(value);
  }
  if (typeof defaultValue === "boolean") {
    return value === "true" || value === true;
  }
  return value as string;
}

  return {
    plugins: [react()],
    server: {
      port: config.hostPort,
      strictPort: true, // Falls der Port belegt ist, soll kein alternativer genutzt werden
      host: "0.0.0.0", // Falls du möchtest, dass Vite von anderen Geräten im Netzwerk erreichbar ist
      proxy: {
        "/api": {
          target: `${config.apiUrl}:${config.apiPort}`,
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
      APP_ID: JSON.stringify(config.appId),
      APP_VERSION: JSON.stringify(config.version),
      APP_NAME: JSON.stringify(config.name),
      CONFIG: JSON.stringify(config),
    }
  }
});