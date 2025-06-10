// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://164.90.157.191:4884/graphql',
      },
    ];
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'img.tiktok.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-va.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p19-sign.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p16.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p19.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-va-h2.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg-h2.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg-h2.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p16.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p19.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'tiktokv.com',
      },
      {
        protocol: 'https',
        hostname: 'tiktokv.us',
      },
      {
        protocol: 'https',
        hostname: 'tiktokv.eu',
      },
      {
        protocol: 'https',
        hostname: 'tiktokw.eu',
      },
      {
        protocol: 'https',
        hostname: 'tiktokw.us',
      },
      {
        protocol: 'https',
        hostname: 'tiktokstaticb.com',
      },
      {
        protocol: 'https',
        hostname: 'ttlivecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ttlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'ttwstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'ibyteimg.com',
      },
      {
        protocol: 'https',
        hostname: 'ibytedtos.com',
      },
      {
        protocol: 'https',
        hostname: 'muscdn.com',
      },
      {
        protocol: 'https',
        hostname: 'musical.ly',
      },
      {
        protocol: 'https',
        hostname: 'byteoversea.com',
      },
      {
        protocol: 'https',
        hostname: 'bytecdn.cn',
      },
      {
        protocol: 'https',
        hostname: 'byted.org',
      },
      {
        protocol: 'https',
        hostname: '**tiktokcdn-eu.com', // Allows all subdomains of tiktokcdn-eu.com
        port: '',
        pathname: '/**', // Allows all paths
      },
      {
        protocol: 'https',
        hostname: '**tiktokcdn.com', // Allows all subdomains of tiktokcdn.com
        port: '',
        pathname: '/**',
      },     
    ], 
  },
};

module.exports = nextConfig;


