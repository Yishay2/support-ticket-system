import * as Sentry from "@sentry/nextjs"
type LogLavel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export function logEvent(message: string, category: string = 'general', data?: Record<string, any>, level: LogLavel = 'info', error?: unknown) {
    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level
    });

    if (error) {
        Sentry.captureException(error, { extra: data })
    } else {
        Sentry.captureMessage(message, level)
    }
}
