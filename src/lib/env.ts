// Read a required environment variable, failing with a clear message if missing.
// Call this lazily (at request time), not at module load, so builds don't need secrets.
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env.local (local) or in your hosting provider's environment variables (production).`,
    );
  }
  return value;
}
