declare type StatusErrorObject = {
    error?: string;
    [key: string]: any;
};
export declare class StatusError extends Error {
    status: number;
    [key: string]: any;
    constructor(status?: number, body?: StatusErrorObject | string);
}
export {};
