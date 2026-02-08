let counter = 0;

function uid(): string {
  return `${Date.now()}-${++counter}`;
}

export function uniqueEmail(): string {
  return `e2e-${uid()}@test.com`;
}

export function uniqueName(): string {
  return `E2E User ${uid()}`;
}

export function uniqueListName(): string {
  return `E2E List ${uid()}`;
}
