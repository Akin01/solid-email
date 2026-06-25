import { test } from 'vitest';
import { compile } from '../../src/index';
import { expectCompiledSnapshot } from '../snapshot-helpers';

const defaultConvert = compile();

test('should ignore html comments', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: /*html*/ `
    <!--[^-]*-->
    <!-- <h1>Hello World</h1> -->
    text
  `,
  });
});

test('should ignore scripts', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: /*html*/ `
    <script src="javascript.js"></script>
    <script>
      console.log("Hello World!");
    </script>
    <script id="data" type="application/json">{"userId":1234,"userName":"John Doe","memberSince":"2000-01-01T00:00:00.000Z"}</script>
    text
  `,
  });
});

test('should ignore styles', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: /*html*/ `
    <link href="main.css" rel="stylesheet">
    <style type="text/css" media="all and (max-width: 500px)">
      p { color: #26b72b; }
    </style>
    text
  `,
  });
});

test('should not break after special tag followed by an entity', () => {
  expectCompiledSnapshot({
    convert: defaultConvert,
    input: /*html*/ `<style>a{}</style>&apos;<br/><span>text</span>`,
  });
});
