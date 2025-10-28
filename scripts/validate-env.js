/* eslint-disable no-console */
try {
  // Load local environment variables before validation (supports local dev)
  require('dotenv').config({ path: '.env.local' });
} catch (_) {
  // dotenv may not be installed yet; handled below
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (process.env.ALLOW_MISSING_ENV === '1' || process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️ Skipping strict env validation due to ALLOW_MISSING_ENV=1 or production build');
    return;
  }

  const errors = [];
  const warnings = [];

  // Required variables - use defaults for build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-min-10-chars';
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL not set, using placeholder for build');
  } else if (!validateUrl(supabaseUrl)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set, using placeholder for build');
  } else if (supabaseAnonKey.length < 10) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 10 characters');
  }

  // Optional but recommended
  if (process.env.NEXT_PUBLIC_APP_URL && !validateUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    errors.push('NEXT_PUBLIC_APP_URL must be a valid URL');
  }

  if (process.env.NEXT_PUBLIC_SITE_URL && !validateUrl(process.env.NEXT_PUBLIC_SITE_URL)) {
    errors.push('NEXT_PUBLIC_SITE_URL must be a valid URL');
  }

  if (process.env.SUPABASE_URL && !validateUrl(process.env.SUPABASE_URL)) {
    errors.push('SUPABASE_URL must be a valid URL');
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length < 10) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY must be at least 10 characters');
  }

  // Payment provider validation
  const someStripe = [process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET].some(Boolean);
  const allStripe = [process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET].every(Boolean);
  if (someStripe && !allStripe) {
    warnings.push('Stripe keys are partially configured. Provide all three or none.');
  }

  const someFeda = [process.env.FEDAPAY_API_KEY, process.env.FEDAPAY_PUBLIC_KEY, process.env.FEDAPAY_MODE].some(Boolean);
  const allFeda = [process.env.FEDAPAY_API_KEY, process.env.FEDAPAY_PUBLIC_KEY, process.env.FEDAPAY_MODE].every(Boolean);
  if (someFeda && !allFeda) {
    warnings.push('FedaPay keys are partially configured. Provide API key, PUBLIC key and MODE.');
  }

  if (errors.length > 0) {
    console.error('\n❌ Invalid or missing environment variables:\n');
    errors.forEach(error => console.error(`- ${error}`));
    console.error('\nTip: copy .env.example to .env.local and fill values.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
  }

  console.log('✅ Environment variables validation passed');
}

main();