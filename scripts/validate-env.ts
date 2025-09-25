/* eslint-disable no-console */
import { z } from 'zod';

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Server-only (optional depending on features)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

  // Payments (if Stripe is enabled)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Paystack (if used)
  PAYSTACK_SECRET_KEY: z.string().optional(),
});

function main() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('\n❌ Invalid or missing environment variables:\n');
    for (const issue of parsed.error.issues) {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\nTip: copy .env.example to .env.local and fill values.');
    process.exit(1);
  }

  // Optional: warn when Stripe keys are partially set
  const env = parsed.data as Record<string, string | undefined>;
  const stripeKeys = [
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    env.STRIPE_SECRET_KEY,
    env.STRIPE_WEBHOOK_SECRET,
  ];
  const someStripe = stripeKeys.some(Boolean);
  const allStripe = stripeKeys.every(Boolean);
  if (someStripe && !allStripe) {
    console.warn('⚠️ Stripe keys are partially configured. Provide all three or none.');
  }
}

main();

