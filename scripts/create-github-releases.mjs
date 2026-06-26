import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  readPackageVersion,
  releaseNotesForPackage,
  releasePackages,
  tagForPackage,
} from './release-packages.mjs';

function parsePackageVersion(value) {
  const separator = value.lastIndexOf('@');
  if (separator <= 0 || separator === value.length - 1) {
    throw new Error(
      `Expected --package-version value to look like @scope/name@1.2.3, got ${value}`,
    );
  }

  return [value.slice(0, separator), value.slice(separator + 1)];
}

function parseArgs(argv) {
  const options = {
    dispatchPublish: false,
    dryRun: false,
    prerelease: false,
    packageVersions: new Map(),
    version: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dispatch-publish') {
      options.dispatchPublish = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--prerelease') {
      options.prerelease = true;
      continue;
    }
    if (arg === '--version') {
      const value = argv[index + 1];
      if (!value) throw new Error('Missing value for --version');
      options.version = value;
      index += 1;
      continue;
    }

    if (arg === '--package-version') {
      const value = argv[index + 1];
      if (!value) throw new Error('Missing value for --package-version');
      const [packageName, version] = parsePackageVersion(value);
      options.packageVersions.set(packageName, version);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function runGh(args, options = {}) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  });

  return result;
}

function assertGhSuccess(result, action) {
  if (result.status === 0) return;

  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join('\n')
    .trim();
  throw new Error(`${action} failed${output ? `:\n${output}` : ''}`);
}

const options = parseArgs(process.argv.slice(2));
const packageVersions = new Map(options.packageVersions);
const releaseTargets =
  options.version || packageVersions.size === 0
    ? releasePackages
    : releasePackages.filter((packageInfo) =>
        packageVersions.has(packageInfo.name),
      );

const releases = releaseTargets.map((packageInfo) => {
  const packageVersion = readPackageVersion(packageInfo);
  const requestedVersion =
    packageVersions.get(packageInfo.name) ?? options.version;
  if (requestedVersion && requestedVersion !== packageVersion) {
    throw new Error(
      `${packageInfo.name} is version ${packageVersion}, not ${requestedVersion}`,
    );
  }

  packageVersions.delete(packageInfo.name);

  const version = requestedVersion ?? packageVersion;
  return {
    ...packageInfo,
    notes: releaseNotesForPackage(packageInfo.name, version),
    tag: tagForPackage(packageInfo.name, version),
    version,
  };
});

if (packageVersions.size > 0) {
  throw new Error(
    `Unknown release package(s): ${Array.from(packageVersions.keys()).join(', ')}`,
  );
}

for (const release of releases) {
  console.log(`${options.dryRun ? 'Would create' : 'Creating'} ${release.tag}`);
}

if (options.dryRun) {
  process.exit(0);
}

for (const release of releases) {
  const existing = runGh(['release', 'view', release.tag]);
  if (existing.status === 0) {
    throw new Error(`GitHub release ${release.tag} already exists`);
  }
}

const tempDir = mkdtempSync(path.join(tmpdir(), 'solid-email-releases-'));

try {
  for (const release of releases) {
    const notesFile = path.join(
      tempDir,
      `${release.name.replaceAll('/', '-').replaceAll('@', '')}.md`,
    );
    writeFileSync(notesFile, release.notes);

    const args = [
      'release',
      'create',
      release.tag,
      '--title',
      `${release.name} v${release.version}`,
      '--notes-file',
      notesFile,
      '--target',
      process.env.GITHUB_SHA ?? 'HEAD',
    ];

    if (options.prerelease) args.push('--prerelease');

    assertGhSuccess(runGh(args), `Creating ${release.tag}`);

    if (options.dispatchPublish) {
      const ref = process.env.GITHUB_REF_NAME ?? 'main';
      assertGhSuccess(
        runGh([
          'workflow',
          'run',
          'release.yml',
          '--ref',
          ref,
          '-f',
          `package=${release.name}`,
          '-f',
          `version=${release.version}`,
        ]),
        `Dispatching publish workflow for ${release.tag}`,
      );
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
