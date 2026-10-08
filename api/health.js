// Safe deployment/readiness probe. Never returns credential values.
module.exports = async function handler(_req, res) {
  const configured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(configured ? 200 : 503).json({
    status: configured ? 'configuration_present' : 'database_not_connected',
    provider: configured ? 'supabase' : null,
    credentialVariablesPresent: configured,
    schemaApplied: null,
  });
};

