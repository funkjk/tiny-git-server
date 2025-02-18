export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export type Logging = (level: LogLevel, message: any, ...optionalParams: any[]) => void;
export declare const DefaultLogging: (level: LogLevel, message: any, ...optionalParams: any[]) => void;
export declare function convertLogMessageToString(message: any, ...optionalParams: any[]): any;
