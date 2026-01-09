import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'alpaca/index': resolve(__dirname, 'src/alpaca/client.ts'),
        'stocks/index': resolve(__dirname, 'src/stocks/index.ts'),
        'prediction/index': resolve(__dirname, 'src/prediction/polymarket.ts'),
        'trading-agents/index': resolve(__dirname, 'src/trading-agents/index.ts'),
        'constants/index': resolve(__dirname, 'src/constants/index.ts'),
        utils: resolve(__dirname, 'src/utils.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es') {
          return `${entryName}.mjs`;
        }
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'next',
        '@alpacahq/alpaca-trade-api',
        '@langchain/core',
        '@langchain/google-genai',
        '@langchain/groq',
        '@langchain/langgraph',
        '@langchain/openai',
        '@polymarket/clob-client',
        'axios',
        'csv-parse',
        'date-fns',
        'dotenv',
        'drizzle-orm',
        'ethers',
        'indicatorts',
        'langchain',
        'nanoid',
        'sec-edgar-toolkit',
        'yahoo-finance2',
        'zod',
      ],
    },
  },
});
