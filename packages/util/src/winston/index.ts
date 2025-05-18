
import winston from "winston"
import { convertLogMessageToString, createTinyGitLogger, LogLevel } from "../logging"

interface CategoryLevels {
    [key: string]: LogLevel
}

export function createWinstonLogger(categoryLevels: CategoryLevels, args?: { category?: string, fileName?: string }) {
    const category = args?.category ?? "main"
    if (winston.loggers.has(category)) {
        return winston.loggers.get(category)
    }
    const level = categoryLevels[category] ?? "info"
    const transports = [new winston.transports.Console({ level })] as winston.transport[]
    if (args?.fileName) {
        transports.push(new winston.transports.File({ filename: args.fileName }))
    }
    winston.loggers.add(category, {
        transports,
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


export function createTinyGitWinstonLogger(categoryLevels: CategoryLevels, args?: { fileName?: string }) {
    const gitServerLogger = createWinstonLogger(categoryLevels, { category: "GitServer", ...args })
    const gitServerLogging = createTinyGitLogger(categoryLevels["GitServer"], (level: LogLevel, message: any, ...optionalParams: any[]) => {
        const str = convertLogMessageToString(message, optionalParams)
        gitServerLogger.log(level, str)
    })
    const sqlfsLogger = createWinstonLogger(categoryLevels, { category: "GitFs", ...args })
    const sqlfsLogging = createTinyGitLogger(categoryLevels["GitFs"], (level: LogLevel, message: any, ...optionalParams: any[]) => {
        const str = convertLogMessageToString(message, optionalParams)
        sqlfsLogger.log(level, str)
    })
    return {
        gitServerLogging,
        sqlfsLogging
    }
}