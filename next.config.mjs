/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Placeholder photography is pulled from Unsplash until real shoot assets land.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  /*
    Deliberately a redirect rather than middleware: the hero fires up to 120
    frame requests per load, and a middleware matcher that leaks over /public
    is an easy way to regress that. Accept-Language detection can be layered
    on later as an opt-in.
  */
  async redirects() {
    return [{ source: "/", destination: "/fr", permanent: false }];
  },
};

export default nextConfig;
