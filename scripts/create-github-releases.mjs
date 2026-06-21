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

function parseArgs(argv) {
  const options = {
    dispatchPublish: false,
    dryRun: false,
    prerelease: false,
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
const releases = releasePackages.map((packageInfo) => {
  const packageVersion = readPackageVersion(packageInfo);
  if (options.version && options.version !== packageVersion) {
    throw new Error(
      `${packageInfo.name} is version ${packageVersion}, not ${options.version}`,
    );
  }

  const version = options.version ?? packageVersion;
  return {
    ...packageInfo,
    notes: releaseNotesForPackage(packageInfo.name, version),
    tag: tagForPackage(packageInfo.name, version),
    version,
  };
});

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
          `tag=${release.tag}`,
        ]),
        `Dispatching publish workflow for ${release.tag}`,
      );
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
