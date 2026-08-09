import { createRequire } from 'node:module';

const { nasmPath } = createRequire(import.meta.url)('./index.cjs');

export { nasmPath };
