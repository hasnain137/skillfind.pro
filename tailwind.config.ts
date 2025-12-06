
/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            // 1. ZINC SCALE (Surface System)
            // We map 'surface' to zinc values for that premium neutral look.
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",

                // Semantic Surfaces
                surface: {
                    0: "#ffffff",
                    50: "#fafafa",
                    100: "#f4f4f5",
                    200: "#e4e4e7",
                    300: "#d4d4d8",
                    400: "#a1a1aa",
                    500: "#71717a",
                    600: "#52525b",
                    700: "#3f3f46",
                    800: "#27272a",
                    900: "#18181b",
                    950: "#09090b",
                },

                // Custom Brand Colors (to preserve homepage look)
                brand: {
                    black: "#333333", // Primary branding black
                    gray: "#7C7373",  // Branding gray text
                },

                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563EB', // Main brand color
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },

                // Status Colors (Missing in original config)
                success: {
                    light: "#dcfce7", // emerald-100
                    DEFAULT: "#22c55e", // emerald-500
                    dark: "#14532d", // emerald-900
                    50: "#ecfdf5",
                    100: "#d1fae5",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981",
                    600: "#059669",
                    700: "#047857",
                    800: "#065f46",
                    900: "#064e3b",
                },
                error: {
                    light: "#fee2e2", // rose-100
                    DEFAULT: "#ef4444", // rose-500
                    dark: "#7f1d1d", // rose-900
                },
                warning: {
                    light: "#fef3c7", // amber-100
                    DEFAULT: "#f59e0b", // amber-500
                    dark: "#78350f", // amber-900
                },

                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },

            // 2. TYPOGRAPHY (Optical Sizing)
            fontFamily: {
                sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
            },
            // Negative tracking for large headings
            letterSpacing: {
                tighter: "-0.04em",
                tight: "-0.02em", // Use for standard headings
                normal: "0em",
                wide: "0.025em",
                wider: "0.05em", // Use for uppercase captions
                widest: "0.1em",
            },

            // 3. SHADOWS (Strict Technical Specs)
            boxShadow: {
                'soft': '0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.02)', // Level 1
                'medium': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', // Hover
                'float': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)', // Modal
                'glow-sm': '0 0 10px rgba(37, 99, 235, 0.15)',
                'glow': '0 0 20px rgba(37, 99, 235, 0.2)',
            },

            // 4. ANIMATIONS (Subtle & Professional)
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out forwards",
                "fade-out": "fade-out 0.3s ease-out forwards",
                "scale-in": "scale-in 0.2s cubic-bezier(0.25, 1, 0.5, 1) forwards",
                "slide-in-from-top": "slide-in-from-top 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards",
                "slide-in-from-bottom": "slide-in-from-bottom 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "fade-out": {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                "slide-in-from-top": {
                    "0%": { transform: "translateY(-10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-in-from-bottom": {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
