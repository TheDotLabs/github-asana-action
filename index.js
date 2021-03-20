const core = require("@actions/core");
const github = require("@actions/github");
const asana = require("asana");

async function asanaOperations(asanaPAT, targets, taskId, prUrl, prIsMerged) {
  try {
    const client = asana.Client.create({
      defaultHeaders: { "asana-enable": "new-sections,string_ids" },
      logAsanaChangeWarnings: false,
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);

    // targets.forEach(async (target) => {
    //   let targetProject = task.projects.find(
    //     (project) => project.name === target.project
    //   );
    //   if (targetProject) {
    //     let targetSection = await client.sections
    //       .findByProject(targetProject.gid)
    //       .then((sections) =>
    //         sections.find((section) => section.name === target.section)
    //       );
    //     if (targetSection) {
    //       await client.sections.addTask(targetSection.gid, { task: taskId });
    //       core.info(`Moved to: ${target.project}/${target.section}`);
    //     } else {
    //       core.error(`Asana section ${target.section} not found.`);
    //     }
    //   } else {
    //     core.info(`This task does not exist in "${target.project}" project`);
    //   }
    // });

    if (prIsMerged) {
      await client.tasks.addComment(taskId, {
        text: `PR Merged: ${prUrl}`,
      });
      core.info(`Added the PR closed status to the Asana task: ${taskId}`);
    } else {
      await client.tasks.addComment(taskId, {
        text: `PR Raised: ${prUrl}`,
      });
      core.info(`Added the PR link to the Asana task: ${taskId}`);
    }
  } catch (ex) {
    console.error(ex.value);
  }
}

try {
  console.log(github.context);
  const ASANA_PAT = core.getInput("asana-pat"),
    TARGETS = core.getInput("targets"),
    TRIGGER_PHRASE = core.getInput("trigger-phrase"),
    PULL_REQUEST = github.context.payload.pull_request,
    REGEX = new RegExp(
      `${TRIGGER_PHRASE} *\\[(.*?)\\]\\(https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?\\)`,
      "g"
    );

  if (PULL_REQUEST == null) {
    core.info("No PR found. Exiting");
    return;
  }
  let targets = TARGETS ? JSON.parse(TARGETS) : [],
    parseAsanaURL = null;

  if (!ASANA_PAT) {
    throw {
      message:
        "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
    };
  }

  const prUrl = `${PULL_REQUEST.html_url}`;
  const prIsMerged = PULL_REQUEST.merged;

  while ((parseAsanaURL = REGEX.exec(PULL_REQUEST.body)) !== null) {
    let taskId = parseAsanaURL.groups.task;
    if (taskId) {
      asanaOperations(ASANA_PAT, targets, taskId, prUrl, prIsMerged);
    } else {
      core.info(
        `Invalid Asana task URL after the trigger phrase ${TRIGGER_PHRASE}`
      );
    }
  }
} catch (error) {
  core.error(error.message);
}
