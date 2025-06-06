import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    IconFolder,
    IconCalendarEvent,
    IconEye,
    IconCheckupList,
} from "@tabler/icons-react"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
import { Input } from "@/components/ui/input"
import { StatsCards } from "@/components/stats-cards"
import { Button } from "@/components/ui/button"
import { IconDownload, IconHistory } from "@tabler/icons-react"
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
import { createProject, fetchProjects, supabase } from "@/lib/supabaseClient"

export default function Page() {
    const { theme } = useTheme()
    const [search, setSearch] = useState("")
    const [openDialog, setOpenDialog] = useState(false)
    const [projects, setProjects] = useState<any[]>([])
    const [newProject, setNewProject] = useState<{
        name: string
        description: string
        start_date: string
        end_date: string
        status: "Planning" | "In Progress" | "Completed"
    }>({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Planning",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Calcul des stats globales à partir des projets Supabase
    const allTasks = projects.flatMap(p =>
        Array.isArray(p.tasks) ? p.tasks : []
    )
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === "Completed").length
    const inProgressTasks = allTasks.filter(
        t => t.status === "In Progress"
    ).length
    const plannedTasks = allTasks.filter(t => t.status === "Planned").length
    const overdueTasks = allTasks.filter(t => {
        if (t.status === "Completed") return false
        const end = new Date(t.end_date)
        return end < new Date()
    }).length

    // Filtrage projets Supabase
    const filteredProjects = projects.filter(project => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
            project.name?.toLowerCase().includes(q) ||
            project.description?.toLowerCase().includes(q) ||
            (project.status && project.status.toLowerCase().includes(q))
        )
    })

    useEffect(() => {
        fetchProjects().then(async projs => {
            // Pour chaque projet, charger ses tâches (optionnel, si besoin d'afficher la progression)
            const projectsWithTasks = await Promise.all(
                projs.map(async p => {
                    const { data: tasks } = await supabase
                        .from("tasks")
                        .select("*")
                        .eq("project_id", p.id)
                    return { ...p, tasks: tasks || [] }
                })
            )
            setProjects(projectsWithTasks)
        })
    }, [])

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
                    <div className="flex flex-col gap-6 py-6 px-4 mx-auto w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Projets</h1>
                            <div className="flex gap-2">
                                <Dialog
                                    open={openDialog}
                                    onOpenChange={setOpenDialog}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="sm">
                                            + Nouveau projet
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Nouveau projet
                                            </DialogTitle>
                                            <DialogDescription>
                                                Créer un nouveau projet (données
                                                non persistées)
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
                                                        await createProject(
                                                            newProject
                                                        )
                                                    if (created) {
                                                        setSuccess(
                                                            "Projet créé avec succès !"
                                                        )
                                                        setOpenDialog(false)
                                                        setNewProject({
                                                            name: "",
                                                            description: "",
                                                            start_date: "",
                                                            end_date: "",
                                                            status: "Planning",
                                                        })
                                                        // Recharge la liste depuis Supabase
                                                        const refreshed =
                                                            await fetchProjects()
                                                        setProjects(refreshed)
                                                    } else {
                                                        setError(
                                                            "Erreur lors de la création du projet."
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
                                                placeholder="Nom du projet"
                                                required
                                                value={newProject.name}
                                                onChange={e =>
                                                    setNewProject(p => ({
                                                        ...p,
                                                        name: e.target.value,
                                                    }))
                                                }
                                            />
                                            <textarea
                                                className="border rounded px-2 py-1"
                                                placeholder="Description"
                                                value={newProject.description}
                                                onChange={e =>
                                                    setNewProject(p => ({
                                                        ...p,
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
                                                    value={
                                                        newProject.start_date
                                                    }
                                                    onChange={e =>
                                                        setNewProject(p => ({
                                                            ...p,
                                                            start_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                                <input
                                                    className="border rounded px-2 py-1 flex-1"
                                                    type="date"
                                                    required
                                                    value={newProject.end_date}
                                                    onChange={e =>
                                                        setNewProject(p => ({
                                                            ...p,
                                                            end_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={newProject.status}
                                                onChange={e =>
                                                    setNewProject(p => ({
                                                        ...p,
                                                        status: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="Planning">
                                                    Planifié
                                                </option>
                                                <option value="In Progress">
                                                    En cours
                                                </option>
                                                <option value="Completed">
                                                    Terminé
                                                </option>
                                            </select>
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
                                    <IconDownload className="w-4 h-4 mr-1" />
                                    Exporter
                                </Button>
                                <Button variant="outline" size="sm">
                                    <IconHistory className="w-4 h-4 mr-1" />
                                    Historique
                                </Button>
                            </div>
                        </div>

                        {/* Cartes de stats dashboard */}
                        <StatsCards
                            totalTasks={totalTasks}
                            completedTasks={completedTasks}
                            inProgressTasks={inProgressTasks}
                            plannedTasks={plannedTasks}
                            overdueTasks={overdueTasks}
                        />

                        {/* Zone de recherche */}
                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                type="text"
                                placeholder="Rechercher un projet..."
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

                        {/* Vue cartes des projets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => {
                                const totalTasks = Array.isArray(project.tasks)
                                    ? project.tasks.length
                                    : 0
                                const completedTasks = Array.isArray(
                                    project.tasks
                                )
                                    ? project.tasks.filter(
                                          (t: any) => t.status === "Completed"
                                      ).length
                                    : 0
                                const progress =
                                    totalTasks > 0
                                        ? Math.round(
                                              (completedTasks / totalTasks) *
                                                  100
                                          )
                                        : 0
                                let badgeVariant:
                                    | "default"
                                    | "secondary"
                                    | "outline" = "outline"
                                let badgeLabel = project.status
                                if (project.status === "In Progress") {
                                    badgeVariant = "default"
                                    badgeLabel = "Actif"
                                } else if (project.status === "Completed") {
                                    badgeVariant = "secondary"
                                    badgeLabel = "Terminé"
                                } else if (project.status === "Planning") {
                                    badgeVariant = "outline"
                                    badgeLabel = "Planifié"
                                }
                                return (
                                    <Card
                                        key={project.id}
                                        className="p-4 flex flex-col gap-2 border shadow-sm bg-background/90 group hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconFolder className="w-6 h-6 text-primary" />
                                            <span className="font-semibold text-base flex-1 truncate group-hover:text-primary transition-colors">
                                                {project.name}
                                            </span>
                                            <Badge
                                                variant={badgeVariant}
                                                className="text-xs px-2 py-0.5 ml-2"
                                            >
                                                {badgeLabel}
                                            </Badge>
                                        </div>
                                        {/* Dates */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                            <IconCalendarEvent className="w-4 h-4" />
                                            <span>
                                                {project.start_date} →{" "}
                                                {project.end_date}
                                            </span>
                                        </div>
                                        {/* Description concise */}
                                        <p className="text-xs text-foreground/90 mb-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                        {/* Progression et ratio */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                variant={
                                                    completedTasks ===
                                                        totalTasks &&
                                                    totalTasks > 0
                                                        ? "secondary"
                                                        : completedTasks > 0
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="text-xs px-2 py-0.5"
                                            >
                                                <IconCheckupList className="w-4 h-4 text-green-600 mr-1" />
                                                {completedTasks}/{totalTasks}{" "}
                                                faites
                                            </Badge>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 bg-primary transition-all duration-300"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground w-8 text-right">
                                                {progress}%
                                            </span>
                                        </div>
                                        {/* Action */}
                                        <div className="flex items-center justify-end mt-auto pt-1">
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="text-primary underline text-xs flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform"
                                            >
                                                <IconEye className="w-4 h-4" />{" "}
                                                Voir
                                            </Link>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
