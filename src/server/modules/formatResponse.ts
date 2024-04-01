// Format Response
export const formatResponse = (rows: any) => {
    const typeOneKeys = Object.keys(rows[1]).filter(
        (key) => rows[1][key].type === 1
    )

    for (const key of typeOneKeys) {
        const name = rows[1][key].name

        for (const row of rows[0]) {
            if (row[name] === 0) {
                row[name] = false
            } else if (row[name] === 1) {
                row[name] = true
            }
        }
    }

    return rows[0]
}
