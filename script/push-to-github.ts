import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', '.cache', '.local', '.config', '.npm', '.upm', 'script']);
const IGNORE_FILES = new Set(['.DS_Store', 'bible-trivia-show.tar.gz']);

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

async function pushToGitHub() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'bible-trivia-show';
  const rootDir = '/home/runner/workspace';

  console.log(`Pushing files to github.com/${owner}/${repo}...`);

  // Initialize repo with a README first (needed for empty repos)
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# Bible Trivia Show\n\nA Bible quiz application with multiplayer battles, Jeopardy-style grid game, and leaderboards.\n').toString('base64'),
    });
    console.log('Initialized repository with README');
  } catch (err: any) {
    console.log('Repository already initialized');
  }

  // Get the latest commit SHA
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const latestCommitSha = ref.object.sha;
  const { data: latestCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const baseTreeSha = latestCommit.tree.sha;

  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} files to upload`);

  const treeItems: { path: string; sha: string; mode: '100644'; type: 'blob' }[] = [];

  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map(async (file) => {
      try {
        const content = fs.readFileSync(file.fullPath);
        const binary = isBinary(file.fullPath);

        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString(binary ? 'base64' : 'utf-8'),
          encoding: binary ? 'base64' : 'utf-8',
        });

        return {
          path: file.path,
          sha: blob.sha,
          mode: '100644' as const,
          type: 'blob' as const,
        };
      } catch (err: any) {
        console.error(`  Skipped ${file.path}: ${err.message}`);
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) treeItems.push(r);
    }
    console.log(`  Uploaded ${Math.min(i + batchSize, files.length)}/${files.length} files`);
  }

  console.log(`Creating tree with ${treeItems.length} files...`);
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Bible Trivia Show - Full project upload',
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  console.log('Updating main branch...');
  await octokit.git.updateRef({
    owner,
    repo,
    ref: 'heads/main',
    sha: commit.sha,
    force: true,
  });

  console.log(`\nDone! Repository: https://github.com/${owner}/${repo}`);
}

pushToGitHub().catch(console.error);
