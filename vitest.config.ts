/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
        globals: true,
        alias: {
            '@': resolve(__dirname, './src')
        },
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/unit/**/*.test.ts'],
        exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
