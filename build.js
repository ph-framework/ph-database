const esbuild = require("esbuild")

const entries = [
    {
        target: "node16",
        entryPoints: ["src/server/core.ts"],
        platform: "node",
        outfile: "./dist/server.js"
    }
]

const buildBundle = async () => {
    try {
        const baseOptions = {
            logLevel: "info",
            bundle: true,
            charset: "utf8",
            minifyWhitespace: true,
            absWorkingDir: process.cwd()
        }

        for (const targetOpts of entries) {
            const mergedOpts = { ...baseOptions, ...targetOpts }

            const { errors } = await esbuild.build(mergedOpts)

            if (errors.length) {
                console.error(
                    `[esbuild] Bundle failed with ${errors.length} errors`
                )
                process.exit(1)
            }
        }
    } catch (e) {
        console.log("[esbuild] Build failed with error")
        console.error(e)
        process.exit(1)
    }
}

buildBundle().catch(() => process.exit(1))
