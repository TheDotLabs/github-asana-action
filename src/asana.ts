import asana from "asana";
import * as core from '@actions/core';

const { getCommitterAsanaTag } = require("./utils");

async function moveTask(taskId: string, client: any, task: any, targets: any[]) {
    for (const target of targets) {
        let targetProject = task.projects.find(
            (project: any) => project.name === target.project
        );
        if (targetProject) {
            let targetSection = await client.sections
                .findByProject(targetProject.gid)
                .then((sections: any) =>
                    sections.find((section: any) => section.name === target.section)
                );
            if (targetSection) {
                await client.sections.addTask(targetSection.gid, { task: taskId });
                core.info(`Moved to: ${target.project}/${target.section}`);
            } else {
                core.error(`Asana section ${target.section} not found.`);
            }
        } else {
            core.info(`This task does not exist in "${target.project}" project`);
        }
    }
}

export async function handlePRAsana(
    asanaPAT: string,
    taskId: string,
    prUrl: string,
    prIsMerged: boolean,
    PULL_REQUEST: any,
    targetsPRRaise: object[],
    targetsPRMerge: object[],
    prTitle: string,
    ACTION: string,
) {

    const client = asana.Client.create({
        defaultHeaders: { "asana-enable": "new-sections,string_ids" },
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    let comment;
    if (prIsMerged) {
        comment = {
            text: `✅ PR Merged\n-------------------\n${prTitle}\n-------------------\nView: ${prUrl}\n👉 Merged by: ${getCommitterAsanaTag(PULL_REQUEST.merged_by.login)}`,
        };
        core.info(`Adding the PR closed status to the Asana task: ${taskId}`);
    } else if (ACTION === "synchronize") {
        comment = {
            text: `🔄 PR Added more commits\n👉 Updated by: ${getCommitterAsanaTag(PULL_REQUEST.user.login)}`,
        };
        core.info(`Adding the PR Update status to the Asana task: ${taskId}`);
    } else {
        comment = {
            text: `🆕 PR Raised\n-------------------\n${prTitle}\n-------------------\nView: ${prUrl}\n👉 Raised by: ${getCommitterAsanaTag(PULL_REQUEST.user.login)}`,
        };
        core.info(`Adding the PR Raised to the Asana task: ${taskId}`);
    }
    core.info(`Commenting: \n${comment}`);
    await client.tasks.addComment(taskId, comment);

    const targets = prIsMerged ? targetsPRMerge : targetsPRRaise;

    await moveTask(taskId, client, task, targets);
}

export async function handleCommitPushAsana(asanaPAT: string, targets: any[], taskId: string, commitUrl: string, committerName: string, message: string) {
    const comment = `⬆️ Commit Pushed\n-------------------\n${message}\n-------------------\n👀 View Commit: ${commitUrl}\n👉 Committed by: ${getCommitterAsanaTag(committerName)}`;
    core.info(`Commenting: \n${comment}`);

    const client = asana.Client.create({
        defaultHeaders: { "asana-enable": "new-sections,string_ids" },
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    await client.tasks.addComment(taskId, {
        text: comment,
    });

    await moveTask(taskId, client, task, targets);
}
