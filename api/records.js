// Authenticated compatibility API for the existing IndexedDB-style record stores.
// Supabase RLS remains the authorization boundary; this route never uses a service-role key.
const ALLOWED_STORES = new Set([
  'ptw', 'audits', 'certificates', 'personnel', 'companies',
  'findings', 'attachments', 'formRecords'
]);
const MAX_RECORD_BYTES = 512 * 1024;

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}

function envConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

function safeBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH');
    return json(res, 405, { error: 'method_not_allowed' });
  }
  const cfg = envConfig();
  if (!cfg) return json(res, 503, { error: 'database_not_connected' });

  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!match) return json(res, 401, { error: 'authentication_required' });
  const token = match[1];
  const authHeaders = { apikey: cfg.key, Authorization: `Bearer ${token}` };

  try {
    const identityResponse = await fetch(`${cfg.url}/auth/v1/user`, { headers: authHeaders });
    if (!identityResponse.ok) return json(res, 401, { error: 'invalid_or_expired_session' });
    const identity = await identityResponse.json();
    if (!identity.id) return json(res, 401, { error: 'invalid_or_expired_session' });

    const profileUrl = new URL(`${cfg.url}/rest/v1/profiles`);
    profileUrl.search = new URLSearchParams({
      select: 'user_id,role,company_id,site_id,active', user_id: `eq.${identity.id}`
    }).toString();
    const profileResponse = await fetch(profileUrl, { headers: { ...authHeaders, Accept: 'application/json' } });
    if (!profileResponse.ok) return json(res, 503, { error: 'profile_lookup_failed' });
    const profiles = await profileResponse.json();
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profile || !profile.active) return json(res, 403, { error: 'active_profile_required' });

    if (req.method === 'GET') {
      const store = String(req.query?.store || '');
      if (!ALLOWED_STORES.has(store)) return json(res, 400, { error: 'invalid_store' });
      const query = new URL(`${cfg.url}/rest/v1/system_records`);
      query.search = new URLSearchParams({
        select: 'store_name,record_id,data,version,company_id,site_id,created_by,updated_by,created_at,updated_at,deleted_at',
        store_name: `eq.${store}`,
        order: 'updated_at.asc'
      }).toString();
      const response = await fetch(query, { headers: { ...authHeaders, Accept: 'application/json' } });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return json(res, response.status, { error: 'record_read_failed' });
      return json(res, 200, { records: payload || [] });
    }

    const body = safeBody(req);
    if (!body || !ALLOWED_STORES.has(body.store) || typeof body.recordId !== 'string' || !body.recordId.trim()) {
      return json(res, 400, { error: 'invalid_record_request' });
    }
    if (body.store === 'trail' || body.store === 'users') return json(res, 403, { error: 'store_is_server_managed' });

    if (req.method === 'POST') {
      if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) return json(res, 400, { error: 'record_data_required' });
      const serialized = JSON.stringify(body.data);
      if (Buffer.byteLength(serialized, 'utf8') > MAX_RECORD_BYTES) return json(res, 413, { error: 'record_too_large' });
      const companyId = profile.role === 'Administrator' ? (body.companyId || null) : profile.company_id;
      const siteId = profile.role === 'Administrator' ? (body.siteId || null) : profile.site_id;
      if (profile.role !== 'Administrator' && body.companyId && body.companyId !== profile.company_id) return json(res, 403, { error: 'company_scope_violation' });
      if (profile.role !== 'Administrator' && body.siteId && body.siteId !== profile.site_id) return json(res, 403, { error: 'site_scope_violation' });
      const response = await fetch(`${cfg.url}/rest/v1/system_records`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({
          store_name: body.store, record_id: body.recordId, data: body.data, version: 1,
          company_id: companyId, site_id: siteId, created_by: identity.id, updated_by: identity.id
        })
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 409) return json(res, 409, { error: 'record_already_exists' });
      if (!response.ok) return json(res, response.status, { error: 'record_create_rejected' });
      return json(res, 201, { record: Array.isArray(payload) ? payload[0] : payload });
    }

    if (!Number.isInteger(body.expectedVersion) || body.expectedVersion < 1) return json(res, 400, { error: 'expected_version_required' });
    let nextData = body.data;
    let deletedAt = null;
    if (body.action === 'soft-delete') {
      if (typeof body.reason !== 'string' || !body.reason.trim()) return json(res, 400, { error: 'deletion_reason_required' });
      const currentUrl = new URL(`${cfg.url}/rest/v1/system_records`);
      currentUrl.search = new URLSearchParams({
        select: 'data,version', store_name: `eq.${body.store}`, record_id: `eq.${body.recordId}`,
        version: `eq.${body.expectedVersion}`
      }).toString();
      const currentResponse = await fetch(currentUrl, { headers: { ...authHeaders, Accept: 'application/json' } });
      const current = await currentResponse.json().catch(() => null);
      if (!currentResponse.ok) return json(res, 503, { error: 'record_read_failed' });
      if (!Array.isArray(current) || !current[0]) return json(res, 409, { error: 'record_changed_or_unavailable' });
      deletedAt = new Date().toISOString();
      nextData = { ...current[0].data, deletedAt, deletedBy: identity.id, deletedReason: body.reason.trim().slice(0, 1000) };
    }
    if (!nextData || typeof nextData !== 'object' || Array.isArray(nextData)) return json(res, 400, { error: 'record_data_required' });
    if (Buffer.byteLength(JSON.stringify(nextData), 'utf8') > MAX_RECORD_BYTES) return json(res, 413, { error: 'record_too_large' });

    const updateUrl = new URL(`${cfg.url}/rest/v1/system_records`);
    updateUrl.search = new URLSearchParams({
      store_name: `eq.${body.store}`, record_id: `eq.${body.recordId}`,
      version: `eq.${body.expectedVersion}`
    }).toString();
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ data: nextData, version: body.expectedVersion + 1, updated_by: identity.id, updated_at: new Date().toISOString(), ...(deletedAt ? { deleted_at: deletedAt } : {}) })
    });
    const updated = await updateResponse.json().catch(() => null);
    if (!updateResponse.ok) return json(res, updateResponse.status, { error: 'record_update_rejected' });
    if (!Array.isArray(updated) || !updated[0]) return json(res, 409, { error: 'record_changed_or_unavailable' });
    return json(res, 200, { record: updated[0] });
  } catch (error) {
    console.error('ptw_records_api_error', { name: error && error.name ? error.name : 'UnknownError' });
    return json(res, 503, { error: 'database_unavailable' });
  }
};

