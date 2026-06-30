/**
 * Structural HTML comparison and visual side-by-side viewer.
 *
 * Compares email HTML outputs by extracting visible content (text, links, images)
 * rather than doing byte-for-byte comparison, which would unfairly penalize
 * libraries that produce different wrapper structures (e.g. MJML table layouts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, '..', 'results');

export interface Structure {
  texts: string[];
  links: { text: string; href: string }[];
  images: { src: string; alt: string }[];
}

export interface ConformanceResult {
  match: boolean;
  score: number; // 0-100
  textMatch: boolean;
  linksMatch: boolean;
  imagesMatch: boolean;
  missingTexts: string[];
  missingLinks: { text: string; href: string }[];
  missingImages: { src: string; alt: string }[];
  extraTexts: string[];
}

/**
 * Strip invisible Unicode characters that renderers inject for email client
 * compatibility (MJML button padding, jsx-email zero-width spacers, etc.).
 */
const INVISIBLE_RE =
  /[\u00A0\u200B-\u200F\u2028-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;

function normalizeText(s: string): string {
  return s.replace(INVISIBLE_RE, '').replace(/\s+/g, ' ').trim();
}

/**
 * Decode common HTML entities.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Extract visible text content from HTML, stripping tags and normalizing whitespace.
 */
function extractTexts(html: string): string[] {
  // Remove style/script blocks and HTML comments
  let cleaned = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Remove all tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities, then strip invisible characters
  cleaned = normalizeText(decodeEntities(cleaned));

  // Split into meaningful text chunks
  const chunks = cleaned
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '·');

  // Group into logical text segments (2-8 words each)
  const segments: string[] = [];
  let current: string[] = [];
  for (const chunk of chunks) {
    current.push(chunk);
    // Break on sentence-ending punctuation or after ~6 words
    if (/[.!?,;:]$/.test(chunk) || current.length >= 6) {
      segments.push(current.join(' '));
      current = [];
    }
  }
  if (current.length > 0) segments.push(current.join(' '));

  return segments;
}

/**
 * Extract all links from HTML.
 */
function extractLinks(html: string): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null = linkRegex.exec(html);
  while (match !== null) {
    const href = match[1];
    // Strip tags, decode entities, normalize invisible chars
    const text = normalizeText(
      decodeEntities(match[2].replace(/<[^>]+>/g, '')),
    );
    if (text.length > 0) {
      links.push({ text, href });
    }
    match = linkRegex.exec(html);
  }
  return links;
}

/**
 * Extract all images from HTML.
 */
function extractImages(html: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = [];
  const imgRegex = /<img\s[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null = imgRegex.exec(html);
  while (match !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    images.push({ src, alt });
    match = imgRegex.exec(html);
  }
  return images;
}

/**
 * Parse HTML into a content structure.
 */
export function parseStructure(html: string): Structure {
  return {
    texts: extractTexts(html),
    links: extractLinks(html),
    images: extractImages(html),
  };
}

/**
 * Compare two structures and return conformance result.
 */
export function compareStructure(
  target: Structure,
  output: Structure,
): ConformanceResult {
  const missingTexts = target.texts.filter(
    (t) => !output.texts.some((ot) => ot.includes(t) || t.includes(ot)),
  );
  const extraTexts = output.texts.filter(
    (t) => !target.texts.some((ot) => ot.includes(t) || t.includes(ot)),
  );

  const missingLinks = target.links.filter(
    (l) => !output.links.some((ol) => ol.href === l.href && ol.text === l.text),
  );
  const missingImages = target.images.filter(
    (i) => !output.images.some((oi) => oi.src === i.src),
  );

  const textMatch = missingTexts.length === 0;
  const linksMatch = missingLinks.length === 0;
  const imagesMatch = missingImages.length === 0;
  const match = textMatch && linksMatch && imagesMatch;

  // Score: each text segment, link, and image is worth equal points
  const totalItems =
    target.texts.length + target.links.length + target.images.length;
  const missingCount =
    missingTexts.length + missingLinks.length + missingImages.length;
  const score =
    totalItems > 0
      ? Math.round(((totalItems - missingCount) / totalItems) * 100)
      : 100;

  return {
    match,
    score,
    textMatch,
    linksMatch,
    imagesMatch,
    missingTexts,
    missingLinks,
    missingImages,
    extraTexts,
  };
}

/**
 * Full conformance check: parse both HTMLs and compare.
 */
export function checkConformance(
  targetHtml: string,
  outputHtml: string,
): ConformanceResult {
  const targetStructure = parseStructure(targetHtml);
  const outputStructure = parseStructure(outputHtml);
  return compareStructure(targetStructure, outputStructure);
}

/**
 * Generate a side-by-side HTML viewer for visual comparison.
 */
export function generateSideBySide(
  targetHtml: string,
  outputs: { name: string; html: string; conformance: ConformanceResult }[],
): string {
  const frames = outputs.map(
    (o) => `
    <div class="col">
      <h2>${escapeHtml(o.name)} <span class="badge ${o.conformance.match ? 'pass' : 'partial'}">${o.conformance.score}%</span></h2>
      <iframe srcdoc="${escapeAttr(o.html)}" width="100%" height="800" frameborder="0" loading="lazy"></iframe>
    </div>`,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Benchmark – Side-by-Side Comparison</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
    h1 { text-align: center; margin-bottom: 8px; font-size: 24px; }
    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 24px; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(${outputs.length + 1}, 1fr); gap: 16px; max-width: 100%; }
    .col { background: #1e293b; border-radius: 12px; padding: 16px; overflow: hidden; }
    .col h2 { font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .col iframe { border-radius: 8px; background: #fff; min-height: 800px; }
    .badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
    .badge.pass { background: #065f46; color: #6ee7b7; }
    .badge.partial { background: #78350f; color: #fbbf24; }
    .diffs { margin-top: 12px; font-size: 12px; color: #94a3b8; max-height: 200px; overflow-y: auto; }
    .diffs h3 { font-size: 12px; color: #f87171; margin-bottom: 4px; }
    .diffs li { margin-bottom: 2px; }
  </style>
</head>
<body>
  <h1>Email Template Comparison</h1>
  <p class="subtitle">Target (solid-email) vs each library's output</p>
  <div class="grid">
    <div class="col">
      <h2>Target (solid-email)</h2>
      <iframe srcdoc="${escapeAttr(targetHtml)}" width="100%" height="800" frameborder="0" loading="lazy"></iframe>
    </div>
    ${frames.join('\n    ')}
  </div>
  <script>
    // Auto-resize iframes to content height
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.addEventListener('load', () => {
        try {
          const h = iframe.contentDocument.body.scrollHeight;
          iframe.style.height = Math.min(h + 20, 1200) + 'px';
        } catch(e) {}
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Save the side-by-side comparison HTML to disk.
 */
export function saveSideBySide(
  targetHtml: string,
  outputs: { name: string; html: string; conformance: ConformanceResult }[],
): string {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const html = generateSideBySide(targetHtml, outputs);
  const path = join(RESULTS_DIR, 'comparison.html');
  writeFileSync(path, html, 'utf-8');
  return path;
}
