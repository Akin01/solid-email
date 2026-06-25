import { test } from 'vitest';
import { convert } from '../../src/index';
import { expectDocumentSnapshot } from '../snapshot-helpers';

test('should convert invoice fixture document', () => {
  expectDocumentSnapshot({
    callerFileUrl: import.meta.url,
    convert: convert,
    documentPath: './invoice.html',
    options: {
      selectors: [
        { selector: 'table#invoice', format: 'dataTable' },
        { selector: 'table.address', format: 'dataTable' },
      ],
    },
  });
});
