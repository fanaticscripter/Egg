// The browser ESM build is only reachable through csv-stringify's exports
// map, which moduleResolution "node" does not read. Vite resolves it fine at
// build time; this only restores the types.

declare module 'csv-stringify/browser/esm/sync' {
  import { Input, Options } from 'csv-stringify';

  export function stringify(input: Input, options?: Options): string;
}
