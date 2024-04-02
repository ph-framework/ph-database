// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2"
import { formatResponse } from "@modules/formatResponse"

// Select
const selectExport = async <T = Specifications>(
    table: string,
    specifications?: Partial<T>
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
                        .replace("[FUNCTION]", "select")
                        .replace("[TABLE]", table)
                        .replace("[RESOURCE]", invokingResource)
                        .replace("[TIME]", config.functionTimeout.toString())
                )
            }, config.functionTimeout)

            if (config.debug)
                console.log(
                    locale.debug.called
                        .replace("[FUNCTION]", "select")
                        .replace("[TABLE]", table)
                        .replace("[RESOURCE]", invokingResource)
                )

            specifications = specifications || {}

            if (!hasTimedOut) {
                const keys = Object.keys(specifications)
                let queryString = `SELECT * FROM ${table}`

                if (keys.length > 0) {
                    queryString +=
                        " WHERE " +
                        keys
                            .map((key): string => {
                                const value = (
                                    specifications as Specifications
                                )[key]
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

                const query = (connection as Pool).promise().query(queryString)

                query
                    .then((rows): void => {
                        const response = formatResponse(rows) as Array<T>

                        const after = new Date().getMilliseconds()
                        const responseTime = after - before

                        if (config.debug)
                            console.log(
                                locale.debug.response
                                    .replace("[FUNCTION]", "select")
                                    .replace("[TIME]", responseTime.toString())
                                    .replace("[QUERY]", queryString)
                            )

                        resolve(response)
                    })
                    .catch(() =>
                        reject(
                            locale.logs.functionError
                                .replace("[FUNCTION]", "select")
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

global.exports("select", selectExport)
