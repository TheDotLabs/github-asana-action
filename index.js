const core = require("@actions/core");
const github = require("@actions/github");
const {handleCommitPushAsana, handlePRAsana} = require("./src/asana");


function handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMITS_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE) {
    if (!ASANA_PAT) {
        throw {
            message:
                "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
        };
    }

    const ASANA_TASK_LINK_REGEX = new RegExp(
        `https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?`,
        "g"
    );

    if (PULL_REQUEST != null) {
        core.info('Handling PR event...')
        let targetsPRRaise = TARGETS_PR_RAISE ? JSON.parse(TARGETS_PR_RAISE) : [];
        let targetsPRMerge = TARGETS_PR_MERGE ? JSON.parse(TARGETS_PR_MERGE) : [];

        const prUrl = `${PULL_REQUEST.html_url}`;
        const prIsMerged = PULL_REQUEST.merged;

        let parseAsanaURL;
        while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(PULL_REQUEST.body)) !== null) {
            let taskId = parseAsanaURL.groups.task;
            core.info(`Found task id: ${taskId}`);

            if (taskId) {
                handlePRAsana(
                    ASANA_PAT,
                    taskId,
                    prUrl,
                    prIsMerged,
                    PULL_REQUEST,
                    targetsPRRaise,
                    targetsPRMerge
                ).then(() => {
                    core.info(`Asana Task: ${taskId} updated`);
                }).catch((reason) => {
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
            const message = commit.message;
            const commitUrl = commit.url;
            const committerName = commit.committer.username;

            let parseAsanaURL;
            while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(message)) !== null) {
                let taskId = parseAsanaURL.groups.task;
                core.info(`Found task id: ${taskId}`);

                if (taskId) {
                    handleCommitPushAsana(
                        ASANA_PAT,
                        targets,
                        taskId,
                        commitUrl,
                        committerName
                    ).then(() => {
                        core.info(`Asana Task: ${taskId} updated`);
                    }).catch((reason) => {
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

    handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMIT_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE);
} catch (error) {
    core.error(error.message);
}

module.exports.handleGitEvent = handleGitEvent;