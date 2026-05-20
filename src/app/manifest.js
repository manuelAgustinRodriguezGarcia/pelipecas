export default function manifest() {
  return {
    id: "/",
    name: "Pelipecas — Tu cartelera personal",
    short_name: "Pelipecas",
    description:
      "Organizá tu cartelera personal, registrá películas vistas y dejá que Pelipecas elija tu próxima función.",
    start_url: "/para-ver",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "fullscreen"],
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#080808",
    lang: "es",
    dir: "ltr",
    categories: ["entertainment"],
    icons: [
      {
        src: "/icon192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
