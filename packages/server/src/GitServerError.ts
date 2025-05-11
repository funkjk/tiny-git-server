export enum ErrorType {
    NOT_FOUND = "NOT_FOUND",
    ALREADY_EXIST = "ALREADY_EXIST",
    INVALID_PARAMETER = "INVALID_PARAMETER",
    NO_OPERATION = "NO_OPERATION",
}

export class GitServerError {
    type: ErrorType;
    message: string;
    errorClass: string;
    static ERROR_CLASS = "GitServerError"
    constructor(type: ErrorType, message?: string) {
        this.type = type
        this.message = message ?? type
        this.errorClass = GitServerError.ERROR_CLASS
    }
}

export const HTTP_STATUS_BY_ERROR = {
    [ErrorType.ALREADY_EXIST] :400,
    [ErrorType.INVALID_PARAMETER] :400,
    [ErrorType.NOT_FOUND] :400,
    [ErrorType.NO_OPERATION] :404
}
