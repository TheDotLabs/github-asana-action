import * as core from '@actions/core';
import { handleGitEvent } from "./git_event";

const github = require("@actions/github");


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
  core.error(error);
}

