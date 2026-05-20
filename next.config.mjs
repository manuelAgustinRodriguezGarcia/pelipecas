/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Evita errores "SegmentViewNode" / React Client Manifest en desarrollo.
    devtoolSegmentExplorer: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  // En Windows, la caché persistente de webpack puede dejar chunks huérfanos
  // (p. ej. "Cannot find module './611.js'") al cambiar de ruta en `next dev`.
  webpack: (config, { dev }) => {
    if (dev && process.platform === "win32") {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
