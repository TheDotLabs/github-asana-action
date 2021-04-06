import core from "@actions/core";

const github = require("@actions/github");
const { handleCommitPushAsana, handlePRAsana } = require("./asana");


export function handleGitEvent(ASANA_PAT: string, PULL_REQUEST: any, EVENT_NAME: string, COMMITS: any[], TARGETS_COMMITS_PUSH: string, TARGETS_PR_RAISE: string, TARGETS_PR_MERGE: string, ACTION: string) {
  if (!ASANA_PAT) {
    throw {
      message:
        "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
    };
  }

  const ASANA_TASK_LINK_REGEX = new RegExp(
    `https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?`,
    "ig"
  );

  if (PULL_REQUEST != null) {
    core.info('Handling PR event...')
    let targetsPRRaise = TARGETS_PR_RAISE ? JSON.parse(TARGETS_PR_RAISE) : [];
    let targetsPRMerge = TARGETS_PR_MERGE ? JSON.parse(TARGETS_PR_MERGE) : [];

    const prUrl = `${ PULL_REQUEST.html_url }`;
    const prIsMerged = PULL_REQUEST.merged;
    const prTitle = PULL_REQUEST.title;

    let parseAsanaURL;
    while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(PULL_REQUEST.body)) !== null) {
      let taskId = parseAsanaURL?.groups?.task;
      core.info(`Found task id: ${ taskId }`);

      if (taskId) {
        handlePRAsana(
          ASANA_PAT,
          taskId,
          prUrl,
          prIsMerged,
          PULL_REQUEST,
          targetsPRRaise,
          targetsPRMerge,
          prTitle,
          ACTION
        ).then(() => {
          core.info(`Asana Task: ${ taskId } updated`);
        }).catch((reason: any) => {
          core.error(reason);
        });
      } else {
        core.info(`Task id null/empty!`);
      }
    }
  } else if (EVENT_NAME === 'push') {
    core.info('Handling Commits Push event...')
    let targets = TARGETS_COMMITS_PUSH ? JSON.parse(TARGETS_COMMITS_PUSH) : [];

    let commit;
    for (commit of COMMITS) {
      // Commit Message
      const rawMessage = commit.message;
      let message = rawMessage.split('\n')[0];
      for (let i = 0; i < rawMessage.split('\n').length; i++) {
        const line = rawMessage.split('\n')[i];
        if (i !== 0 && line !== "" && !line.includes('app.asana.com') && !line.includes('Signed-off-by:')) {
          message = message.concat(`\n\n${ line }`);
        }
      }

      const commitUrl = commit.url;
      const committerName = commit.committer.username;

      let parseAsanaURL;
      while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(rawMessage)) !== null) {
        let taskId = parseAsanaURL?.groups?.task;
        core.info(`Found task id: ${ taskId }`);

        if (taskId) {
          handleCommitPushAsana(
            ASANA_PAT,
            targets,
            taskId,
            commitUrl,
            committerName,
            message,
          ).then(() => {
            core.info(`Asana Task: ${ taskId } updated`);
          }).catch((reason: any) => {
            core.error(reason);
          });
        } else {
          core.info(`Task id null/empty!`);
        }
      }
    }
  } else {
    core.info('No event found to work upon');
  }
}

try {
  const githubContext = github.context;
  console.log(JSON.stringify(githubContext));
  const ASANA_PAT = core.getInput("asana-token");
  const TARGETS_COMMIT_PUSH = core.getInput("targets_commit_push");
  const TARGETS_PR_RAISE = core.getInput("targets_pr_raise");
  const TARGETS_PR_MERGE = core.getInput("targets_pr_merge");

  const COMMITS = githubContext.payload.commits;
  const EVENT_NAME = githubContext.eventName;
  const PULL_REQUEST = githubContext.payload.pull_request;
  const ACTION = githubContext.payload.action;

  handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMIT_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE, ACTION);
} catch (error) {
  core.error(error.message);
}

