
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/': path.resolve(__dirname, './apps/web'),
      '@app/': path.resolve(__dirname, './apps/web/app'),
      '@builder/': path.resolve(__dirname, './apps/web/app/(builder)'),
      '@builder-engine/': path.resolve(__dirname, './unreal-wonder-build/components'),
      '@core/': path.resolve(__dirname, './engine/core'),
      '@components/': path.resolve(__dirname, './ui/components'),
      '@lib/': path.resolve(__dirname, './apps/web/lib'),
      '@engine/': path.resolve(__dirname, './engine'),
      '@ui/': path.resolve(__dirname, './ui'),
      '@infra/': path.resolve(__dirname, './infra'),
      '@types/': path.resolve(__dirname, './types'),
      '@puckeditor/core': path.resolve(__dirname, './packages/puckeditor-core/index.js'),
      '@theia/': path.resolve(__dirname, './WonderSpace/theia-app/src')
    }
  }
})
