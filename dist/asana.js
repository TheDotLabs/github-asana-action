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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommitPushAsana = exports.handlePRAsana = void 0;
var asana_1 = __importDefault(require("asana"));
var core = __importStar(require("@actions/core"));
var getCommitterAsanaTag = require("./utils").getCommitterAsanaTag;
function moveTask(taskId, client, task, targets) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _i, targets_1, target;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (target) {
                        var targetProject, targetSection;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    targetProject = task.projects.find(function (project) { return project.name === target.project; });
                                    if (!targetProject) return [3 /*break*/, 5];
                                    return [4 /*yield*/, client.sections
                                            .findByProject(targetProject.gid)
                                            .then(function (sections) {
                                            return sections.find(function (section) { return section.name === target.section; });
                                        })];
                                case 1:
                                    targetSection = _b.sent();
                                    if (!targetSection) return [3 /*break*/, 3];
                                    return [4 /*yield*/, client.sections.addTask(targetSection.gid, { task: taskId })];
                                case 2:
                                    _b.sent();
                                    core.info("Moved to: ".concat(target.project, "/").concat(target.section));
                                    return [3 /*break*/, 4];
                                case 3:
                                    core.error("Asana section ".concat(target.section, " not found."));
                                    _b.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    core.info("This task does not exist in \"".concat(target.project, "\" project"));
                                    _b.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, targets_1 = targets;
                    _a.label = 1;
                case 1:
                    if (!(_i < targets_1.length)) return [3 /*break*/, 4];
                    target = targets_1[_i];
                    return [5 /*yield**/, _loop_1(target)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handlePRAsana(asanaPAT, taskId, prUrl, prIsMerged, PULL_REQUEST, targetsPRRaise, targetsPRMerge, prTitle, ACTION) {
    return __awaiter(this, void 0, void 0, function () {
        var client, task, comment, targets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = asana_1.default.Client.create({
                        defaultHeaders: { "asana-enable": "new-sections,string_ids" },
                    }).useAccessToken(asanaPAT);
                    return [4 /*yield*/, client.tasks.findById(taskId)];
                case 1:
                    task = _a.sent();
                    if (prIsMerged) {
                        comment = {
                            text: "\u2705 PR Merged\n-------------------\n".concat(prTitle, "\n-------------------\nView: ").concat(prUrl, "\n\uD83D\uDC49 Merged by: ").concat(getCommitterAsanaTag(PULL_REQUEST.merged_by.login)),
                        };
                        core.info("Adding the PR closed status to the Asana task: ".concat(taskId));
                    }
                    else if (ACTION === "synchronize") {
                        comment = {
                            text: "\uD83D\uDD04 PR Added more commits\n\uD83D\uDC49 Updated by: ".concat(getCommitterAsanaTag(PULL_REQUEST.user.login)),
                        };
                        core.info("Adding the PR Update status to the Asana task: ".concat(taskId));
                    }
                    else {
                        comment = {
                            text: "\uD83C\uDD95 PR Raised\n-------------------\n".concat(prTitle, "\n-------------------\nView: ").concat(prUrl, "\n\uD83D\uDC49 Raised by: ").concat(getCommitterAsanaTag(PULL_REQUEST.user.login)),
                        };
                        core.info("Adding the PR Raised to the Asana task: ".concat(taskId));
                    }
                    core.info("Commenting: \n".concat(comment));
                    return [4 /*yield*/, client.tasks.addComment(taskId, comment)];
                case 2:
                    _a.sent();
                    targets = prIsMerged ? targetsPRMerge : targetsPRRaise;
                    return [4 /*yield*/, moveTask(taskId, client, task, targets)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handlePRAsana = handlePRAsana;
function handleCommitPushAsana(asanaPAT, targets, taskId, commitUrl, committerName, message) {
    return __awaiter(this, void 0, void 0, function () {
        var comment, client, task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    comment = "\u2B06\uFE0F Commit Pushed\n-------------------\n".concat(message, "\n-------------------\n\uD83D\uDC40 View Commit: ").concat(commitUrl, "\n\uD83D\uDC49 Committed by: ").concat(getCommitterAsanaTag(committerName));
                    core.info("Commenting: \n".concat(comment));
                    client = asana_1.default.Client.create({
                        defaultHeaders: { "asana-enable": "new-sections,string_ids" },
                    }).useAccessToken(asanaPAT);
                    return [4 /*yield*/, client.tasks.findById(taskId)];
                case 1:
                    task = _a.sent();
                    return [4 /*yield*/, client.tasks.addComment(taskId, {
                            text: comment,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, moveTask(taskId, client, task, targets)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleCommitPushAsana = handleCommitPushAsana;
