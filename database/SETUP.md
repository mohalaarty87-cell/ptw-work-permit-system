# Database setup — first migration

The Supabase project and initial schema are provisioned. Vercel Production has `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` configured, and a production redeployment completed with status Ready. The first confirmed Auth account has an active `Administrator` profile. A branch now replaces local role selection with Supabase Auth, but it has not reached production or been tested with the account owner's password. Operational records still remain in IndexedDB.

## Required external setup

1. **Completed:** Supabase project provisioned and public connection settings added to the Vercel Production environment for `ptw-work-permit-system`.
2. Set the site region, organization/site boundaries, backup region and retention policy with the system owner before entering real data.
3. **Completed:** Applied `migrations/001_initial_schema.sql` in the Supabase SQL Editor. Do not paste a `service_role` secret into client-side code.
4. **Completed:** Created the first administrator profile through the trusted Supabase SQL Editor; the browser must never be allowed to assign its own role.
5. Review the role-to-store rules and scope behavior against the organization's approved authorization matrix.
6. Configure and verify Supabase Auth redirect URLs for the Vercel production domain and intended preview domains. The current app callback attempt returned an expired OTP link; the Auth user itself is confirmed.
7. Verify `/api/health` reports that configuration variables are present (this alone does not prove the schema is installed) and `/api/records` rejects anonymous requests before connecting the UI.
8. **In progress:** Wire authentication into the UI. Next, route record reads and writes through the authenticated API, then run a verified data migration only after reviewing backups and company/site mapping.

## Why the app has not switched yet

The database schema, production connection settings, and first administrator profile are ready. The authentication UI is on a pull request. The API scaffold is not wired into the record screens, and no legacy data has been migrated. Server/API persistence and company/site scoping must be completed before records are copied.

## Migration requirements

- Export a v3 backup from every browser/device containing records; it includes local attachments and a SHA-256 integrity digest. Legacy v2 backups do not include attachment contents.
- Map existing store IDs without regenerating them; retain original values and timestamps.
- Assign each old record to an approved company/site before enabling scoped access.
- Compare source/export and target row counts and hashes, then have the owner reconcile exceptions.
- Keep the old local data read-only until the owner accepts the migration and restore procedure.
- Never seed fake permits, approvals, audit events or worker records.

