// Vitest setup: register @testing-library/jest-dom matchers (toBeInTheDocument,
// etc.) on vitest's expect. Loaded for every test file via vitest.config.ts;
// harmless for the pure (non-DOM) suites.
import '@testing-library/jest-dom/vitest'
