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
import {
    IconDownload,
    IconHistory,
    IconListCheck,
    IconSearch,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { StatsCards } from "@/components/stats-cards"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { createTask, fetchProjects, supabase } from "@/lib/supabaseClient"

type TaskStatus = "Planned" | "In Progress" | "Completed"

export default function Page() {
    const { theme } = useTheme()
    const [search, setSearch] = React.useState("")
    const [openDialog, setOpenDialog] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    const [tasks, setTasks] = React.useState<any[]>([])
    const [projects, setProjects] = React.useState<any[]>([])
    const [fetching, setFetching] = React.useState(false)
    const [newTask, setNewTask] = React.useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Planned" as TaskStatus,
        projectId: 1, // valeur par défaut pour éviter undefined
        week: "",
    })

    // Fetch projets et tâches depuis Supabase
    const fetchAll = async () => {
        setFetching(true)
        setError(null)
        try {
            const { data: tasksData, error: tasksError } = await supabase
                .from("tasks")
                .select("*, projects:id (name, status, start_date, end_date)")
                .order("start_date", { ascending: true })
            if (tasksError) throw tasksError
            // Correction du mapping des tâches Supabase : cast explicite en 'Record<string, any>' pour le spread
            setTasks(
                Array.isArray(tasksData)
                    ? tasksData.map((task: unknown) => {
                          if (typeof task === "object" && task !== null) {
                              const t = task as Record<string, any>
                              return {
                                  ...t,
                                  projectName: t.projects?.name,
                                  projectStatus: t.projects?.status,
                                  projectStart: t.projects?.start_date,
                                  projectEnd: t.projects?.end_date,
                              }
                          }
                          return {}
                      })
                    : []
            )
            const projs = await fetchProjects()
            setProjects(projs)
            // Préselection projet par défaut
            if (projs.length && newTask.projectId === undefined) {
                setNewTask(t => ({ ...t, projectId: projs[0].id }))
            }
        } catch (err: any) {
            setError("Erreur chargement données: " + err.message)
        } finally {
            setFetching(false)
        }
    }

    React.useEffect(() => {
        fetchAll()
        // eslint-disable-next-line
    }, [])

    // Statistiques dynamiques
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === "Completed").length
    const inProgressTasks = tasks.filter(t => t.status === "In Progress").length
    const plannedTasks = tasks.filter(t => t.status === "Planned").length
    const overdueTasks = tasks.filter(t => {
        if (t.status === "Completed") return false
        const end = new Date(t.end_date)
        return end < new Date()
    }).length

    // Filtrage dynamique
    const filteredTasks = tasks.filter(task => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
            task.name?.toLowerCase().includes(q) ||
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
                                <Dialog
                                    open={openDialog}
                                    onOpenChange={setOpenDialog}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="sm">
                                            + Nouvelle tâche
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Nouvelle tâche
                                            </DialogTitle>
                                            <DialogDescription>
                                                Créer une nouvelle tâche
                                                (données non persistées)
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form
                                            className="flex flex-col gap-3"
                                            onSubmit={async e => {
                                                e.preventDefault()
                                                setLoading(true)
                                                setError(null)
                                                setSuccess(null)
                                                try {
                                                    const created =
                                                        await createTask({
                                                            name: newTask.name,
                                                            description:
                                                                newTask.description,
                                                            start_date:
                                                                newTask.start_date,
                                                            end_date:
                                                                newTask.end_date,
                                                            status: newTask.status,
                                                            project_id:
                                                                newTask.projectId,
                                                            week: newTask.week,
                                                        })
                                                    if (created) {
                                                        setSuccess(
                                                            "Tâche créée avec succès !"
                                                        )
                                                        setOpenDialog(false)
                                                        setNewTask({
                                                            name: "",
                                                            description: "",
                                                            start_date: "",
                                                            end_date: "",
                                                            status: "Planned",
                                                            projectId:
                                                                projects[0]?.id,
                                                            week: "",
                                                        })
                                                        await fetchAll()
                                                    } else {
                                                        setError(
                                                            "Erreur lors de la création de la tâche."
                                                        )
                                                    }
                                                } catch (err) {
                                                    setError(
                                                        "Erreur inattendue : " +
                                                            (err as any)
                                                                ?.message
                                                    )
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                        >
                                            <input
                                                className="border rounded px-2 py-1"
                                                placeholder="Nom de la tâche"
                                                required
                                                value={newTask.name}
                                                onChange={e =>
                                                    setNewTask(t => ({
                                                        ...t,
                                                        name: e.target.value,
                                                    }))
                                                }
                                            />
                                            <textarea
                                                className="border rounded px-2 py-1"
                                                placeholder="Description"
                                                value={newTask.description}
                                                onChange={e =>
                                                    setNewTask(t => ({
                                                        ...t,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    className="border rounded px-2 py-1 flex-1"
                                                    type="date"
                                                    required
                                                    value={newTask.start_date}
                                                    onChange={e =>
                                                        setNewTask(t => ({
                                                            ...t,
                                                            start_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                                <input
                                                    className="border rounded px-2 py-1 flex-1"
                                                    type="date"
                                                    required
                                                    value={newTask.end_date}
                                                    onChange={e =>
                                                        setNewTask(t => ({
                                                            ...t,
                                                            end_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={newTask.status}
                                                onChange={e =>
                                                    setNewTask(t => ({
                                                        ...t,
                                                        status: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="Planned">
                                                    À faire
                                                </option>
                                                <option value="In Progress">
                                                    En cours
                                                </option>
                                                <option value="Completed">
                                                    Terminé
                                                </option>
                                            </select>
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={newTask.projectId}
                                                onChange={e =>
                                                    setNewTask(t => ({
                                                        ...t,
                                                        projectId: Number(
                                                            e.target.value
                                                        ),
                                                    }))
                                                }
                                            >
                                                {projects.map(p => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                    >
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className="border rounded px-2 py-1"
                                                placeholder="Semaine (ex: Semaine 1)"
                                                value={newTask.week}
                                                onChange={e =>
                                                    setNewTask(t => ({
                                                        ...t,
                                                        week: e.target.value,
                                                    }))
                                                }
                                            />
                                            {error && (
                                                <div className="text-red-600 text-xs">
                                                    {error}
                                                </div>
                                            )}
                                            {success && (
                                                <div className="text-green-600 text-xs">
                                                    {success}
                                                </div>
                                            )}
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        Annuler
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading
                                                        ? "Création..."
                                                        : "Créer"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
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
                                        {projects.map(project => {
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
                        {fetching && (
                            <div className="text-sm text-muted-foreground">
                                Chargement des tâches...
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
