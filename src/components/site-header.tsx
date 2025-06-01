import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
import * as React from "react"

// Define Theme type according to your theme values
type Theme = "default" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet";

export function SiteHeader() {
  // Gestion du thème (light/dark)
  const [dark, setDark] = React.useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  )
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  // Gestion du thème via context
  const { theme, setTheme } = useTheme()

  // Appliquer data-theme sur <body> et <html> pour compatibilité shadcn/ui
  React.useEffect(() => {
    document.body.setAttribute("data-theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card text-card-foreground transition-colors">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Sélecteur de thème globals.css */}
              <select
            className="border rounded px-2 py-1 text-xs bg-background text-foreground"
            value={theme}
            onChange={e => {
              setTheme(e.target.value as Theme)
              // Force update for immediate theme change
              document.body.setAttribute('data-theme', e.target.value)
              document.documentElement.setAttribute('data-theme', e.target.value)
            }}
            aria-label="Thème global"
          >
            <option value="default">Par défaut</option>
            <option value="neutral">Neutre</option>
            <option value="zinc">Zinc</option>
            <option value="slate">Ardoise</option>
            <option value="stone">Pierre</option>
            <option value="gray">Gris</option>
            <option value="red">Rouge</option>
            <option value="rose">Rose</option>
            <option value="orange">Orange</option>
            <option value="green">Vert</option>
            <option value="emerald">Émeraude</option>
            <option value="cyan">Cyan</option>
            <option value="blue">Bleu</option>
            <option value="indigo">Indigo</option>
            <option value="violet">Violet</option>
            <option value="purple">Pourpre</option>
            <option value="pink">Rose vif</option>
          </select>
          {/* Bouton dark mode */}
          <button
            className="border rounded px-2 py-1 text-xs ml-2 bg-background text-foreground"
            onClick={() => setDark(d => !d)}
            aria-label="Basculer mode sombre"
          >
            {dark ? "☾ Sombre" : "☀️ Clair"}
          </button>
          {/* Bouton Notifications */}
          <button
            className="border rounded px-2 py-1 text-xs ml-2 bg-background text-foreground"
            aria-label="Notifications"
            onClick={() => alert('Aucune notification non lue')}
          >
            🔔
          </button>
        </div>
      </div>
    </header>
  )
}
