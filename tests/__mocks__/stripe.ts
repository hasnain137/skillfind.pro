
import { vi } from 'vitest';

export const stripe = {
    checkout: {
        sessions: {
            create: vi.fn().mockResolvedValue({
                id: 'sess_test_123',
                url: 'https://checkout.stripe.com/test',
                payment_intent: 'pi_test_123'
            }),
        },
    },
    webhooks: {
        constructEvent: vi.fn().mockImplementation((body, sig, secret) => {
            if (sig === 'invalid_signature') {
                throw new Error('Webhook signature verification failed.');
            }
            return JSON.parse(body);
        }),
    },
    identity: {
        verificationSessions: {
            create: vi.fn(),
            list: vi.fn(),
            retrieve: vi.fn()
        }
    }
};

// Mock the module itself
vi.mock('@/lib/stripe', () => ({
    stripe: stripe
}));
