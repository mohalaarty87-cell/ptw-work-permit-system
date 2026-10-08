# Database setup — first migration

The Supabase project and initial schema are provisioned. Vercel Production has `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` configured, and a production redeployment completed with status Ready. The first confirmed Auth account has an active `Administrator` profile. A branch now replaces local role selection with Supabase Auth, but it has not reached production or been tested with the account owner's password. Operational records still remain in IndexedDB.

## Current deployment status

1. **Completed:** Supabase project provisioned and public connection settings added to the Vercel Production environment for `ptw-work-permit-system`.
2. Set the site region, organization/site boundaries, backup region and retention policy with the system owner before entering real data.
3. **Completed:** Applied `migrations/001_initial_schema.sql` in the Supabase SQL Editor. Do not paste a `service_role` secret into client-side code.
4. **Completed:** Created the first administrator profile through the trusted Supabase SQL Editor; the browser must never be allowed to assign its own role.
5. Review the role-to-store rules and scope behavior against the organization's approved authorization matrix.
6. **Completed:** Set the Supabase Site URL to `https://ptw-work-permit-system.vercel.app` and added the matching production redirect allowlist.
7. **Verified:** `/api/health` reports that configuration variables are present (this alone does not prove the schema is installed); `/api/records` requires a valid bearer session and active profile.
8. **In progress:** The production sign-in UI uses Supabase Auth. Operational screens still read and write IndexedDB; no operational data has been sent to Supabase. Next, wire the screens to `/api/records` and verify access with the account owner before enabling any transfer.

## Why the app has not switched yet

The database schema, production connection settings, first administrator profile, production authentication UI, and redirect settings are ready. The API scaffold is not wired into the record screens, and no legacy data has been migrated. Server/API persistence and company/site scoping must be verified before records are copied.

## Migration requirements

- Export a v3 backup from every browser/device containing records; it includes local attachments and a SHA-256 integrity digest. Legacy v2 backups do not include attachment contents.
- Map existing store IDs without regenerating them; retain original values and timestamps.
- Assign each old record to an approved company/site before enabling scoped access.
- Compare source/export and target row counts and hashes, then have the owner reconcile exceptions.
- Keep the old local data read-only until the owner accepts the migration and restore procedure.
- Never seed fake permits, approvals, audit events or worker records.

## Record API read contract

`GET /api/records?store=<store>` requires a valid Supabase access token and an active profile. Row-level security in Supabase remains responsible for store permissions and company/site boundaries. Reads return at most 100 rows by default; callers may request `limit=1..200` and `offset=0..1000000`. The response includes `page.hasMore` and `page.nextOffset` for bounded pagination. The record screens do not call this endpoint yet.

