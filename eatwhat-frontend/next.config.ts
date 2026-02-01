import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'cdn0.woolworths.media' },
      { hostname: 'productimages.coles.com.au' },
      { hostname: 'dm.apac.cms.aldi.cx' },
    ],
  },
};

export default nextConfig;
