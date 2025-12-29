import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Using placeholder. Stripe features will fail at runtime.');
}

export const stripe = new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia' as any, // Cast to any to avoid future-dated version type errors if sdk mismatch
    typescript: true,
});
