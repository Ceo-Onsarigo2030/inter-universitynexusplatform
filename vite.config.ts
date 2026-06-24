// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect Vercel CI builds so we can swap the Nitro preset and skip the
// Cloudflare-specific worker entry wrapper (src/server.ts exports a
// `{ fetch }` handler shaped for workerd, not Vercel's Node runtime).
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  ...(isVercel
    ? { nitro: { preset: "vercel" } }
    : {
        tanstackStart: {
          // Redirect TanStack Start's bundled server entry to src/server.ts
          // (our SSR error wrapper for the Cloudflare worker target).
          server: { entry: "server" },
        },
      }),
});
