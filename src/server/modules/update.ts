// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2/typings/mysql/lib/Pool"
import { formatResponse } from "./formatResponse"

// Update
const updateExport = async <T = Specifications>(
    table: string,
    sets: Partial<T>,
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
                        .replace("[FUNCTION]", "update")
                        .replace("[TABLE]", table)
                        .replace("[RESOURCE]", invokingResource)
                        .replace("[TIME]", config.functionTimeout.toString())
                )
            }, config.functionTimeout)

            specifications = specifications || {}

            if (config.debug)
                console.log(
                    locale.debug.called
                        .replace("[FUNCTION]", "udpate")
                        .replace("[TABLE]", table)
                        .replace("[RESOURCE]", invokingResource)
                )

            if (!hasTimedOut) {
                const setKeys = Object.keys(sets)
                const specificationKeys = Object.keys(specifications)
                let queryString = `UPDATE ${table}`

                queryString +=
                    " SET " +
                    setKeys
                        .map((key): string => {
                            const value = (sets as Specifications)[key]
                            return typeof value === "string"
                                ? `${key}="${value}"`
                                : `${key}=${value}`
                        })
                        .join(",")

                if (specificationKeys.length > 0) {
                    queryString +=
                        " WHERE " +
                        specificationKeys
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
                                    .replace("[FUNCTION]", "update")
                                    .replace("[TIME]", responseTime.toString())
                                    .replace("[QUERY]", queryString)
                            )

                        resolve(response)
                    })
                    .catch(() =>
                        reject(
                            locale.logs.functionError
                                .replace("[FUNCTION]", "update")
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

global.exports("update", updateExport)
