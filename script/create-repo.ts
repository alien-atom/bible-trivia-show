import { getUncachableGitHubClient } from '../server/github';

async function createRepo() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);

    const repoName = 'bible-trivia-show';
    
    try {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Bible Trivia Show - A Bible quiz application with OTP auth, multiplayer battles, Jeopardy-style grid game, and leaderboards.',
        private: false,
        auto_init: false,
      });
      console.log(`Repository created: ${repo.html_url}`);
      console.log(`Clone URL: ${repo.clone_url}`);
      console.log(`\nNext step: Push code with:`);
      console.log(`git remote add github ${repo.clone_url}`);
      console.log(`git push github main`);
    } catch (err: any) {
      if (err.status === 422) {
        console.log(`Repository '${repoName}' already exists for user ${user.login}`);
        console.log(`URL: https://github.com/${user.login}/${repoName}`);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createRepo();
