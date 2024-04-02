// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2/typings/mysql/lib/Pool"

// Delete
const deleteExport = async <T = Specifications>(
    table: string,
    specifications?: Partial<T>
): Promise<void> => {
    try {
        const before = new Date().getMilliseconds()
        const invokingResource = GetInvokingResource()

        let hasTimedOut = false

        const timeoutId = setTimeout(() => {
            hasTimedOut = true
            console.error(
                locale.logs.functionTimeouted
                    .replace("[FUNCTION]", "delete")
                    .replace("[TABLE]", table)
                    .replace("[RESOURCE]", invokingResource)
                    .replace("[TIME]", config.functionTimeout.toString())
            )
        }, config.functionTimeout)

        specifications = specifications || {}

        if (config.debug)
            console.log(
                locale.debug.called
                    .replace("[FUNCTION]", "delete")
                    .replace("[TABLE]", table)
                    .replace("[RESOURCE]", invokingResource)
            )

        if (!hasTimedOut) {
            const keys = Object.keys(specifications)
            let queryString = `DELETE FROM ${table}`

            if (keys.length > 0) {
                queryString +=
                    " WHERE " +
                    keys
                        .map((key): string => {
                            const value = (specifications as Specifications)[
                                key
                            ]
                            if (Array.isArray(value)) {
                                return typeof value[1] === "string"
                                    ? `${key}${value[0]}"${value[1]}"`
                                    : `${key}${value[0]}${value[1]}`
                            }
                            return typeof value === "string"
                                ? `${key}="${value}"`
                                : `${key}=${value}`
                        })
                        .join(" AND ")
            }

            const execute = (connection as Pool).promise().execute(queryString)

            return execute
                .then((): void => {
                    const after = new Date().getMilliseconds()
                    const responseTime = after - before

                    if (config.debug)
                        console.log(
                            locale.debug.response
                                .replace("[FUNCTION]", "delete")
                                .replace("[TIME]", responseTime.toString())
                                .replace("[QUERY]", queryString)
                        )

                    clearTimeout(timeoutId)
                })
                .catch(() => {
                    console.error(
                        locale.logs.functionError
                            .replace("[FUNCTION]", "delete")
                            .replace("[QUERY]", queryString)
                    )

                    clearTimeout(timeoutId)
                })
        }
    } catch (e) {
        console.error(e)
    }
}

global.exports("delete", deleteExport)
