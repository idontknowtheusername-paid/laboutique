/* eslint-disable no-console */
const { z } = require('zod');

const EnvSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
	NEXT_PUBLIC_APP_NAME: z.string().optional(),
	NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

	SUPABASE_URL: z.string().url().optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	STRIPE_SECRET_KEY: z.string().optional(),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),

	PAYSTACK_SECRET_KEY: z.string().optional(),

	FEDAPAY_API_KEY: z.string().optional(),
	FEDAPAY_PUBLIC_KEY: z.string().optional(),
	FEDAPAY_MODE: z.enum(['test', 'live']).optional(),
	FEDAPAY_WEBHOOK_SECRET: z.string().optional(),
});

function main() {
  if (process.env.ALLOW_MISSING_ENV === '1') {
    console.warn('\n⚠️ Skipping strict env validation due to ALLOW_MISSING_ENV=1');
    return;
  }
	const parsed = EnvSchema.safeParse(process.env);
	if (!parsed.success) {
		console.error('\n❌ Invalid or missing environment variables:\n');
		for (const issue of parsed.error.issues) {
			console.error(`- ${issue.path.join('.')}: ${issue.message}`);
		}
		console.error('\nTip: copy .env.example to .env.local and fill values.');
		process.exit(1);
	}

	const env = parsed.data;
	const someStripe = [env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET].some(Boolean);
	const allStripe = [env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET].every(Boolean);
	if (someStripe && !allStripe) {
		console.warn('⚠️ Stripe keys are partially configured. Provide all three or none.');
	}

	const someFeda = [env.FEDAPAY_API_KEY, env.FEDAPAY_PUBLIC_KEY, env.FEDAPAY_MODE].some(Boolean);
	const allFeda = [env.FEDAPAY_API_KEY, env.FEDAPAY_PUBLIC_KEY, env.FEDAPAY_MODE].every(Boolean);
	if (someFeda && !allFeda) {
		console.warn('⚠️ FedaPay keys are partially configured. Provide API key, PUBLIC key and MODE.');
	}
}

main();