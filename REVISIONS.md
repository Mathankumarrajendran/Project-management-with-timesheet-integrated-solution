# Master Revision History Log
## PM System — Software Version Control & Revision Tracking

This document maintains the official, audit-ready software revision history log for the **PM System**. Every software update, patch, minor feature, or major architecture overhaul is tracked here with a unique Revision Number (`R-XXX`), Version Tag (`vX.Y.Z`), Date, Description, and Commit Hash.

---

## Software Revision Standards

- **Revision Format:** `R-001`, `R-002`, `R-003` (sequential increment per release/patch)
- **Version Mapping:** Every Revision maps 1:1 to a Git Tag (`v1.0.0`, `v1.0.1`, `v1.0.2`)
- **Semantic Versioning:** Follows `MAJOR.MINOR.PATCH` rules:
  - `PATCH` (`1.0.X`): Backward-compatible bug fixes and infrastructure adjustments
  - `MINOR` (`1.X.0`): New backward-compatible feature modules
  - `MAJOR` (`X.0.0`): Architectural overhauls or breaking API changes

---

## Revision Summary Table

| Revision | Version | Release Date | Release Type | Commit | Description | Release Document |
|---|---|---|---|---|---|---|
| **R-001** | `v1.0.0` | 2026-07-28 | Major (Initial) | `6a20aaf` | Initial baseline release — 13 functional modules | [v1.0.0.md](file:///c:/Users/HP/Desktop/AI%20learnings/Project%20management/pm-system/RELEASE_NOTES/v1.0.0.md) |
| **R-002** | `v1.0.1` | 2026-07-28 | Patch | `33bd99d` | Full-stack performance optimization patch | [v1.0.1.md](file:///c:/Users/HP/Desktop/AI%20learnings/Project%20management/pm-system/RELEASE_NOTES/v1.0.1.md) |
| **R-003** | `v1.0.2` | 2026-07-29 | Patch | `034ccb6` | Hostinger VPS deployment, CORS fix, Client Portal fix, native DB seed | [v1.0.2.md](file:///c:/Users/HP/Desktop/AI%20learnings/Project%20management/pm-system/RELEASE_NOTES/v1.0.2.md) |

---

## Detailed Revision Records

### Revision R-003 (`v1.0.2`)
- **Date:** 2026-07-29
- **Tag:** `v1.0.2`
- **Scope:** Hostinger VPS container deployment, CORS preflight fix, Client Portal empty state fix, runtime dynamic API URL resolution, native JS database seeding (`seed.js`).
- **Files Modified/Created:** 17 files (`docker-compose.prod.yml`, `Dockerfile.prod`, `nginx/pm-system.conf`, `DEPLOYMENT.md`, `seed.js`, `apiClient.ts`, `server.ts`, `page.tsx`).
- **Status:** Verified Live on Hostinger VPS (`http://200.141.5.248:3000`).

---

### Revision R-002 (`v1.0.1`)
- **Date:** 2026-07-28
- **Tag:** `v1.0.1`
- **Scope:** 7 full-stack performance optimizations (Prisma query logging disabled, server-side task filtering, client portal parallelization, PostgreSQL invoice JSON aggregation, notification polling visibility guard, 6 composite DB indexes).
- **Files Modified:** 9 files (`database.ts`, `taskController.ts`, `clientPortalController.ts`, `reportController.ts`, `schema.prisma`, `NotificationBell.tsx`, `page.tsx`).
- **Status:** Merged into `main` and tagged `v1.0.1`.

---

### Revision R-001 (`v1.0.0`)
- **Date:** 2026-07-28
- **Tag:** `v1.0.0`
- **Scope:** Initial baseline release of PM System with complete 13 FR modules (Auth, User Management, Client Management, Project Management, Task Management, Time Tracking, Manager Approvals, Sprint Management, Executive Analytics, Invoicing, Client Portal, Audit Logging, System Settings).
- **Status:** Baseline tagged `v1.0.0`.
