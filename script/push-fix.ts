import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';

async function pushFix() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'bible-trivia-show';

  console.log(`Adding wrangler.jsonc to ${owner}/${repo}...`);

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const latestCommitSha = ref.object.sha;
  const { data: latestCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const baseTreeSha = latestCommit.tree.sha;

  const content = fs.readFileSync('/home/runner/workspace/wrangler.jsonc', 'utf-8');
  const { data: blob } = await octokit.git.createBlob({ owner, repo, content, encoding: 'utf-8' });

  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    base_tree: baseTreeSha,
    tree: [{ path: 'wrangler.jsonc', sha: blob.sha, mode: '100644', type: 'blob' }],
  });

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Add wrangler.jsonc for Cloudflare Workers deployment',
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: 'heads/main', sha: commit.sha, force: true });
  console.log(`Done! https://github.com/${owner}/${repo}`);
}

pushFix().catch(console.error);
