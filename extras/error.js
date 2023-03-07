import { json } from './json';
const getMessage = (code) => {
    return {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error'
    }[code] || 'Unknown Error';
};
export const error = (a = 500, b) => {
    // handle passing an Error | StatusError directly in
    if (a instanceof Error) {
        const { message, ...err } = a;
        a = a.status || 500;
        b = {
            error: message || getMessage(a),
            ...err
        };
    }
    b = {
        status: a,
        ...(typeof b === 'object' ? b : { error: b || getMessage(a) })
    };
    return json(b, { status: a });
};
//# sourceMappingURL=error.js.map