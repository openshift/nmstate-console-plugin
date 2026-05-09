# nmstate-console-plugin

OpenShift console dynamic plugin for kubernetes-nmstate. Provides UI views for managing node network configuration.

## Key Context Files

Read these files for full context before working on this codebase:

- [AGENTS.md](AGENTS.md) — AI-specific guidance: repo structure, key patterns, coding conventions, review guidelines
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design: plugin registration, component architecture, data flow, dependencies
- [CONTRIBUTING.md](CONTRIBUTING.md) — coding standards, linting rules, PR process, testing

## Quick Reference

**Views:** `src/views/policies/`, `src/views/states/`, `src/views/physical-networks/`, `src/views/nodenetworkconfiguration/`

**Commands:**
- `npm run start-console` — run dev server
- `npm run lint` / `npm run lint:fix` — lint
- `npm test` — Jest unit tests
- `npm run cypress` — Cypress e2e tests
- `npm run i18n` — extract translation keys
