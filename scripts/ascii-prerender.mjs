// Generates ASCII art for every image referenced in blog MDX files.
// Output: public/ascii/{slug}.txt — one file per image.
// Run before `astro build` via the `prerender:ascii` npm script.
//
// Uses ascii-image-converter (https://github.com/TheZoraiz/ascii-image-converter).
// Install once: go install github.com/TheZoraiz/ascii-image-converter@latest
// The binary lives at $(go env GOPATH)/bin/ascii-image-converter.
//
// Flags used:
//   --width 120   column count (matched to COLS in ascii-image.ts)
//   --negative    bright pixels → dense chars (correct for dark-bg sites)

import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT    = resolve(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'ascii');
const WIDTH   = 120;

// Same slug logic as src/scripts/ascii-image.ts — must stay in sync.
function imgSlug(src) {
  if (src.startsWith('/')) {
    return src.slice(1).replace(/[/.]/g, '-').replace(/-+$/,'');
  }
  let h = 5381;
  for (let i = 0; i < src.length; i++) {
    h = (Math.imul(31, h) + src.charCodeAt(i)) | 0;
  }
  return 'ext-' + Math.abs(h).toString(36);
}

// Find the ascii-image-converter binary.
function findBin() {
  // Try $GOPATH/bin first, then PATH.
  try {
    const gopath = execSync('go env GOPATH', { encoding: 'utf8' }).trim();
    const bin    = join(gopath, 'bin', 'ascii-image-converter');
    if (existsSync(bin)) return bin;
  } catch { /* go not in PATH */ }
  try {
    execSync('which ascii-image-converter', { encoding: 'utf8' });
    return 'ascii-image-converter';
  } catch { /* not in PATH either */ }
  return null;
}

// Collect every image URL from every MDX file.
function collectImages() {
  const blogDir = join(ROOT, 'src', 'content', 'blog');
  const files   = readdirSync(blogDir).filter(f => f.endsWith('.mdx')).map(f => join(blogDir, f));
  const seen    = new Set();
  for (const file of files) {
    const src = readFileSync(file, 'utf-8');
    for (const [, url] of src.matchAll(/!\[.*?\]\((.*?)\)/g)) {
      if (url && !seen.has(url)) seen.add(url);
    }
  }
  return [...seen];
}

// ascii-image-converter uses CR (\r) to overwrite its "Fetching file from url..."
// progress message in a terminal, but piped stdout captures both writes on the
// same line. Split each line on \r and keep the last segment (last-write-wins,
// exactly what a terminal renders).
function stripCR(raw) {
  return raw
    .split('\n')
    .map(line => line.split('\r').at(-1))
    .join('\n')
    .trim();
}

function runConverter(bin, input, outFile) {
  // Skip animated GIFs — output is unbounded for multi-frame files.
  if (/\.gif$/i.test(input)) throw new Error('GIF skipped (animated)');

  // For local paths, resolve relative to project root.
  const isLocal = input.startsWith('/');
  const target  = isLocal ? join(ROOT, 'public', input) : input;

  const result = spawnSync(
    bin,
    [target, '--width', String(WIDTH), '--negative'],
    { encoding: 'utf8', timeout: 20_000, maxBuffer: 10 * 1024 * 1024 },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || `exit ${result.status}`);
  }

  const clean = stripCR(result.stdout);

  // Reject output that contains an error message rather than ASCII art.
  if (/^Error:/m.test(clean)) {
    throw new Error(clean.match(/^Error:.*/m)?.[0] ?? 'converter error');
  }

  writeFileSync(outFile, clean + '\n', 'utf-8');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const bin = findBin();
if (!bin) {
  console.error(
    '✗ ascii-image-converter not found.\n' +
    '  Install: go install github.com/TheZoraiz/ascii-image-converter@latest',
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const images  = collectImages();
let ok = 0, skip = 0, fail = 0;

for (const url of images) {
  const slug    = imgSlug(url);
  const outFile = join(OUT_DIR, `${slug}.txt`);

  if (existsSync(outFile)) {
    console.log(`  skip  ${slug}.txt  (cached)`);
    skip++;
    continue;
  }

  try {
    runConverter(bin, url, outFile);
    console.log(`  ok    ${slug}.txt  ← ${url.slice(0, 72)}`);
    ok++;
  } catch (err) {
    console.warn(`  fail  ${url.slice(0, 72)}\n         ${err.message}`);
    fail++;
  }
}

console.log(`\nASCII prerender: ${ok} generated, ${skip} cached, ${fail} failed (skipped).`);
