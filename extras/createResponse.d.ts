export interface ResponseFormatter {
    (body?: any, options?: object): Response;
}
export interface BodyTransformer {
    (body: any): string;
}
export declare const createResponse: (format?: string, transform?: BodyTransformer | undefined) => ResponseFormatter;
