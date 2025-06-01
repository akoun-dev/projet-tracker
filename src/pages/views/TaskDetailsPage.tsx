import { AppSidebar } from "@/components/app-sidebar"
import { useTheme } from "@/hooks/use-theme"

import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useParams, useNavigate } from "react-router-dom"
import { IconArrowLeft, IconCircleCheck, IconClock, IconAlertCircle } from "@tabler/icons-react"
import * as React from "react"
import projectsData from "./data.json"

export default function Page() {
  const { theme } = useTheme()
  const { id } = useParams()
  const navigate = useNavigate()

  // Recherche de la tâche et du projet parent
  let foundTask = null
  let parentProject = null
  for (const project of projectsData) {
    for (const [week, tasks] of Object.entries(project.tasks)) {
      const task = tasks.find((t) => String(t.id) === String(id))
      if (task) {
        foundTask = { ...task, week }
        parentProject = project
        break
      }
    }
    if (foundTask) break
  }

  if (!foundTask || !parentProject) {
    return <div className="p-8 text-center text-destructive">Tâche non trouvée</div>
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col" data-theme={theme}>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 w-full">
              <button
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2"
                onClick={() => navigate(-1)}
              >
                <IconArrowLeft className="w-4 h-4" /> Retour
              </button>
              <Card className="p-6 flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold flex-1">{foundTask.name}</h1>
                    <Badge variant={foundTask.status === "Completed" ? "default" : foundTask.status === "In Progress" ? "secondary" : "outline"}>
                      {foundTask.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dates et statut */}
                    <div className="flex flex-col gap-2 p-6 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={foundTask.status === "Completed"}
                          onChange={e => {
                            foundTask.status = e.target.checked ? "Completed" : "In Progress"
                            // Forcer le re-render
                            navigate(0)
                          }}
                          className="accent-green-600 w-5 h-5"
                          aria-label="Marquer comme fait"
                        />
                        <span className="font-medium">Statut</span>
                        {foundTask.status === "Completed" && <IconCircleCheck className="text-green-500 w-5 h-5" />}
                        {foundTask.status === "In Progress" && <IconClock className="text-yellow-500 w-5 h-5" />}
                        {foundTask.status === "Pending" && <IconAlertCircle className="text-gray-500 w-5 h-5" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {foundTask.start_date} → {foundTask.end_date}
                      </div>
                    </div>

                    {/* Projet parent */}
                    <div className="flex flex-col gap-2 p-6 bg-muted/30 rounded-lg">
                      <span className="font-medium">Projet</span>
                      <div className="text-sm text-muted-foreground">{parentProject.name}</div>
                      <div className="text-xs text-muted-foreground">Semaine : {foundTask.week}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="font-semibold mb-1">Description</h2>
                  <p className="text-muted-foreground">{foundTask.description}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-1 mt-4">Notes</h2>
                  <p className="text-muted-foreground">{'notes' in foundTask && (foundTask as any).notes ? (foundTask as any).notes : "Aucune note."}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
                    onClick={() => navigate(`/projects/${parentProject.id}`)}
                  >
                    Voir le projet
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
