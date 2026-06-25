import { readFileSync } from 'node:fs';
import path from 'node:path';

export const releasePackages = [
  {
    name: '@solid-email/html-to-text',
    directory: 'packages/html-to-text',
  },
  {
    name: '@solid-email/render',
    directory: 'packages/render',
  },
  {
    name: '@akin01/solid-email',
    directory: 'packages/solid-email',
  },
];

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function readPackageVersion(packageInfo) {
  const manifest = readJson(path.join(packageInfo.directory, 'package.json'));
  if (manifest.name !== packageInfo.name) {
    throw new Error(
      `Expected ${packageInfo.directory} to be ${packageInfo.name}, found ${manifest.name}`,
    );
  }
  return manifest.version;
}

export function tagForPackage(packageName, version) {
  return `${packageName}@${version}`;
}

export function getChangelogSection(version) {
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`## ${version}`));
  const end =
    start < 0
      ? -1
      : lines.findIndex(
          (line, index) => index > start && line.startsWith('## '),
        );
  const section =
    start < 0 ? [] : lines.slice(start + 1, end < 0 ? undefined : end);
  return section.join('\n').trim() || `Release ${version}`;
}

export function releaseNotesForPackage(packageName, version) {
  return [
    `Package: \`${packageName}\``,
    `Version: \`${version}\``,
    '',
    getChangelogSection(version),
    '',
  ].join('\n');
}
