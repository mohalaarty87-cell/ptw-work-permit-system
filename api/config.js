// Only publishable Supabase connection details are returned to the browser.
// Never expose SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY here.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return res.status(503).json({ error: 'database_not_connected' });
  return res.status(200).json({ url: url.replace(/\/$/, ''), publishableKey });
};

