# Database setup — first migration

The Supabase project and initial schema are provisioned. Vercel Production has `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` configured, and a production redeployment completed with status Ready. The first confirmed Auth account has an active `Administrator` profile. The browser app still uses IndexedDB and local role selection, so operational data has not moved to Supabase and authenticated API behavior is not yet verified.

## Required external setup

1. **Completed:** Supabase project provisioned and public connection settings added to the Vercel Production environment for `ptw-work-permit-system`.
2. Set the site region, organization/site boundaries, backup region and retention policy with the system owner before entering real data.
3. **Completed:** Applied `migrations/001_initial_schema.sql` in the Supabase SQL Editor. Do not paste a `service_role` secret into client-side code.
4. **Completed:** Created the first administrator profile through the trusted Supabase SQL Editor; the browser must never be allowed to assign its own role.
5. Review the role-to-store rules and scope behavior against the organization's approved authorization matrix.
6. Configure and verify Supabase Auth redirect URLs for the Vercel production domain and intended preview domains. The current app callback attempt returned an expired OTP link; the Auth user itself is confirmed.
7. Verify `/api/health` reports that configuration variables are present (this alone does not prove the schema is installed) and `/api/records` rejects anonymous requests before connecting the UI.
8. Wire the UI to authenticated database access and run a verified data migration from each legacy browser database only after reviewing backups and company/site mapping.

## Why the app has not switched yet

The database schema, production connection settings, and first administrator profile are ready. The API scaffold is not wired into the frontend, and production API health could not be checked in the current browser session. No legacy data has been migrated. The local app must first gain authenticated Supabase sign-in and server/API persistence, with company/site scoping, before any records are copied.

## Migration requirements

- Export a v3 backup from every browser/device containing records; it includes local attachments and a SHA-256 integrity digest. Legacy v2 backups do not include attachment contents.
- Map existing store IDs without regenerating them; retain original values and timestamps.
- Assign each old record to an approved company/site before enabling scoped access.
- Compare source/export and target row counts and hashes, then have the owner reconcile exceptions.
- Keep the old local data read-only until the owner accepts the migration and restore procedure.
- Never seed fake permits, approvals, audit events or worker records.

