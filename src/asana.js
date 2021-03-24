const asana = require("asana");
const core = require("@actions/core");

async function handlePRAsana(
    asanaPAT,
    taskId,
    prUrl,
    prIsMerged,
    PULL_REQUEST,
    targetsPRRaise,
    targetsPRMerge
) {

    const client = asana.Client.create({
        defaultHeaders: {"asana-enable": "new-sections,string_ids"},
        logAsanaChangeWarnings: false,
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    if (prIsMerged) {
        await client.tasks.addComment(taskId, {
            text: `✅ PR Merged: ${prUrl}\n👉 Merged by: ${PULL_REQUEST.merged_by.html_url}`,
        });
        core.info(`Added the PR closed status to the Asana task: ${taskId}`);
    } else {
        await client.tasks.addComment(taskId, {
            text: `🆕 PR Raised: ${prUrl}\n👉 Raised by: ${PULL_REQUEST.user.html_url}`,
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
}

async function handleCommitPushAsana(asanaPAT, targets, taskId, commitUrl, committerName) {

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
        text: `⬆️ Commit Pushed: ${commitUrl}\n👉 Committed by: https://github.com/${committerName}`,
    });
}

module.exports.handlePRAsana = handlePRAsana;
module.exports.handleCommitPushAsana = handleCommitPushAsana;
