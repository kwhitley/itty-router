import { IRequest } from '..';
interface CorsOptions {
    origins?: string[];
    maxAge?: number;
    methods?: string[];
    headers?: any;
}
export declare const createCors: (options?: CorsOptions) => {
    corsify: (response: Response) => Response;
    preflight: (r: IRequest) => Response | undefined;
};
export {};
