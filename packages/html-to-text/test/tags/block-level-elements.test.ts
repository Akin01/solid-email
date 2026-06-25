import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should render common block-level elements on separate lines with default line breaks number', () => {
  expectSnapshot({
    convert: htmlToText,
    input:
      'a<article>article</article>b<aside>aside</aside>c<div>div</div>d<footer>footer</footer>' +
      'e<form>form</form>f<header>header</header>g<main>main</main>h<nav>nav</nav>i<section>section</section>j',
  });
});
