import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { useTheme } from "@/hooks/use-theme"

import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TasksTable } from "@/components/tasks-table"
import projectsData from "./data.json"
import {
    IconDownload,
    IconHistory,
    IconListCheck,
    IconSearch,
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { StatsCards } from "@/components/stats-cards"

export default function Page() {
    const { theme } = useTheme()
    // Regroupement de toutes les tâches de tous les projets
    const [search, setSearch] = React.useState("")
    const allTasks = projectsData.flatMap(project =>
        Object.values(project.tasks)
            .flat()
            .map(task => ({
                ...task,
                projectName: project.name,
                projectId: project.id,
                projectStatus: project.status,
                projectStart: project.start_date,
                projectEnd: project.end_date,
            }))
    )
    
    // Calcul des statistiques des tâches
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === "Completed").length
    const inProgressTasks = allTasks.filter(t => t.status === "In Progress").length
    const plannedTasks = allTasks.filter(t => t.status === "Planned").length
    const overdueTasks = allTasks.filter(t => {
        if (t.status === "Completed") return false
        const end = new Date(t.end_date)
        return end < new Date()
    }).length

    // Filtrage des tâches (nom, projet, description)
    const filteredTasks = allTasks.filter(task => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
            task.name.toLowerCase().includes(q) ||
            (task.projectName && task.projectName.toLowerCase().includes(q)) ||
            (task.description && task.description.toLowerCase().includes(q))
        )
    })

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div
                    className="flex flex-1 flex-col bg-muted/40"
                    data-theme={theme}
                >
                    <div className="flex flex-col gap-6 py-6 px-4  mx-auto w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">
                                Toutes les tâches
                            </h1>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <IconDownload className="w-4 h-4 mr-1" />{" "}
                                    Exporter
                                </Button>
                                <Button variant="outline" size="sm">
                                    <IconHistory className="w-4 h-4 mr-1" />{" "}
                                    Historique
                                </Button>
                            </div>
                        </div>
                        <StatsCards 
                          totalTasks={totalTasks}
                          completedTasks={completedTasks}
                          inProgressTasks={inProgressTasks}
                          plannedTasks={plannedTasks}
                          overdueTasks={overdueTasks}
                        />
                        {/* Zone de recherche tâches */}
                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                type="text"
                                placeholder="Rechercher une tâche ou un projet..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="text-xs text-muted-foreground underline ml-2"
                                >
                                    Effacer
                                </button>
                            )}
                        </div>
                        <Tabs defaultValue="liste" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="liste">
                                    <IconListCheck className="w-4 h-4 mr-1" />{" "}
                                    Liste
                                </TabsTrigger>
                                <TabsTrigger value="projets">
                                    <IconSearch className="w-4 h-4 mr-1" /> Par
                                    projet
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="liste">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Liste complète des tâches
                                        </CardTitle>
                                        <CardDescription>
                                            Visualisez, filtrez et exportez
                                            toutes les tâches de tous les
                                            projets.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TasksTable
                                            tasks={filteredTasks}
                                            showProject={true}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="projets">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tâches par projet</CardTitle>
                                        <CardDescription>
                                            Consultez les tâches regroupées par
                                            projet.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {projectsData.map(project => {
                                            const projectTasks = Object.values(
                                                project.tasks
                                            )
                                                .flat()
                                                .map(task => ({
                                                    ...task,
                                                    projectName: project.name,
                                                    projectStatus:
                                                        project.status,
                                                    notes:
                                                        "notes" in task &&
                                                        typeof (task as any)
                                                            .notes === "string"
                                                            ? (task as any)
                                                                  .notes
                                                            : "",
                                                }))
                                            const completed =
                                                projectTasks.filter(
                                                    t =>
                                                        t.status === "Completed"
                                                ).length
                                            const progress = projectTasks.length
                                                ? Math.round(
                                                      (completed /
                                                          projectTasks.length) *
                                                          100
                                                  )
                                                : 0
                                            return (
                                                <div
                                                    key={project.id}
                                                    className="mb-8 p-4 bg-background rounded-lg border shadow-sm"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-primary">
                                                                {project.name}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    project.status ===
                                                                    "In Progress"
                                                                        ? "default"
                                                                        : project.status ===
                                                                          "Completed"
                                                                        ? "secondary"
                                                                        : "outline"
                                                                }
                                                            >
                                                                {project.status ===
                                                                "In Progress"
                                                                    ? "Actif"
                                                                    : project.status ===
                                                                      "Completed"
                                                                    ? "Terminé"
                                                                    : "Planifié"}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                {
                                                                    project.start_date
                                                                }{" "}
                                                                →{" "}
                                                                {
                                                                    project.end_date
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs">
                                                                {completed} /{" "}
                                                                {
                                                                    projectTasks.length
                                                                }{" "}
                                                                tâches faites
                                                            </span>
                                                            <div className="w-32">
                                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-2 bg-primary"
                                                                        style={{
                                                                            width: `${progress}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className="text-xs">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <TasksTable
                                                        tasks={projectTasks}
                                                        showProject={false}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
