import * as React from "react"

type Theme = 
  | "default" 
  | "neutral" 
  | "zinc" 
  | "slate" 
  | "stone" 
  | "gray" 
  | "red" 
  | "rose" 
  | "orange" 
  | "green" 
  | "emerald" 
  | "cyan" 
  | "blue" 
  | "indigo" 
  | "violet" 
  | "purple" 
  | "pink" 
  | "yellow"

const ThemeContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "default",
  setTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "default"
    }
    return "default"
  })

  React.useEffect(() => {
    localStorage.setItem("theme", theme)
    document.body.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
