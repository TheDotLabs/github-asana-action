const asana = require("asana");
const core = require("@actions/core");
const {getCommitterAsanaTag} = require("./utils");

async function handlePRAsana(
    asanaPAT,
    taskId,
    prUrl,
    prIsMerged,
    PULL_REQUEST,
    targetsPRRaise,
    targetsPRMerge,
    prTitle,
    ACTION
) {

    const client = asana.Client.create({
        defaultHeaders: {"asana-enable": "new-sections,string_ids"},
        logAsanaChangeWarnings: false,
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    if (prIsMerged) {
        await client.tasks.addComment(taskId, {
            text: `✅ PR Merged\n-------------------\n${prTitle}\n-------------------\nView: ${prUrl}\n👉 Merged by: ${getCommitterAsanaTag(PULL_REQUEST.merged_by.login)}`,
        });
        core.info(`Added the PR closed status to the Asana task: ${taskId}`);
    } else if (ACTION === "synchronize") {
        await client.tasks.addComment(taskId, {
            text: `🔄 PR Added more commits\n👉 Updated by: ${getCommitterAsanaTag(PULL_REQUEST.user.login)}`,
        });
        core.info(`Added the PR Update status to the Asana task: ${taskId}`);
    } else {
        await client.tasks.addComment(taskId, {
            text: `🆕 PR Raised\n-------------------\n${prTitle}\n-------------------\nView: ${prUrl}\n👉 Raised by: ${getCommitterAsanaTag(PULL_REQUEST.user.login)}`,
        });
        core.info(`Added the PR Raised to the Asana task: ${taskId}`);
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

async function handleCommitPushAsana(asanaPAT, targets, taskId, commitUrl, committerName, message) {
    const comment = `⬆️ Commit Pushed\n-------------------\n${message}\n-------------------\n👀 View Commit: ${commitUrl}\n👉 Committed by: ${getCommitterAsanaTag(committerName)}`;
    core.info(`Commenting: \n${comment}`);

    const client = asana.Client.create({
        defaultHeaders: {"asana-enable": "new-sections,string_ids"},
        logAsanaChangeWarnings: false,
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    await client.tasks.addComment(taskId, {
        text: comment,
    });

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
}

module.exports.handlePRAsana = handlePRAsana;
module.exports.handleCommitPushAsana = handleCommitPushAsana;
