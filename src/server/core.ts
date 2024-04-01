// Imports
import { resolve } from "path"
import { createConnection } from "@modules/connections"
import { getLocale } from "@server/locale"
import { ServerConfig } from "@server/protocols"
import { Pool } from "mysql2"
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
