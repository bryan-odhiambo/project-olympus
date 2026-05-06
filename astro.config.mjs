import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "static",
  site: "https://bryan-odhiambo.github.io",
  base: "/cresthaven",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ["gsap"],
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
  compressHTML: true,
});
