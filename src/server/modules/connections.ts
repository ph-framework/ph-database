// Imports
import { config, locale } from "@server/core"
import { createPool } from "mysql2"

// Create Connection
export const createConnection = () => {
    const connection = createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port
    })

    connection.getConnection((error, connect) => {
        if (error) {
            setImmediate(() =>
                console.error(
                    locale.logs.connectionError.replace(
                        "[DATABASE]",
                        config.database
                    )
                )
            )
            return
        }

        setImmediate(() =>
            console.log(
                locale.logs.connectionSuccess.replace(
                    "[DATABASE]",
                    config.database
                )
            )
        )

        connect.release()
    })

    return connection
}
