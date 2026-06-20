import * as PrismImport from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

// Prism ships as CommonJS. Depending on the bundler/runtime, the module can
// appear either as a namespace object or under `default`; normalize that once
// so the rest of CodeBlock can use the Prism API directly.
const PrismImportWithDefault = PrismImport as typeof PrismImport & {
  default?: typeof PrismImport;
};
const Prism: typeof import('prismjs') =
  PrismImportWithDefault.default ?? PrismImport;

// Register Prism component grammars into `Prism.languages`. CodeBlock looks up
// grammars by the `language` prop before calling `Prism.tokenize(...)`.
loadLanguages();

export { Prism };
