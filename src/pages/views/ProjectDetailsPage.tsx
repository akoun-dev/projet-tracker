import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useParams, useNavigate } from "react-router-dom"
import {
  IconCalendarEvent,
  IconCheckupList,
  IconFolder,
  IconUsers,
  IconAlertCircle,
  IconCircleCheck,
  IconArrowRight,
  IconArrowLeft
} from "@tabler/icons-react"
import * as React from "react"
import projectsData from "./data.json"
import { Checkbox } from "@/components/ui/checkbox"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"

type Task = {
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
  id: number;
  notes?: string;
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const projectData = projectsData.find(project => project.id === Number(id))

  if (!projectData) {
    return <div>Projet non trouvé</div>
  }

  // --- Ajout d'un état local pour forcer le re-render lors du changement de statut d'une tâche ---
  const [, setForceUpdate] = React.useState(0)

  // Calcul du pourcentage de complétion (recalculé à chaque render)
  const allTasks = Object.values(projectData.tasks).flat()
  const progress = Math.round(
    (allTasks.filter(t => t.status === "Completed").length /
      allTasks.length * 100)
  )
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col bg-muted/40" data-theme={theme}>
          <div className="flex flex-col gap-6 py-6 px-2 sm:px-4 mx-auto w-full">
            {/* Header projet */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-2">
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => navigate(-1)}
                >
                  <IconArrowLeft className="w-4 h-4" /> Retour
                </button>
                <IconFolder className="w-12 h-12 text-primary/80" />
                <div>
                  <h1 className="text-3xl font-bold leading-tight mb-1 break-words max-w-full">{projectData.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">Projet</Badge>
                    <Badge variant={projectData.status === "In Progress" ? "default" : "secondary"}>
                      {projectData.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button variant="outline">Exporter</Button>
                <Button>Modifier</Button>
              </div>
            </div>

            {/* Progression */}
            <Card className="p-6 flex flex-col gap-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20 border w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-primary flex items-center gap-2"><Progress className="w-4 h-4 mr-2" value={progress} />Progression</span>
                <span className="text-lg font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 rounded-full" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Date de début : {projectData.start_date}</span>
                <span>Date de fin : {projectData.end_date}</span>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                <IconFolder className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Description</h2>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed break-words max-w-full">{projectData.description}</p>
            </Card>

            {/* Grille infos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Équipe */}
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <IconUsers className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Équipe</h3>
                </div>
                <div className="text-muted-foreground">Équipe à définir</div>
              </Card>
              {/* Responsable */}
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <IconCircleCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Responsable</h3>
                </div>
                <p className="text-muted-foreground">Responsable à définir</p>
              </Card>
              {/* Calendrier */}
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <IconCalendarEvent className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Échéances</h3>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><span>Date de début:</span><span>{projectData.start_date}</span></div>
                  <div className="flex justify-between"><span>Date de fin:</span><span>{projectData.end_date}</span></div>
                </div>
              </Card>
              {/* Risques */}
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <IconAlertCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Risques</h3>
                </div>
                <div className="text-muted-foreground">Aucun risque identifié</div>
              </Card>
            </div>

            {/* Tâches */}
            <Card className="p-6 w-full">
              <div className="flex items-center gap-2 mb-4">
                <IconCheckupList className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Tâches par semaine</h2>
              </div>
              <div className="space-y-6">
                {Object.entries(projectData.tasks).map(([week, tasks]) => (
                  <div key={week} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h3 className="font-medium mb-2 text-primary/80">{week}</h3>
                    <ul className="space-y-2 pl-2">
                      {(tasks as Task[]).map((task) => (
                        <li
                          key={`${task.id}-${task.name}`}
                          className="flex items-center gap-3 group cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition relative"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <Checkbox
                            checked={task.status === "Completed"}
                            onClick={e => e.stopPropagation()}
                            onCheckedChange={(checked) => {
                              task.status = checked ? "Completed" : "In Progress"
                              setForceUpdate(v => v + 1)
                            }}
                            aria-label={task.name}
                          />
                          <span className={
                            `font-medium ${task.status === "Completed" ? "line-through text-green-600" : ""}`
                          }>{task.name}</span>
                          <Badge variant={task.status === "Completed" ? "secondary" : task.status === "In Progress" ? "default" : "outline"} className="ml-2">
                            {task.status === "Completed" ? "Fait" : task.status === "In Progress" ? "En cours" : "À faire"}
                          </Badge>
                          {task.notes && (
                            <span className="ml-2 text-xs italic text-muted-foreground max-w-xs truncate">{`📝 ${task.notes}`}</span>
                          )}
                          <span className="ml-auto text-xs text-primary/70 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                            Voir détails <IconArrowRight className="w-3 h-3" />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
