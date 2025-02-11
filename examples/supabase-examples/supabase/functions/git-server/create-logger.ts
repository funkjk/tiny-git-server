
import { convertLogMessageToString, LogLevel } from "tiny-git-server/server"

const LEVELS_BY_CATEGORY: any = {
    "main": "info",
    "sql": "debug",
    "sqlfs": "debug",
    "GitServer": "debug"
}
const levelNumber = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
}

class CustomLogger {
    category: string
    constructor(category: string) {
        this.category = category
    }
    log(level: LogLevel, message: string) {
        if (this.logEnable(level)) {
            console.log(this.formatLog(level,message))
        }
    }
    formatLog(level: LogLevel, message: string) {
        return `${new Date().toISOString().substring(11)} ${this.category}[${level}]>${message}`
    }
    info(message) {
        this.log(LogLevel.INFO, message) 
    }
    debug(message) {
        this.log(LogLevel.DEBUG, message) 
    }
    warn(message) {
        this.log(LogLevel.WARN, message) 
    }
    error(message) {
        this.log(LogLevel.ERROR, message) 
    }
    logEnable(level:LogLevel) {
        const categoryLevel = LEVELS_BY_CATEGORY[this.category] ?? LogLevel.INFO
        return CustomLogger.compare(level, categoryLevel)
    }
    static compare(level: LogLevel, otherLevel): boolean {
        return levelNumber[level] >= levelNumber[otherLevel]
    }
}

export function createLogger(args?: { category?: string }) {
    const category = args?.category ?? "main"
    return new CustomLogger(category)
}


const gitServerLogger = createLogger({ category: "GitServer" })
export function gitServerLogging(level: LogLevel, message: any, ...optionalParams: any[]) {
    const str = convertLogMessageToString(message, optionalParams)
    gitServerLogger.log(level, str)
}
export const sqlLogger = createLogger({ category: "sql" })
const sqlfsLogger = createLogger({ category: "sqlfs" })
export function sqlfsLogging(level: LogLevel, message: any, ...optionalParams: any[]) {
    const str = convertLogMessageToString(message, optionalParams)
    sqlfsLogger.log(level, str)
}