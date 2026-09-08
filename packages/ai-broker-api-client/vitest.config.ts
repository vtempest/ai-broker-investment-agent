import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts, which is the library *build* config
// (terser + dts). Loading that one for tests pulls in plugins the test run
// does not need.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.{js,ts}'],
  },
});
