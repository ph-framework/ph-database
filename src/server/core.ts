// Imports
import { resolve } from "path"
import { createConnection } from "@modules/connections"
import { getLocale } from "@server/locale"
import { ServerConfig } from "@server/protocols"
import { Pool } from "mysql2"
import mysqldump from "mysqldump"
import "@modules/delete"
import "@modules/insert"
import "@modules/replace"
import "@modules/select"
import "@modules/update"

// Config
const root = GetResourcePath(GetCurrentResourceName())
const file = resolve(`${root}/config/server.json`)
export const config: ServerConfig = require(file)
export const locale = getLocale()
export let connection: Pool | boolean

// Connection
setImmediate(() => {
    connection = createConnection()
})

// Backup
if (config.backup) {
    setInterval(
        (): void => {
            const date = new Date()
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const hours = String(date.getHours()).padStart(2, "0")
            const minutes = String(date.getMinutes()).padStart(2, "0")
            const fileName = `${config.database}-${day}-${month}-${hours}h${minutes}`
            const dirFile = `${root}/backups/${fileName}.sql`

            mysqldump({
                connection: {
                    host: config.host,
                    user: config.user,
                    password: config.password,
                    database: config.database
                },
                dumpToFile: dirFile
            })

            console.log(
                locale.logs.databaseBackup.replace("[FILENAME]", fileName)
            )
        },
        config.backupInterval * 60 * 1000
    )
}
