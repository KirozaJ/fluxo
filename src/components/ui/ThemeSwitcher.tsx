import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "../../hooks/useTheme"
import { Button } from "./Button"

export function ThemeSwitcher() {
    const { setTheme, theme, effectiveTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative w-9 h-9 border-0 text-text-muted hover:text-text-main transition-colors"
        >
            {effectiveTheme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
            ) : (
                <SunIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
