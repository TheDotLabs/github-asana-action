export declare function handlePRAsana(asanaPAT: string, taskId: string, prUrl: string, prIsMerged: boolean, PULL_REQUEST: any, targetsPRRaise: object[], targetsPRMerge: object[], prTitle: string, ACTION: string): Promise<void>;
export declare function handleCommitPushAsana(asanaPAT: string, targets: any[], taskId: string, commitUrl: string, committerName: string, message: string): Promise<void>;
