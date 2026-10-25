import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await markdownFiles(path));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path);
    }
  }
  return files.sort();
}

const root = resolve(process.argv[2] || fileURLToPath(new URL('..', import.meta.url)));
// Yarn's built-in commands are not references to package.json scripts. An
// explicit `yarn run NAME` always names a script, including built-in names.
const yarnBuiltins = new Set([
  'add', 'autoclean', 'bin', 'cache', 'check', 'config', 'constraints', 'create',
  'dedupe', 'dlx', 'exec', 'generate-lock-entry', 'global', 'help', 'import',
  'info', 'init', 'install', 'link', 'list', 'login', 'logout', 'node', 'npm',
  'owner', 'pack', 'patch', 'patch-commit', 'plugin', 'policies', 'publish',
  'rebuild', 'remove', 'set', 'tag', 'team', 'unlink', 'unplug', 'up', 'upgrade',
  'upgrade-interactive', 'version', 'versions', 'why', 'workspace', 'workspaces'
]);

function linkTargets(line) {
  const targets = [];
  // Inline links/images, angle-wrapped paths with spaces, and a parenthesized
  // path segment. Reference definitions are validated as file targets too.
  const inline = /!?\[[^\]\n]*\]\(\s*(?:<([^>\n]*)>|((?:\\.|[^()\s]|\([^()\n]*\))+))(?:\s+["'][^"\n]*["'])?\s*\)/g;
  for (const match of line.matchAll(inline)) {
    targets.push(match[1] ?? match[2]);
  }
  const reference = line.match(/^ {0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/);
  if (reference) {
    targets.push(reference[1] ?? reference[2]);
  }
  return targets;
}

function scriptReferences(line) {
  const scripts = [];
  for (const match of line.matchAll(/\bnpm\s+(?:run|run-script)\s+([\w][\w:.-]*)/g)) {
    scripts.push(match[1]);
  }
  for (const match of line.matchAll(/\bnpm\s+(test|start|stop|restart)\b/g)) {
    scripts.push(match[1]);
  }
  for (const match of line.matchAll(/\byarn\s+(?:(run)\s+)?([\w][\w:.-]*)/g)) {
    if (match[1] || !yarnBuiltins.has(match[2])) {
      scripts.push(match[2]);
    }
  }
  return scripts;
}

try {
  const { scripts = {} } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const files = [join(root, 'README.md'), join(root, 'README.vi.md'), ...await markdownFiles(join(root, 'documents'))];
  const errors = [];
  let localTargets = 0;
  let scriptCount = 0;
  for (const file of files) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    let fence = null;
    for (const [index, line] of lines.entries()) {
      const location = `${relative(root, file)}:${index + 1}`;
      // Commands in examples are checked; Markdown link syntax within a fenced
      // code example is not a rendered link and must not become a file check.
      const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})/);
      const wasFenced = fence !== null;
      if (delimiter) {
        if (fence === null) {
          fence = delimiter[1];
        } else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length) {
          fence = null;
        }
      }
      for (const target of wasFenced || delimiter ? [] : linkTargets(line)) {
        // URL schemes and protocol-relative links are external. Pure anchors
        // and shell/template placeholders have no file target to validate.
        if (!target || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(target) || /\$|\{\{|<[^>]*>/.test(target)) {
          continue;
        }
        localTargets += 1;
        let path;
        try {
          // Strip URL components before decoding: `%23` belongs to a filename,
          // whereas a literal `#` starts the unvalidated fragment.
          path = decodeURIComponent(target.split(/[?#]/, 1)[0]).replace(/\\([ ()])/g, '$1');
        } catch {
          errors.push(`${location}: invalid URL encoding in "${target}"`);
          continue;
        }
        const destination = path.startsWith('/') ? resolve(root, `.${path}`) : resolve(dirname(file), path);
        try {
          await access(destination);
        } catch {
          errors.push(`${location}: missing local target "${target}"`);
        }
      }
      for (const script of scriptReferences(line)) {
        scriptCount += 1;
        if (!Object.hasOwn(scripts, script)) {
          errors.push(`${location}: unknown script "${script}"`);
        }
      }
    }
  }
  process.stdout.write(`Checked ${files.length} Markdown files, ${localTargets} local targets, ${scriptCount} script references.\n`);
  if (errors.length > 0) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  }
} catch (error) {
  process.stderr.write(`Documentation check failed: ${error.message}\n`);
  process.exitCode = 1;
}
