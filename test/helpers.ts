import commonsExtension from '../src/index.js';

/** Build a minimal mock registry for testing. */
export function createMockRegistry() {
  const functions = new Map<string, (args: unknown[]) => unknown>();
  const aggregations = new Map<string, (values: unknown[]) => unknown>();
  return {
    addFunction(name: string, fn: (args: unknown[]) => unknown) {
      functions.set(name, fn);
    },
    addAggregation(name: string, fn: (values: unknown[]) => unknown) {
      aggregations.set(name, fn);
    },
    functions,
    aggregations,
  };
}

export type MockRegistry = ReturnType<typeof createMockRegistry>;

/** Register the extension on a fresh mock registry. */
export function setupRegistry(): MockRegistry {
  const registry = createMockRegistry();
  commonsExtension.register(registry);
  return registry;
}
