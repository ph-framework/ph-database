// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2/typings/mysql/lib/Pool"
import { formatResponse } from "./formatResponse"

// Replace
const replaceExport = async <T = Specifications>(
    table: string,
    specifications: Partial<T>
): Promise<Array<T>> => {
    try {
        const before = new Date().getMilliseconds()
        const invokingResource = GetInvokingResource()

        return new Promise((resolve, reject) => {
            let hasTimedOut = false

            setTimeout(() => {
                hasTimedOut = true
                reject(
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

                const query = (connection as Pool).promise().query(queryString)

                query
                    .then((rows): void => {
                        const response = formatResponse(rows) as Array<T>

                        const after = new Date().getMilliseconds()
                        const responseTime = after - before

                        if (config.debug)
                            console.log(
                                locale.debug.response
                                    .replace("[FUNCTION]", "replace")
                                    .replace("[TIME]", responseTime.toString())
                                    .replace("[QUERY]", queryString)
                            )

                        resolve(response)
                    })
                    .catch(() =>
                        reject(
                            locale.logs.functionError
                                .replace("[FUNCTION]", "replace")
                                .replace("[QUERY]", queryString)
                        )
                    )
            }
        })
    } catch (e) {
        console.error(e)
        return []
    }
}

global.exports("replace", replaceExport)
