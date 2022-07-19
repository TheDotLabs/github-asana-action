"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var git_event_1 = require("./git_event");
var github = require("@actions/github");
try {
    var githubContext = github.context;
    console.log(JSON.stringify(githubContext));
    var ASANA_PAT = core.getInput("asana-token");
    var TARGETS_COMMIT_PUSH = core.getInput("targets_commit_push");
    var TARGETS_PR_RAISE = core.getInput("targets_pr_raise");
    var TARGETS_PR_MERGE = core.getInput("targets_pr_merge");
    var COMMITS = githubContext.payload.commits;
    var EVENT_NAME = githubContext.eventName;
    var PULL_REQUEST = githubContext.payload.pull_request;
    var ACTION = githubContext.payload.action;
    (0, git_event_1.handleGitEvent)(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMIT_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE, ACTION);
}
catch (error) {
    // @ts-ignore
    core.error(error === null || error === void 0 ? void 0 : error.toString());
}
