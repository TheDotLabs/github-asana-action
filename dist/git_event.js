"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.handleGitEvent = void 0;
var core = __importStar(require("@actions/core"));
var _a = require("./asana"), handleCommitPushAsana = _a.handleCommitPushAsana, handlePRAsana = _a.handlePRAsana;
function handleGitEvent(ASANA_PAT, PULL_REQUEST, EVENT_NAME, COMMITS, TARGETS_COMMITS_PUSH, TARGETS_PR_RAISE, TARGETS_PR_MERGE, ACTION) {
    var _a, _b;
    if (!ASANA_PAT) {
        throw {
            message: "Asana PAT Not Found! Generate and supply token from your Asana developer console.",
        };
    }
    var ASANA_TASK_LINK_REGEX = /https:\/\/app.asana.com\/(\d+)\/(?<project>\d+)\/(?<taskId>\d+).*?/ig;
    if (PULL_REQUEST != null) {
        core.info('Handling PR event...');
        var targetsPRRaise = TARGETS_PR_RAISE ? JSON.parse(TARGETS_PR_RAISE) : [];
        var targetsPRMerge = TARGETS_PR_MERGE ? JSON.parse(TARGETS_PR_MERGE) : [];
        var prUrl = "" + PULL_REQUEST.html_url;
        var prIsMerged = PULL_REQUEST.merged;
        var prTitle = PULL_REQUEST.title;
        var taskIds = [];
        var rawParseUrl = void 0;
        while ((rawParseUrl = ASANA_TASK_LINK_REGEX.exec(PULL_REQUEST.body)) !== null) {
            taskIds.push((_a = rawParseUrl === null || rawParseUrl === void 0 ? void 0 : rawParseUrl.groups) === null || _a === void 0 ? void 0 : _a.taskId);
        }
        taskIds = taskIds.filter(function (element, index, self) {
            return index === self.indexOf(element);
        });
        var _loop_1 = function (taskId) {
            core.info("Found task id: " + taskId);
            if (taskId) {
                handlePRAsana(ASANA_PAT, taskId, prUrl, prIsMerged, PULL_REQUEST, targetsPRRaise, targetsPRMerge, prTitle, ACTION).then(function () {
                    core.info("Asana Task: " + taskId + " updated");
                }).catch(function (reason) {
                    core.error(reason);
                });
            }
            else {
                core.info("Task id null/empty!");
            }
        };
        for (var _i = 0, taskIds_1 = taskIds; _i < taskIds_1.length; _i++) {
            var taskId = taskIds_1[_i];
            _loop_1(taskId);
        }
    }
    else if (EVENT_NAME === 'push') {
        core.info('Handling Commits Push event...');
        var targets = TARGETS_COMMITS_PUSH ? JSON.parse(TARGETS_COMMITS_PUSH) : [];
        var commit = void 0;
        for (var _c = 0, COMMITS_1 = COMMITS; _c < COMMITS_1.length; _c++) {
            commit = COMMITS_1[_c];
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
            var taskIds = [];
            var rawParseUrl = void 0;
            while ((rawParseUrl = ASANA_TASK_LINK_REGEX.exec(rawMessage)) !== null) {
                taskIds.push((_b = rawParseUrl === null || rawParseUrl === void 0 ? void 0 : rawParseUrl.groups) === null || _b === void 0 ? void 0 : _b.taskId);
            }
            taskIds = taskIds.filter(function (element, index, self) {
                return index === self.indexOf(element);
            });
            var _loop_2 = function (taskId) {
                core.info("Found task id: " + taskId);
                if (taskId) {
                    handleCommitPushAsana(ASANA_PAT, targets, taskId, commitUrl, committerName, message).then(function () {
                        core.info("Asana Task: " + taskId + " updated");
                    }).catch(function (reason) {
                        core.error(reason);
                    });
                }
                else {
                    core.info("Task id null/empty!");
                }
            };
            for (var _d = 0, taskIds_2 = taskIds; _d < taskIds_2.length; _d++) {
                var taskId = taskIds_2[_d];
                _loop_2(taskId);
            }
        }
    }
    else {
        core.info('No event found to work upon');
    }
}
exports.handleGitEvent = handleGitEvent;
