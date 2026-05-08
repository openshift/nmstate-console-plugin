# Contributing to nmstate-console-plugin

Contributions are welcome. This document covers coding standards, testing, and the pull request process.

For initial setup (clone, install, running the dev server), see [README.md](README.md#quick-start).

## Coding Standards

### TypeScript & React

- Functional components only, typed with `FC` from React
- Use PatternFly 6 components for all UI — no custom HTML elements for standard patterns
- Define props as TypeScript `type` in the same file or a co-located `types.ts`
- Default export for page-level components
- Use path aliases for cross-directory imports: `@utils/*`, `@models`, `@images/*`

### Internationalization

All user-visible strings must be translated:

```tsx
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

const MyComponent: FC = () => {
  const { t } = useNMStateTranslation();
  return <p>{t('My translatable string')}</p>;
};
```

Never hardcode English text in JSX. Run `npm run i18n` to extract new translation keys.

### Linting & Formatting

The project uses ESLint + Prettier with enforced import sorting:

```bash
npm run lint          # Check for lint errors
npm run lint:fix      # Auto-fix lint errors
```

Key rules:
- **Prettier:** single quotes, trailing commas, 100-char print width
- **Import sorting:** enforced via `simple-import-sort` — React first, then external packages, then internal paths, then relative imports, then CSS
- **No unused variables:** `@typescript-eslint/no-unused-vars` is set to `error`
- **No prop-types:** disabled (TypeScript types are used instead)

### Adding a new view

1. Create a directory under `src/views/{view-name}/`
2. Add a `manifest.ts` exporting `{View}ExposedModules` and `{View}Extensions`
3. Register the extensions in `plugin-manifest.ts`
4. Add a K8s model in `src/console-models/` if needed
5. Export the model from `src/console-models/index.ts`

### Adding a K8s resource model

Create a new file in `src/console-models/` following the existing pattern:

```typescript
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

const MyResourceModel: K8sModel = {
  apiGroup: 'nmstate.io',
  apiVersion: 'v1',
  kind: 'MyResource',
  plural: 'myresources',
  // ... other fields
};

export default MyResourceModel;
```

Export it from `src/console-models/index.ts` and use `@models` to import.

## Testing

### Unit tests (Jest)

```bash
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
npm run test:updateSnapshot # Update snapshots
```

Tests live alongside source files as `*.test.ts(x)` or `*.spec.ts(x)`. The SDK and i18n are mocked via `src/__mocks__/`.

### E2E tests (Cypress)

```bash
npm run cypress          # Headless Chrome
npm run cypress:open     # Interactive mode
```

E2E specs live in `cypress/e2e/`. Tests run against http://localhost:9000 by default (override with `BRIDGE_BASE_ADDRESS`).

### What to test

- New components: at minimum, test that they render without errors
- Utility functions: test edge cases and expected transformations
- E2E: cover user-facing workflows for new views or significant UI changes

## Pull Request Process

### Commit messages

Follow the existing commit style — short imperative subject line describing the change. Reference the Jira/Bugzilla ID when applicable (e.g., `CNV-12345: add physical networks page`).

### Before submitting

1. Run `npm run lint` and fix any errors
2. Run `npm test` and ensure tests pass
3. Test your changes in the console (run `npm run start-console`)
4. Update translations if you added user-visible strings (`npm run i18n`)

### Review

- PRs require approval from at least one reviewer listed in [OWNERS](OWNERS)
- Merge via merge commit (the repo uses merge commits, not squash)
- CI runs Prow-based checks — ensure `test-prow-e2e.sh` passes

## License

This project is licensed under the [Apache License 2.0](LICENSE).
