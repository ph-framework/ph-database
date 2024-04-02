// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2/typings/mysql/lib/Pool"

// Replace
const replaceExport = async <T = Specifications>(
    table: string,
    specifications: Partial<T>
): Promise<void> => {
    try {
        const before = new Date().getMilliseconds()
        const invokingResource = GetInvokingResource()

        let hasTimedOut = false

        const timeoutId = setTimeout(() => {
            hasTimedOut = true
            console.error(
                locale.logs.functionTimeouted
                    .replace("[FUNCTION]", "replace")
                    .replace("[TABLE]", table)
                    .replace("[RESOURCE]", invokingResource)
                    .replace("[TIME]", config.functionTimeout.toString())
            )
        }, config.functionTimeout)

        if (config.debug)
            console.log(
                locale.debug.called
                    .replace("[FUNCTION]", "replace")
                    .replace("[TABLE]", table)
                    .replace("[RESOURCE]", invokingResource)
            )

        if (!hasTimedOut) {
            const keys = Object.keys(specifications).join(", ")
            const values = Object.values(specifications)
                .map((value) =>
                    typeof value === "string" ? `"${value}"` : value
                )
                .join(", ")

            const queryString = `REPLACE INTO ${table} (${keys}) VALUES (${values})`

            const execute = (connection as Pool).promise().execute(queryString)

            return execute
                .then((): void => {
                    const after = new Date().getMilliseconds()
                    const responseTime = after - before

                    if (config.debug)
                        console.log(
                            locale.debug.response
                                .replace("[FUNCTION]", "replace")
                                .replace("[TIME]", responseTime.toString())
                                .replace("[QUERY]", queryString)
                        )

                    clearTimeout(timeoutId)
                })
                .catch(() => {
                    console.error(
                        locale.logs.functionError
                            .replace("[FUNCTION]", "replace")
                            .replace("[QUERY]", queryString)
                    )

                    clearTimeout(timeoutId)
                })
        }
    } catch (e) {
        console.error(e)
    }
}

global.exports("replace", replaceExport)
