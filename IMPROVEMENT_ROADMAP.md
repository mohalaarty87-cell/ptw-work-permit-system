# PTW System Improvement Roadmap

This is the execution ledger for the user's 100 ordered improvements. Items remain in this order. Mark an item complete only after implementation and verification; do not treat a proposal or scaffold as done.

**Progress: 0/100 complete. Supabase schema, production environment, administrator profile, production sign-in UI, and production redirect settings are in place. Operational screens still use local IndexedDB; the record API and data flow remain unverified end to end.**

## Phase 1 — Shared architecture and data

- [ ] 1. Move records from browser IndexedDB to a central server database. **Status: in progress; the Supabase schema is applied and Vercel has the public connection settings, but no browser data has been migrated and the app still reads local IndexedDB.** See `database/SETUP.md`.
- [ ] 2. Add a server API that validates and persists changes. **Status: authenticated API scaffold exists and record reads are paginated; screens are not wired to it and authenticated persistence remains unverified.**
- [ ] 3. Replace local role selection with authenticated employee accounts. **Status: Supabase sign-in is deployed and the production redirect allowlist is configured; account-owner sign-in/profile flow still needs runtime confirmation.**
- [ ] 4. Enforce authorization at the server/data boundary.
- [ ] 5. Scope users to approved companies, sites, and departments.
- [ ] 6. Attribute every change to a verified user identity.
- [ ] 7. Use a relational database for linked operational records.
- [ ] 8. Isolate data between customer organizations where applicable.
- [ ] 9. Migrate existing browser records without losing data. **Safety groundwork is implemented but not yet runtime-verified:** local backup v3 includes attachment contents, a SHA-256 integrity digest, and conflict-safe merge; device-to-server migration remains pending.
- [ ] 10. Support safe offline work and conflict-aware synchronization.

## Phase 2 — Permit lifecycle

- [ ] 11. Define explicit permit states and transitions.
- [ ] 12. Assign roles for creating, reviewing, approving, suspending, and closing permits.
- [ ] 13. Block approval until required checks are complete.
- [ ] 14. Record permit start, expiry, shift, and time zone.
- [ ] 15. Warn before permit expiry and block expired permits.
- [ ] 16. Add a stop-work/suspension action with a reason.
- [ ] 17. Require reasons for rejection, cancellation, suspension, and reopening.
- [ ] 18. Record shift handover with outgoing and incoming owners.
- [ ] 19. Link permits to related isolation records and certificates.
- [ ] 20. Create unique, readable permit numbers and QR links.

## Phase 3 — Hazard and control data

- [ ] 21. Configure checklists by work type.
- [ ] 22. Link a risk assessment/job safety analysis to each permit.
- [ ] 23. Record measurement values, units, timestamps, and tester identity.
- [ ] 24. Configure approved measurement limits by task and site.
- [ ] 25. Record energy sources, isolation steps, and isolation verification.
- [ ] 26. Track calibration status for measurement equipment.
- [ ] 27. Record authorized workers on each job.
- [ ] 28. Record attendants, supervisors, and rescue arrangements where required.
- [ ] 29. Version approved safety forms and preserve the version used.
- [ ] 30. Print permits as approved, site-ready forms.

## Phase 4 — Personnel, companies, and certificates

- [ ] 31. Notify owners before worker certificates expire.
- [ ] 32. Prevent expired certificates from being attached to new permits.
- [ ] 33. Track employee training, validity, and issuer.
- [ ] 34. Link each person to a company, site, discipline, and approval status.
- [ ] 35. Track contractor approval and supporting documents.
- [ ] 36. Detect duplicate people, companies, and certificate records.
- [ ] 37. Record task/shift attendance where site policy requires it.
- [ ] 38. Protect emergency contact details with restricted access.
- [ ] 39. Provide controlled employee-data updates and periodic reviews.
- [ ] 40. Define retention and deletion rules for personal information.

## Phase 5 — Audit, incidents, and corrective action

- [ ] 41. Store audit events on the server with protected integrity.
- [ ] 42. Record before/after values, actor, time, and reason for changes.
- [ ] 43. Attribute each permit review, approval, rejection, and closure.
- [ ] 44. Separate operational audit trails from security-event logs.
- [ ] 45. Record incidents, near misses, and corrective actions.
- [ ] 46. Assign corrective actions to owners with due dates and closure evidence.
- [ ] 47. Preserve a snapshot of each permit as approved.
- [ ] 48. Configure retention periods according to applicable policy and law.
- [ ] 49. Search audit history by user, date, event, and permit.
- [ ] 50. Forward important security events to central monitoring when available.

