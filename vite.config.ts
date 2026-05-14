import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const betterAuthProxyTarget = env.VITE_BETTER_AUTH_PROXY_TARGET?.trim() ?? "";
  const hasBetterAuthProxyTarget = betterAuthProxyTarget.length > 0;

  return {
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: hasBetterAuthProxyTarget
      ? {
          proxy: {
            "/api/auth": {
              target: betterAuthProxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
});
