export interface ServerConfig {
    debug: boolean
    functionTimeout: number
    host: string
    user: string
    password: string
    database: string
    port: number
}

export interface Locale {
    logs: {
        connectionError: string
        connectionSuccess: string
        functionTimeouted: string
        functionError: string
    }
    debug: {
        called: string
        response: string
    }
}

export interface Specifications {
    [key: string]: any
}
