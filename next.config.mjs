// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       remotePatterns: [
//         {
//           protocol: 'https',
//           hostname: 'api.producthunt.com',
//           pathname: '/widgets/embed-image/**',
//         },
//       ],
//       dangerouslyAllowSVG: true,
//       contentDispositionType: 'attachment',
//       contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
//     },
//   };
  
//   export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
        pathname: '/widgets/embed-image/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // This applies to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;