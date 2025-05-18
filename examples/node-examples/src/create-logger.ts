
import { convertLogMessageToString, createTinyGitLogger, LogLevel } from '@funkjk/tiny-git-server-util';
import winston from "winston"

const debugLogEnable = process.env.DEBUG_LOG !== "true"

const LEVELS_BY_CATEGORY: any = {
    "main": "info",
    "sql": debugLogEnable ? "silly" : undefined,
    "sqlfs": debugLogEnable ? "silly" : undefined,
    "GitServer": debugLogEnable ? "silly" : undefined,
    // "GitServer": "silly",
}

export function createLogger(args?: { category?: string }) {
    const category = args?.category ?? "main"
    if (winston.loggers.has(category)) {
        return winston.loggers.get(category)
    }
    const level = LEVELS_BY_CATEGORY[category] ?? "info"
    winston.loggers.add(category, {
        transports: [
            new winston.transports.Console({ level }),
            new winston.transports.File({ filename: 'dist/log.txt' }),
        ],
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf(info =>
                `${info.timestamp} ${category} ${info.level}: ${info.message}${info.splat ? info.splat : ""}` + (info.splat !== undefined ? `${info.splat}` : " "))
        ),
    })
    return winston.loggers.get(category)
}


const gitServerLogger = createLogger({ category: "GitServer" })
export const gitServerLogging = createTinyGitLogger(LEVELS_BY_CATEGORY["GitServer"], (level: LogLevel, message: any, ...optionalParams: any[]) => {
    const str = convertLogMessageToString(message, optionalParams)
    gitServerLogger.log(level, str)
})
export const sqlLogger = createLogger({ category: "sql" })
export const sqlfsLogger = createLogger({ category: "sqlfs" })
export const sqlfsLogging = createTinyGitLogger(LEVELS_BY_CATEGORY["sqlfs"], (level: LogLevel, message: any, ...optionalParams: any[]) => {
    const str = convertLogMessageToString(message, optionalParams)
    sqlfsLogger.log(level, str)
})