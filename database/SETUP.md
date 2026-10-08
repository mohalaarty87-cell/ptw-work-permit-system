# Database setup — first migration

The application has no database attached yet. The SQL migration at `migrations/001_initial_schema.sql` targets Supabase Postgres because Supabase supplies the Auth identity used by the row-level security policies. A guarded API scaffold is present at `../api/records.js`; it returns a not-configured response until `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) are set in Vercel.

## Required external setup

1. Provision a Supabase project for the PTW system and connect its production environment to the Vercel project `ptw-work-permit-system`.
2. Set the site region, organization/site boundaries, backup region and retention policy with the system owner before entering real data.
3. Apply `migrations/001_initial_schema.sql` in a reviewable database migration process. Do not paste a `service_role` secret into client-side code.
4. Create the first administrator profile through a trusted administrative process; the browser must never be allowed to assign its own role.
5. Review the role-to-store rules and scope behavior against the organization's approved authorization matrix.
6. Configure Supabase Auth redirect URLs to the Vercel production domain and the intended preview domains.
7. Verify `/api/health` reports that configuration variables are present (this alone does not prove the schema is installed) and `/api/records` rejects anonymous requests before connecting the UI.
8. Only then wire the UI to authenticated database access and run a verified data migration from each legacy browser database.

## Why the app has not switched yet

Vercel currently reports no connected database integrations for this project. No Supabase project URL or public anon key is available to the app, and no legacy data can be safely migrated from remote browsers by the current deployment. The API scaffold is not yet wired into the frontend. The SQL is a schema draft, not a claim that storage or production authentication is working.

## Migration requirements

- Export a v3 backup from every browser/device containing records; it includes local attachments and a SHA-256 integrity digest. Legacy v2 backups do not include attachment contents.
- Map existing store IDs without regenerating them; retain original values and timestamps.
- Assign each old record to an approved company/site before enabling scoped access.
- Compare source/export and target row counts and hashes, then have the owner reconcile exceptions.
- Keep the old local data read-only until the owner accepts the migration and restore procedure.
- Never seed fake permits, approvals, audit events or worker records.

