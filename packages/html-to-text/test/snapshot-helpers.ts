import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'vitest';
import type {
  CompiledFunction,
  HtmlToTextOptions,
  MetaData,
} from '../src/index';

function stableSerialize(value: unknown): string {
  const seen = new WeakSet<object>();
  return (
    JSON.stringify(
      value,
      (_key: string, current: unknown): unknown => {
        if (typeof current === 'function') {
          return `[Function ${current.name || 'anonymous'}]`;
        }
        if (typeof current === 'object' && current !== null) {
          if (seen.has(current)) {
            return '[Circular]';
          }
          seen.add(current);
          if (Array.isArray(current)) {
            return current;
          }
          const sorted: Record<string, unknown> = {};
          const record = current as Record<string, unknown>;
          for (const objectKey of Object.keys(record).sort()) {
            sorted[objectKey] = record[objectKey];
          }
          return sorted;
        }
        return current;
      },
      2,
    ) ?? String(value)
  );
}

interface SnapshotTitleParams {
  html?: string | undefined;
  metadata?: MetaData | undefined;
  options?: HtmlToTextOptions | undefined;
  title?: string | undefined;
}

interface SnapshotParams extends SnapshotTitleParams {
  convert: (
    html: string,
    options?: HtmlToTextOptions | undefined,
    metadata?: MetaData | undefined,
  ) => string;
  input: string;
}

interface CompiledSnapshotParams extends SnapshotTitleParams {
  convert: CompiledFunction;
  input: string;
}

interface DocumentSnapshotParams
  extends Omit<SnapshotParams, 'html' | 'input'> {
  callerFileUrl?: string | undefined;
  documentPath: string;
}

interface CompiledDocumentSnapshotParams
  extends Omit<CompiledSnapshotParams, 'html' | 'input'> {
  callerFileUrl?: string | undefined;
  documentPath: string;
}

export function snapshotTitle({
  title = undefined,
  html,
  options = undefined,
  metadata = undefined,
}: SnapshotTitleParams): string {
  const sections = [];
  if (title !== undefined) {
    sections.push(title);
  }
  if (html !== undefined) {
    sections.push(`\`\`\`html\n${html}\n\`\`\``);
  }
  if (options !== undefined) {
    sections.push(`\`\`\`options\n${stableSerialize(options)}\n\`\`\``);
  }
  if (metadata !== undefined) {
    sections.push(`\`\`\`metadata\n${stableSerialize(metadata)}\n\`\`\``);
  }
  return sections.join('\n\n');
}

function expectSnapshotValue(result: string, message: string): void {
  if (message === '') {
    expect(result).toMatchSnapshot();
    return;
  }

  expect(result).toMatchSnapshot(message);
}

export function expectSnapshot(params: SnapshotParams): void {
  const {
    convert,
    html = undefined,
    input,
    metadata = undefined,
    options = undefined,
    title = undefined,
  } = params;
  const result = convert(input, options, metadata);
  const message = snapshotTitle({
    html: html === undefined ? input : html,
    metadata: metadata,
    options: options,
    title: title,
  });

  expectSnapshotValue(result, message);
}

export function expectCompiledSnapshot(params: CompiledSnapshotParams): void {
  const {
    convert,
    html = undefined,
    input,
    metadata = undefined,
    options = undefined,
    title = undefined,
  } = params;
  const result = convert(input, metadata);
  const message = snapshotTitle({
    html: html === undefined ? input : html,
    metadata: metadata,
    options: options,
    title: title,
  });

  expectSnapshotValue(result, message);
}

function loadDocument(
  documentPath: string,
  callerFileUrl: string | undefined = undefined,
): string {
  const filePath =
    callerFileUrl === undefined
      ? resolve(process.cwd(), documentPath)
      : fileURLToPath(new URL(documentPath, callerFileUrl));

  return readFileSync(filePath, 'utf8');
}

export function expectDocumentSnapshot({
  callerFileUrl = undefined,
  convert,
  documentPath,
  metadata = undefined,
  options = undefined,
  title = undefined,
}: DocumentSnapshotParams): void {
  const input = loadDocument(documentPath, callerFileUrl);
  const result = convert(input, options, metadata);
  const message = snapshotTitle({
    metadata: metadata,
    options: options,
    title: title ?? `document: ${documentPath}`,
  });

  expectSnapshotValue(result, message);
}

export function expectCompiledDocumentSnapshot({
  callerFileUrl = undefined,
  convert,
  documentPath,
  metadata = undefined,
  options = undefined,
  title = undefined,
}: CompiledDocumentSnapshotParams): void {
  const input = loadDocument(documentPath, callerFileUrl);
  const result = convert(input, metadata);
  const message = snapshotTitle({
    metadata: metadata,
    options: options,
    title: title ?? `document: ${documentPath}`,
  });

  expectSnapshotValue(result, message);
}
