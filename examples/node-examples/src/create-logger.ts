
import { convertLogMessageToString, LogLevel } from '@tiny-git-server/util';
import winston from "winston"

const debugLogEnable = process.env.DEBUG_LOG === "true"

const LEVELS_BY_CATEGORY: any = {
    "main": "info",
    "sql": debugLogEnable ? "debug" :undefined,
    "sqlfs":  debugLogEnable ? "debug" :undefined,
    "GitServer": debugLogEnable ? "debug" :undefined,
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


const gitServerLogger = createLogger({category:"GitServer"})
export function gitServerLogging(level:LogLevel, message:any, ...optionalParams:any[]) {
    const str = convertLogMessageToString(message, optionalParams)
    gitServerLogger.log(level, str)
}
export const sqlLogger = createLogger({ category: "sql" })
export const sqlfsLogger = createLogger({ category: "sqlfs" })
export function sqlfsLogging(level:LogLevel, message:any, ...optionalParams:any[]) {
    const str = convertLogMessageToString(message, optionalParams)
    sqlfsLogger.log(level, str)
}