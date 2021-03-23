const core = require("@actions/core");
const github = require("@actions/github");
const asana = require("asana");

async function handlePRAsana(
    asanaPAT,
    taskId,
    prUrl,
    prIsMerged,
    PULL_REQUEST,
    targetsPRRaise,
    targetsPRMerge
) {
    try {
        const client = asana.Client.create({
            defaultHeaders: {"asana-enable": "new-sections,string_ids"},
            logAsanaChangeWarnings: false,
        }).useAccessToken(asanaPAT);

        const task = await client.tasks.findById(taskId);

        if (prIsMerged) {
            await client.tasks.addComment(taskId, {
                text: `PR Merged: ${prUrl}\nMerged by: ${PULL_REQUEST.merged_by.html_url}`,
            });
            core.info(`Added the PR closed status to the Asana task: ${taskId}`);
        } else {
            await client.tasks.addComment(taskId, {
                text: `PR Raised: ${prUrl}\nRaised by: ${PULL_REQUEST.user.html_url}`,
            });
            core.info(`Added the PR link to the Asana task: ${taskId}`);
        }

        const targets = prIsMerged ? targetsPRMerge : targetsPRRaise;
        targets.forEach(async (target) => {
            let targetProject = task.projects.find(
                (project) => project.name === target.project
            );
            if (targetProject) {
                let targetSection = await client.sections
                    .findByProject(targetProject.gid)
                    .then((sections) =>
                        sections.find((section) => section.name === target.section)
                    );
                if (targetSection) {
                    await client.sections.addTask(targetSection.gid, {task: taskId});
                    core.info(`Moved to: ${target.project}/${target.section}`);
                } else {
                    core.error(`Asana section ${target.section} not found.`);
                }
            } else {
                core.info(`This task does not exist in "${target.project}" project`);
            }
        });
    } catch (ex) {
        console.error(ex.value);
    }
}

async function handleCommitPushAsana(asanaPAT, targets, taskId, commitUrl, committerName) {
    try {
        const client = asana.Client.create({
            defaultHeaders: {"asana-enable": "new-sections,string_ids"},
            logAsanaChangeWarnings: false,
        }).useAccessToken(asanaPAT);

        const task = await client.tasks.findById(taskId);

        await targets.forEach(async (target) => {
            let targetProject = task.projects.find(
                (project) => project.name === target.project
            );
            if (targetProject) {
                let targetSection = await client.sections
                    .findByProject(targetProject.gid)
                    .then((sections) =>
                        sections.find((section) => section.name === target.section)
                    );
                if (targetSection) {
                    await client.sections.addTask(targetSection.gid, {task: taskId});
                    core.info(`Moved to: ${target.project}/${target.section}`);
                } else {
                    core.error(`Asana section ${target.section} not found.`);
                }
            } else {
                core.info(`This task does not exist in "${target.project}" project`);
            }
        });


        await client.tasks.addComment(taskId, {
            text: `Commit Pushed: ${commitUrl}\nCommitted by: https://github.com/${committerName}`,
        });

    } catch (ex) {
        console.error(ex.value);
    }
}

function handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMITS_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE) {
    const REGEX = new RegExp(
        `Asana Task: *\\[(.*?)\\]\\(https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?\\)`,
        "g"
    );
    const COMMIT_REGEX = new RegExp(
        `Asana Task: https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?`,
        "g"
    );

    if (!ASANA_PAT) {
        throw {
            message:
                "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
        };
    }


    if (PULL_REQUEST != null) {
        core.info('Handling PR event...')
        let targetsPRRaise = TARGETS_PR_RAISE ? JSON.parse(TARGETS_PR_RAISE) : [];
        let targetsPRMerge = TARGETS_PR_MERGE ? JSON.parse(TARGETS_PR_MERGE) : [];

        const prUrl = `${PULL_REQUEST.html_url}`;
        const prIsMerged = PULL_REQUEST.merged;

        let parseAsanaURL = null;

        while ((parseAsanaURL = REGEX.exec(PULL_REQUEST.body)) !== null) {
            let taskId = parseAsanaURL.groups.task;
            if (taskId) {
                handlePRAsana(
                    ASANA_PAT,
                    taskId,
                    prUrl,
                    prIsMerged,
                    PULL_REQUEST,
                    targetsPRRaise,
                    targetsPRMerge
                );
            } else {
                core.info(
                    `Task id not found: ${parseAsanaURL}`
                );
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
            let parseAsanaURL = null;

            while ((parseAsanaURL = COMMIT_REGEX.exec(message)) !== null) {
                let taskId = parseAsanaURL.groups.task;
                if (taskId) {
                    handleCommitPushAsana(
                        ASANA_PAT,
                        targets,
                        taskId,
                        commitUrl,
                        committerName
                    );
                } else {
                    core.info(
                        `Task id not found: ${parseAsanaURL}`
                    );
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