## Phase 6 — Notifications and follow-up

- [ ] 51. Add an action inbox for tasks assigned to the signed-in user.
- [ ] 52. Notify reviewers when a permit is submitted.
- [ ] 53. Remind owners about expiring permits and certificates.
- [ ] 54. Escalate overdue actions to an approved alternate/supervisor.
- [ ] 55. Explain rejection reasons and the changes required.
- [ ] 56. Notify the responsible team promptly about stop-work and urgent hazards.
- [ ] 57. Let users manage non-critical notification preferences.
- [ ] 58. Record delivery and acknowledgement where needed.
- [ ] 59. Send daily operational summaries to supervisors.
- [ ] 60. Do not rely on email alone for urgent field hazard communication.

## Phase 7 — Usability, Arabic, and accessibility

- [ ] 61. Make all screens and fields fully RTL/LTR bilingual.
- [ ] 62. Preserve each user's language and theme preference.
- [ ] 63. Optimize all workflows for phones and tablets.
- [ ] 64. Size touch controls for field use.
- [ ] 65. Never communicate risk by color alone.
- [ ] 66. Support keyboard navigation and screen readers.
- [ ] 67. Show specific, actionable validation messages beside fields.
- [ ] 68. Autosave drafts and show the last saved time.
- [ ] 69. Confirm destructive or hard-to-reverse actions.
- [ ] 70. Reuse known company, site, and personnel details safely.

## Phase 8 — Dashboard and reporting

- [ ] 71. Filter records by site, company, work type, period, and status.
- [ ] 72. Define each KPI and its inclusion rules.
- [ ] 73. Highlight expired, suspended, and overdue permits.
- [ ] 74. Show weekly/monthly trends.
- [ ] 75. Chart only work types actually supported by configured data.
- [ ] 76. Report permit rejections and suspensions by reason.
- [ ] 77. Save frequently used report filters.
- [ ] 78. Export branded PDF and Excel reports with scope and generation time.
- [ ] 79. Apply the same site/company scope to reports as to records.
- [ ] 80. Provide a shift-readiness report covering open work, isolations, people, and certificates.

## Phase 9 — Attachments and integrations

- [ ] 81. Store uploads in private file storage, not only browser data.
- [ ] 82. Validate file type/size and scan uploads.
- [ ] 83. Preview attachments before permit approval.
- [ ] 84. Track uploader/time and retain files with the correct record version.
- [ ] 85. Import spreadsheets with a review and error report before saving.
- [ ] 86. Back up both structured data and file contents.
- [ ] 87. Integrate with HR for employee status and certificates where available.
- [ ] 88. Link work sites/equipment to asset registers or site maps.
- [ ] 89. Make QR links open the correct record only after access checks.
- [ ] 90. Integrate with approved mail/messaging without exposing sensitive data in links.

## Phase 10 — Security, reliability, and rollout

- [ ] 91. Apply least privilege and deny access when no rule grants it.
- [ ] 92. Require controlled review before editing an approved permit.
- [ ] 93. Expire inactive sessions and support revocation.
- [ ] 94. Encrypt backups and verify restoration routinely.
- [ ] 95. Monitor failures, save errors, latency, and availability.
- [ ] 96. Test each role against each page and operation.
- [ ] 97. Rehearse stop-work/emergency and connectivity-loss scenarios.
- [ ] 98. Pilot with a small site/team before wider deployment.
- [ ] 99. Maintain release notes and a rollback plan.
- [ ] 100. Roll out site-by-site with training and measured review.

## Execution notes

- Supabase schema and Production connection settings are in place, and the first Auth account has an active Administrator profile. The production browser UI uses Supabase Auth; operational records remain in IndexedDB until a reviewed migration is approved.
- Do not mark database migration, authentication, or operational readiness complete until infrastructure is provisioned, data is migrated, access controls are enforced, and the end-to-end flow is verified.
- No user records or sample operational permits should be fabricated.
- Backup/migration safety work was advanced early because it protects the data needed by item 1; it does not count as a completed central migration.

