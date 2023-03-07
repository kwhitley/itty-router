export class StatusError extends Error {
    constructor(status = 500, body) {
        if (typeof body === 'object') {
            super(body.error);
            Object.assign(this, body);
        }
        else {
            super(body);
        }
        this.status = status;
    }
}
//# sourceMappingURL=StatusError.js.map