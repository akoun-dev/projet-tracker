import { useTheme } from "@/hooks/use-theme"
import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import type { TaskRow } from "@/components/tasks-table"
import { useNavigate } from "react-router-dom"
import { format, isBefore } from "date-fns"
import { fr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface ProjectTask {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  notes?: string
}

interface ProjectData {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  tasks: {
    [key: string]: ProjectTask[]
  }
}

export default function PlanningPage() {
  const { theme } = useTheme()
  const [projects, setProjects] = React.useState<ProjectData[]>([])
  const [tasks, setTasks] = React.useState<TaskRow[]>([])
  const navigate = useNavigate()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = React.useState<"day" | "month">("day")
  const [selectedProject, setSelectedProject] = React.useState<string>("all")

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await import('./data.json')
        const loadedProjects: ProjectData[] = data.default
        setProjects(loadedProjects)
        
        const loadedTasks: TaskRow[] = loadedProjects.flatMap(project => 
          Object.values(project.tasks).flat().map(task => ({
            id: task.id,
            name: task.name,
            description: task.description,
            start_date: task.start_date,
            end_date: task.end_date,
            status: task.status as "Completed" | "In Progress" | "Planned",
            projectName: project.name
          }))
        )
        setTasks(loadedTasks)
      } catch (error) {
        console.error("Erreur de chargement des données:", error)
      }
    }
    loadData()
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (!date) return false
    
    if (selectedProject !== "all" && 
        !task.projectName?.toLowerCase().includes(selectedProject)) {
      return false
    }

    const taskDate = new Date(task.end_date)
    
    if (viewMode === "day") {
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    } else {
      return (
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    }
  })

  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.end_date)
    return isBefore(taskDate, new Date()) && task.status !== "Completed"
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-muted/40" data-theme={theme}>
          <div className="flex flex-col gap-6 py-6 px-4 mx-auto w-full">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Planning</h1>
              {overdueTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">En retard</Badge>
                  <span className="text-sm text-muted-foreground">
                    {overdueTasks.length} tâche(s) en retard
                  </span>
                </div>
              )}
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Calendrier des tâches</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === "day" ? "default" : "outline"}
                    onClick={() => setViewMode("day")}
                  >
                    Jour
                  </Button>
                  <Button 
                    variant={viewMode === "month" ? "default" : "outline"}
                    onClick={() => setViewMode("month")}
                  >
                    Mois
                  </Button>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par projet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les projets</SelectItem>
                      {projects.map(project => (
                        <SelectItem 
                          key={project.id} 
                          value={project.name.toLowerCase().replace(/\s+/g, '-')}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full lg:w-5/5 space-y-4">
                    {selectedProject !== "all" && (
                      <div className="p-4 bg-accent rounded-lg">
                        <h3 className="font-semibold">Projet sélectionné</h3>
                        <p className="text-sm mt-1">
                          {projects.find(p => 
                            p.name.toLowerCase().replace(/\s+/g, '-') === selectedProject
                          )?.name}
                        </p>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-4">
                      {date ? format(date, "EEEE d MMMM yyyy", { locale: fr }) : "Sélectionnez une date"}
                    </h3>
                    {filteredTasks.length > 0 ? (
                      <div className="space-y-2">
                        {filteredTasks.map(task => (
                          <div
                            key={task.id}
                            className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{task.name}</h4>
                              <Badge variant={task.status === "Completed" ? "secondary" : "default"}>
                                {task.status === "Completed" ? "Terminé" : "En cours"}
                              </Badge>
                            </div>
                            {task.projectName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Projet: {task.projectName}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Aucune tâche prévue pour cette date
                      </p>
                    )}
                  </div>
                  <div className="w-full lg:w-4/5 ">
                    <div className="h-full w-full">
                        {viewMode === "day" ? (
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border w-full h-full"
                            locale={fr}
                            modifiers={{
                              hasTasks: (day) => tasks.some(task => {
                                const taskDate = new Date(task.end_date)
                                return (
                                  taskDate.getDate() === day.getDate() &&
                                  taskDate.getMonth() === day.getMonth() &&
                                  taskDate.getFullYear() === day.getFullYear()
                                )
                              })
                            }}
                            modifiersStyles={{
                              hasTasks: {
                                borderBottom: '2px solid #3b82f6'
                              }
                            }}
                          />
                        ) : (
                          <Calendar
                            mode="range"
                            selected={{ from: date, to: date }}
                            onSelect={(range) => range?.from && setDate(range.from)}
                            className="rounded-md border w-full h-full"
                            locale={fr}
                            month={date}
                            onMonthChange={setDate}
                            modifiers={{
                              hasTasks: (day) => tasks.some(task => {
                                const taskDate = new Date(task.end_date)
                                return (
                                  taskDate.getMonth() === day.getMonth() &&
                                  taskDate.getFullYear() === day.getFullYear()
                                )
                              })
                            }}
                            modifiersStyles={{
                              hasTasks: {
                                borderBottom: '2px solid #3b82f6'
                              }
                            }}
                          />
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
