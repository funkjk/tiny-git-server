export enum LogLevel {
    SILLY = "silly",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export type Logging = (level: LogLevel, message: any, ...optionalParams: any[]) => void
export function createTinyGitLogger(loggerLevel: LogLevel, logging: (level: LogLevel, message: any, ...optionalParams: any[]) => void): Logging {
    if (loggerLevel === undefined) {
        loggerLevel = LogLevel.INFO
    }
    return (level: LogLevel, message: any, ...optionalParams: any[]) => {
        if (compareLogLevel(loggerLevel, level) <= 0) {
            if (typeof message === "function") {
                message = message()
            }
            logging(level, message, ...optionalParams)
        }
    }
}

export const DefaultLogging: Logging = createTinyGitLogger(LogLevel.INFO,
    (_level: LogLevel, message: any, ...optionalParams: any[]) => {
        console.log("tiny-git-server>" + message, ...optionalParams)
    }
)
export function compareLogLevel(level1: LogLevel, level2: LogLevel): number {
    const levels = [LogLevel.SILLY, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const index1 = levels.indexOf(level1)
    const index2 = levels.indexOf(level2)
    if (index1 === -1 || index2 === -1) {
        console.warn(`Invalid log level: ${level1} or ${level2}`)
        return 0
        // throw new Error(`Invalid log level: ${level1} or ${level2}`)
    }
    return index1 - index2
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