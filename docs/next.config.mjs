import { createMDX } from 'fumadocs-mdx/next';


const withMDX = createMDX({
  mdxOptions: {
    rehypeCodeOptions: {
      langs: ['javascript', 'typescript', 'tsx', 'json'],
      // optionally also themes etc.
      // themes: { light: 'light-plus', dark: 'slack-dark' },
    },
    remarkImageOptions: {
      onError: "ignore", // or "hide"
    },
  },
});



export const config = {
  // output: 'export',
  distDir: './dist',

  reactStrictMode: false,
  images: {
    domains: ['i.imgur.com'],
    unoptimized: true,
  },
};
export default withMDX(config);
