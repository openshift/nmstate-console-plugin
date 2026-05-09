# nmstate-console-plugin

OpenShift console dynamic plugin for kubernetes-nmstate. Provides UI views for managing node network configuration.

## Key Context Files

Read these files for full context before working on this codebase:

- [AGENTS.md](AGENTS.md) — AI-specific guidance: repo structure, key patterns, coding conventions, review guidelines
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design: plugin registration, component architecture, data flow, dependencies
- [CONTRIBUTING.md](CONTRIBUTING.md) — coding standards, linting rules, PR process, testing

## Quick Reference

**Stack:** React 18, TypeScript, PatternFly 6, OpenShift Dynamic Plugin SDK, Webpack, i18next

**Path aliases:** `@utils/*` → `src/utils/*`, `@models` → `src/console-models/index.ts`, `@images/*` → `images/*`

**Views:** `src/views/policies/`, `src/views/states/`, `src/views/physical-networks/`, `src/views/nodenetworkconfiguration/`

**Key rules:**
- Use `useNMStateTranslation()` or the `Trans` component for all user-visible strings — never hardcode English
- Use PatternFly 6 components — no custom HTML for standard patterns
- Use SDK hooks (`useK8sWatchResource`, `k8sCreate`, `k8sPatch`) — no direct K8s API calls
- Each view registers via `manifest.ts` → aggregated in `plugin-manifest.ts`
- New K8s resources need a model in `src/console-models/`, exported from `index.ts`

**Linting:** ESLint + Prettier, single quotes, trailing commas, 100-char width, `simple-import-sort`

**Testing:** `npm test` (Jest), `npm run cypress` (Cypress e2e)
