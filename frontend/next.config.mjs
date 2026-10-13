import analyzer from '@next/bundle-analyzer';

const isProd = process.env.NODE_ENV === 'production';
const buildWithDocker = process.env.DOCKER === 'true';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  experimental: {
    optimizePackageImports: ['gpt-tokenizer'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  output: buildWithDocker ? 'standalone' : undefined,
  reactStrictMode: true,

  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // to fix shikiji compile error
    // refs: https://github.com/antfu/shikiji/issues/23
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default isProd ? withBundleAnalyzer(nextConfig) : nextConfig;
