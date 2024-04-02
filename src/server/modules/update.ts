// Imports
import { config, connection, locale } from "@server/core"
import { Specifications } from "@server/protocols"
import { Pool } from "mysql2/typings/mysql/lib/Pool"

// Update
const updateExport = async <T = Specifications>(
    table: string,
    sets: Partial<T>,
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
                                .replace("[FUNCTION]", "update")
                                .replace("[TIME]", responseTime.toString())
                                .replace("[QUERY]", queryString)
                        )

                    clearTimeout(timeoutId)
                })
                .catch(() => {
                    console.error(
                        locale.logs.functionError
                            .replace("[FUNCTION]", "update")
                            .replace("[QUERY]", queryString)
                    )

                    clearTimeout(timeoutId)
                })
        }
    } catch (e) {
        console.error(e)
    }
}

global.exports("update", updateExport)
