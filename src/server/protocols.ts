export interface ServerConfig {
    host: string
    user: string
    password: string
    database: string
    port: number
    debug: boolean
    functionTimeout: number
    backup: boolean
    backupInterval: number
}

export interface Locale {
    logs: {
        connectionError: string
        connectionSuccess: string
        functionTimeouted: string
        functionError: string
        databaseBackup: string
    }
    debug: {
        called: string
        response: string
    }
}

export interface Specifications {
    [key: string]: any
}
