declare const asana: any;
declare const core: any;
declare const getCommitterAsanaTag: any;
declare function handlePRAsana(asanaPAT: string, taskId: string, prUrl: string, prIsMerged: boolean, PULL_REQUEST: any, targetsPRRaise: object[], targetsPRMerge: object[], prTitle: string, ACTION: string): Promise<void>;
declare function moveTask(taskId: string, client: any, task: any, targets: any[]): Promise<void>;
declare function handleCommitPushAsana(asanaPAT: string, targets: any[], taskId: string, commitUrl: string, committerName: string, message: string): Promise<void>;
