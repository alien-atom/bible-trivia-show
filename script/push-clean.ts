import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', '.cache', '.local', '.config', '.npm', '.upm']);
const IGNORE_SCRIPT_FILES = new Set(['push-clean.ts', 'push-fix.ts', 'create-repo.ts', 'create-wiki.ts', 'push-to-github.ts', 'push-wiki.ts']);
const IGNORE_FILES = new Set(['.DS_Store', 'bible-trivia-show.tar.gz', '.replit', 'replit.nix', '.replit.nix']);

function getAllFiles(dir: string, base: string = ''): { path: string; fullPath: string }[] {
  const results: { path: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...getAllFiles(fullPath, relativePath));
    } else {
      if (IGNORE_FILES.has(entry.name)) continue;
      if (entry.name.endsWith('.tar.gz')) continue;
      if (base === 'script' && IGNORE_SCRIPT_FILES.has(entry.name)) continue;
      results.push({ path: relativePath, fullPath });
    }
  }
  return results;
}

function isBinary(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.wav', '.ogg', '.webp', '.pdf', '.zip']);
  return binaryExts.has(ext);
}

function cleanViteConfig(content: string): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
`;
}

function cleanPackageJson(content: string): string {
  const pkg = JSON.parse(content);

  pkg.name = 'bible-trivia-show';

  const replitDeps = Object.keys(pkg.devDependencies || {}).filter(k => k.startsWith('@replit/'));
  for (const dep of replitDeps) {
    delete pkg.devDependencies[dep];
  }

  pkg.scripts = {
    dev: pkg.scripts.dev,
    build: 'BUILD_TARGET=worker tsx script/build.ts',
    'build:server': pkg.scripts.build,
    start: pkg.scripts.start,
    check: pkg.scripts.check,
    'db:push': pkg.scripts['db:push'],
  };

  return JSON.stringify(pkg, null, 2) + '\n';
}

async function pushClean() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'bible-trivia-show';
  const rootDir = '/home/runner/workspace';

  console.log(`Pushing clean version to ${owner}/${repo}...`);

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const latestCommitSha = ref.object.sha;
  const { data: latestCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const baseTreeSha = latestCommit.tree.sha;

  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} files`);

  const treeItems: any[] = [];
  const batchSize = 5;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map(async (file) => {
      try {
        let content: Buffer | string;
        const binary = isBinary(file.fullPath);

        if (file.path === 'package.json') {
          content = cleanPackageJson(fs.readFileSync(file.fullPath, 'utf-8'));
          const { data: blob } = await octokit.git.createBlob({ owner, repo, content: content as string, encoding: 'utf-8' });
          return { path: file.path, sha: blob.sha, mode: '100644', type: 'blob' };
        }

        if (file.path === 'vite.config.ts') {
          content = cleanViteConfig(fs.readFileSync(file.fullPath, 'utf-8'));
          const { data: blob } = await octokit.git.createBlob({ owner, repo, content: content as string, encoding: 'utf-8' });
          return { path: file.path, sha: blob.sha, mode: '100644', type: 'blob' };
        }

        content = fs.readFileSync(file.fullPath);
        const { data: blob } = await octokit.git.createBlob({
          owner, repo,
          content: content.toString(binary ? 'base64' : 'utf-8'),
          encoding: binary ? 'base64' : 'utf-8',
        });
        return { path: file.path, sha: blob.sha, mode: '100644', type: 'blob' };
      } catch (err: any) {
        console.error(`  Skipped ${file.path}: ${err.message}`);
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) if (r) treeItems.push(r);
    console.log(`  Uploaded ${Math.min(i + batchSize, files.length)}/${files.length}`);
  }

  // Remove .replit and replit.nix from the tree by creating a new full tree
  console.log(`Creating tree with ${treeItems.length} files (excluding Replit files)...`);
  const { data: tree } = await octokit.git.createTree({ owner, repo, tree: treeItems });

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Clean up: remove Replit-specific files, update package.json scripts',
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: 'heads/main', sha: commit.sha, force: true });
  console.log(`\nDone! https://github.com/${owner}/${repo}`);
}

pushClean().catch(console.error);
