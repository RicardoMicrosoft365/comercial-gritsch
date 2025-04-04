/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Permitir que o webpack transpile módulos do Material UI
  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@mui/system',
    '@mui/utils',
    '@emotion/react',
    '@emotion/styled'
  ],
  
  // Resolver problemas de MIME type
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig; 