# HSE Work Permit and Safety Forms Workspace

The currently deployed application is still a browser-local prototype. Open through a static web server from the project root (IndexedDB requires a browser origin) and start at `index.html`. Open **Reference Forms** to create one of the 12 templates transcribed from the photographs.

## Source material and data integrity

The supplied folder contained 14 JPEG scans of work permit, isolation, and safety certificate forms. It did **not** contain audit forms, spreadsheets, database exports, or records. The original scans are preserved in the project root and copied to `assets/images/` for in-app reference. A page-by-page field and design analysis is in `REFERENCE_FORM_ANALYSIS.md`. Some small print cannot be read confidently from the angled photos; the system preserves editable fields without inventing that text. No production or demo records are seeded.

## Included

- Dashboard with live counts from local IndexedDB records.
- 12 fillable reference-form templates: hot/cold PTW, electrical lockout request, electrical isolation, general isolation register, mechanical/process isolation, scaffolding, device override, confined space entry, excavation, radiography, and hot perforation.
- Reference-image links, grouped form sections, checkboxes, row-based tables, signature lines, drafts/submission, print styling, soft archiving, CSV summary export, and change trail for reference forms.
- Main PTW references on safety certificates resolve to existing PTW records and persist the linked record ID.
- Existing shared pages for certificates, personnel, companies, findings, reports, archive, settings, users, and audit trail.
- Arabic/English navigation and primary field labels, RTL/LTR, light/dark themes and responsive layouts.
- Local CRUD for primary records, JSON backup/restore and change history.

## Deployment and migration boundary

This application does not yet have shared server storage or real authentication. User role selection is local to the browser session; client-side checks can be bypassed by a technically capable user. Do not use it as the authoritative production permit system until the backend, authenticated identities, server-side authorization, backup/restore, and safety validation are complete.

The first shared-storage schema is drafted in `database/migrations/001_initial_schema.sql` for Supabase Postgres and Auth. A guarded API scaffold is in `api/`; neither is connected to the UI or a live database yet. The schema has **not** been applied because this Vercel project has no database connection. See `database/SETUP.md` and `IMPROVEMENT_ROADMAP.md` for setup and ordered execution. Provision and connect the database before switching the application away from IndexedDB. Preserve/export each browser's records and reconcile them before migration; do not assume Vercel deployment contains local browser data.

Backups currently include structured records and form archive metadata, but not binary attachment contents. No audit form appears in the supplied images; the separate audit page is not derived from those photographs.

