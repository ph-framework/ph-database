// Imports
import { resolve } from "path"
import { Locale } from "@server/protocols"

// Get Locale
export const getLocale = (): Locale => {
    const root = GetResourcePath(GetCurrentResourceName())
    const language: string = GlobalState.locale || GetConvar("ph_locale", "pt")
    const file = resolve(`${root}/locales/${language}.json`)
    const locales = require(file)

    if (!GlobalState.locale) {
        GlobalState.locale = language
    }

    return locales
}
