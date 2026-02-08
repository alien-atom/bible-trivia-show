import { getUncachableGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

async function pushWikiFiles() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'bible-trivia-show';
  const wikiDir = '/home/runner/workspace/wiki';

  console.log(`Pushing wiki files to ${owner}/${repo}...`);

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const latestCommitSha = ref.object.sha;
  const { data: latestCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const baseTreeSha = latestCommit.tree.sha;

  const wikiFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.md'));
  const treeItems: any[] = [];

  // Upload wiki files
  for (const file of wikiFiles) {
    const content = fs.readFileSync(path.join(wikiDir, file), 'utf-8');
    const { data: blob } = await octokit.git.createBlob({
      owner, repo,
      content,
      encoding: 'utf-8',
    });
    treeItems.push({
      path: `wiki/${file}`,
      sha: blob.sha,
      mode: '100644',
      type: 'blob',
    });
    console.log(`  Uploaded: wiki/${file}`);
  }

  // Create updated README
  const readmeContent = `# Bible Trivia Show

A feature-rich Bible quiz web application designed to help believers test and grow their scriptural knowledge through interactive quizzes, multiplayer battles, and a Jeopardy-style grid game.

## Features

- **30+ Bible Book Categories** covering Old and New Testament
- **Email OTP Authentication** via SendGrid
- **Real-time PvP Battles** with Socket.io
- **Bible Trivia Grid Game** - Jeopardy-style multiplayer (2-6 players)
- **Three-Tier Ranking System** with global and territory leaderboards
- **Gamification** with streaks, scores, and achievements
- **The Messiah's Path** - Special featured journey (Coming Soon)
- **Light/Dark Mode** with cream/ivory themed design
- **Background Music & Sound Effects**
- **Social Sharing** capabilities

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| State Management | React Context + TanStack Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL + Drizzle ORM |
| Real-time | Socket.io |
| Authentication | Email OTP via SendGrid |
| Audio | Howler.js |

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/${owner}/${repo}.git
cd ${repo}

# Install dependencies
npm install

# Set up environment variables
# DATABASE_URL=postgresql://user:password@host:port/database

# Push database schema
npm run db:push

# Start development server
npm run dev
\`\`\`

The app will be available at \`http://localhost:5000\`.

## Game Modes

### Solo Quiz
Test your Bible knowledge with 10-question quizzes across 30+ categories with a 30-second timer per question.

### Real-time PvP Battle
Go head-to-head against another player in real-time with 5 rounds of fast-paced trivia.

### Bible Trivia Grid Game
A Jeopardy-style local multiplayer game for 2-6 players with Easy, Medium, and Hard columns, point values from 10 to 1,050, and a steal mechanic for incorrect answers.

## Documentation

Full documentation is available in the [\`wiki/\`](wiki/) folder:

- [Home](wiki/Home.md) - Project overview
- [Getting Started](wiki/Getting-Started.md) - Installation and setup
- [Architecture Overview](wiki/Architecture-Overview.md) - Tech stack and design
- [Game Modes](wiki/Game-Modes.md) - Detailed game mode descriptions
- [Authentication System](wiki/Authentication-System.md) - Email OTP flow
- [Database Schema](wiki/Database-Schema.md) - Table definitions
- [API Reference](wiki/API-Reference.md) - REST API endpoints
- [Deployment Guide](wiki/Deployment-Guide.md) - Publishing and deployment

## Contact

- **Email**: hello@bibletriviashow.com
- **Support**: Debbie from Bible Trivia Show

## License

All rights reserved.
`;

  const { data: readmeBlob } = await octokit.git.createBlob({
    owner, repo,
    content: readmeContent,
    encoding: 'utf-8',
  });
  treeItems.push({
    path: 'README.md',
    sha: readmeBlob.sha,
    mode: '100644',
    type: 'blob',
  });
  console.log('  Uploaded: README.md');

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Add wiki documentation and update README',
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  console.log('Updating main branch...');
  await octokit.git.updateRef({
    owner, repo,
    ref: 'heads/main',
    sha: commit.sha,
    force: true,
  });

  console.log(`\nDone! Repository: https://github.com/${owner}/${repo}`);
  console.log(`Documentation: https://github.com/${owner}/${repo}/tree/main/wiki`);
}

pushWikiFiles().catch(console.error);
