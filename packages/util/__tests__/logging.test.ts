'use strict';

import { createTinyGitLogger, LogLevel } from '../src/'

test("test logging level", async () => {
    let executed
    const logger = createTinyGitLogger(LogLevel.INFO, () => {
        executed = true
    })
    executed = false
    logger(LogLevel.SILLY, "XXX")
    expect(executed).toBe(false);
    executed = false
    logger(LogLevel.DEBUG, "XXX")
    expect(executed).toBe(false);
    executed = false
    logger(LogLevel.INFO, "XXX")
    expect(executed).toBe(true);
    executed = false
    logger(LogLevel.WARN, "XXX")
    expect(executed).toBe(true);
    executed = false
    logger(LogLevel.ERROR, "XXX")
    expect(executed).toBe(true);
}
);

test("test logging message function not called by level", async () => {
    let executed
    const logger = createTinyGitLogger(LogLevel.INFO, (level, message) => {
        expect(level).toBe(LogLevel.WARN);
        expect(message).toBe("YYY");
    })
    executed = false
    logger(LogLevel.SILLY, () => {
        executed = true
        return "XXX"
    })
})

test("test logging message function called function created message", async () => {
    const logger = createTinyGitLogger(LogLevel.INFO, (level, message) => {
        expect(level).toBe(LogLevel.WARN);
        expect(message).toBe("YYYZZZ");
    })
    logger(LogLevel.WARN, () => "YYY" + "ZZZ")
})