import { test } from 'vitest';
import { compile } from '../../src/index';
import { expectCompiledSnapshot } from '../snapshot-helpers';

const defaultConvert = compile();

test('should decode &#128514; to 😂', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: '&#128514;',
  });
});

test('should decode &lt;&gt; to <>', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: '<span>span</span>, &lt;not a span&gt;',
  });
});
