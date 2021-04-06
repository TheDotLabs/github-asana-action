"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGitEvent = void 0;
var core_1 = __importDefault(require("@actions/core"));
var github = require("@actions/github");
var _a = require("./asana"), handleCommitPushAsana = _a.handleCommitPushAsana, handlePRAsana = _a.handlePRAsana;
function handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMITS_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE, ACTION) {
    var _a, _b;
    if (!ASANA_PAT) {
        throw {
            message: "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
        };
    }
    var ASANA_TASK_LINK_REGEX = new RegExp("https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+).*?", "ig");
    if (PULL_REQUEST != null) {
        core_1.default.info('Handling PR event...');
        var targetsPRRaise = TARGETS_PR_RAISE ? JSON.parse(TARGETS_PR_RAISE) : [];
        var targetsPRMerge = TARGETS_PR_MERGE ? JSON.parse(TARGETS_PR_MERGE) : [];
        var prUrl = "" + PULL_REQUEST.html_url;
        var prIsMerged = PULL_REQUEST.merged;
        var prTitle = PULL_REQUEST.title;
        var parseAsanaURL = void 0;
        var _loop_1 = function () {
            var taskId = (_a = parseAsanaURL === null || parseAsanaURL === void 0 ? void 0 : parseAsanaURL.groups) === null || _a === void 0 ? void 0 : _a.task;
            core_1.default.info("Found task id: " + taskId);
            if (taskId) {
                handlePRAsana(ASANA_PAT, taskId, prUrl, prIsMerged, PULL_REQUEST, targetsPRRaise, targetsPRMerge, prTitle, ACTION).then(function () {
                    core_1.default.info("Asana Task: " + taskId + " updated");
                }).catch(function (reason) {
                    core_1.default.error(reason);
                });
            }
            else {
                core_1.default.info("Task id null/empty!");
            }
        };
        while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(PULL_REQUEST.body)) !== null) {
            _loop_1();
        }
    }
    else if (EVENT_NAME === 'push') {
        core_1.default.info('Handling Commits Push event...');
        var targets = TARGETS_COMMITS_PUSH ? JSON.parse(TARGETS_COMMITS_PUSH) : [];
        var commit = void 0;
        for (var _i = 0, COMMITS_1 = COMMITS; _i < COMMITS_1.length; _i++) {
            commit = COMMITS_1[_i];
            // Commit Message
            var rawMessage = commit.message;
            var message = rawMessage.split('\n')[0];
            for (var i = 0; i < rawMessage.split('\n').length; i++) {
                var line = rawMessage.split('\n')[i];
                if (i !== 0 && line !== "" && !line.includes('app.asana.com') && !line.includes('Signed-off-by:')) {
                    message = message.concat("\n\n" + line);
                }
            }
            var commitUrl = commit.url;
            var committerName = commit.committer.username;
            var parseAsanaURL = void 0;
            var _loop_2 = function () {
                var taskId = (_b = parseAsanaURL === null || parseAsanaURL === void 0 ? void 0 : parseAsanaURL.groups) === null || _b === void 0 ? void 0 : _b.task;
                core_1.default.info("Found task id: " + taskId);
                if (taskId) {
                    handleCommitPushAsana(ASANA_PAT, targets, taskId, commitUrl, committerName, message).then(function () {
                        core_1.default.info("Asana Task: " + taskId + " updated");
                    }).catch(function (reason) {
                        core_1.default.error(reason);
                    });
                }
                else {
                    core_1.default.info("Task id null/empty!");
                }
            };
            while ((parseAsanaURL = ASANA_TASK_LINK_REGEX.exec(rawMessage)) !== null) {
                _loop_2();
            }
        }
    }
    else {
        core_1.default.info('No event found to work upon');
    }
}
exports.handleGitEvent = handleGitEvent;
try {
    var githubContext = github.context;
    console.log(JSON.stringify(githubContext));
    var ASANA_PAT = core_1.default.getInput("asana-token");
    var TARGETS_COMMIT_PUSH = core_1.default.getInput("targets_commit_push");
    var TARGETS_PR_RAISE = core_1.default.getInput("targets_pr_raise");
    var TARGETS_PR_MERGE = core_1.default.getInput("targets_pr_merge");
    var COMMITS = githubContext.payload.commits;
    var EVENT_NAME = githubContext.eventName;
    var PULL_REQUEST = githubContext.payload.pull_request;
    var ACTION = githubContext.payload.action;
    handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMIT_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE, ACTION);
}
catch (error) {
    core_1.default.error(error.message);
}
