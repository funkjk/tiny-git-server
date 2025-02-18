export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}

export type Logging = (level: LogLevel, message: any, ...optionalParams: any[]) => void


export const DefaultLogging =
    (level: LogLevel, message: any, ...optionalParams: any[]): void => {
        if (level !== LogLevel.DEBUG) {
            console.log("tiny-git-server>" + message, ...optionalParams)
        }
    }


export function convertLogMessageToString(message: any, ...optionalParams: any[]) {
    let str = message?.toString()
    for (let param of optionalParams) {
        if (typeof param === "string" || typeof param === "number") {
            str += param
        } else if (param === undefined) {
            break
        } else if (Array.isArray(param) && param.length == 0) {
            break
        } else {
            str += JSON.stringify(param)
        }
    }
    return str
}