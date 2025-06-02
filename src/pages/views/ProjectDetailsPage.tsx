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
    IconArrowLeft,
} from "@tabler/icons-react"
import * as React from "react"
import {
    fetchProjectWithTasks,
    createTask,
    updateTask,
    deleteTask,
} from "@/lib/supabaseClient"
import { Checkbox } from "@/components/ui/checkbox"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Task = {
    name: string
    start_date: string
    end_date: string
    status: string
    description: string
    id: number
    notes?: string
}

export default function ProjectDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    // Toujours déclarer les hooks ici, AVANT tout return conditionnel
    const [projectData, setProjectData] = React.useState<any | null>(null)
    const [, setForceUpdate] = React.useState(0)
    const [openDialog, setOpenDialog] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    const [newTask, setNewTask] = React.useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Planned" as "Planned" | "In Progress" | "Completed",
        week: "",
    })
    const [editTask, setEditTask] = React.useState<any | null>(null)
    const [editLoading, setEditLoading] = React.useState(false)
    const [editError, setEditError] = React.useState<string | null>(null)
    const [editSuccess, setEditSuccess] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!id) return
        fetchProjectWithTasks(Number(id)).then(setProjectData)
    }, [id])
    if (!projectData) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[40vh]">
                <div className="flex flex-col items-center gap-4">
                    <span className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                    <div className="text-muted-foreground text-lg font-medium">
                        Chargement du projet...
                    </div>
                </div>
            </div>
        )
    }

    // Calcul du pourcentage de complétion (recalculé à chaque render)
    const allTasks = Object.values(projectData.tasks || {}).flat()
    const progress =
        allTasks.length > 0
            ? Math.round(
                  (allTasks.filter((t: any) => t.status === "Completed")
                      .length /
                      allTasks.length) *
                      100
              )
            : 0
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
                <div
                    className="flex flex-1 flex-col bg-muted/40"
                    data-theme={theme}
                >
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
                                    <h1 className="text-3xl font-bold leading-tight mb-1 break-words max-w-full">
                                        {projectData.name}
                                    </h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline">Projet</Badge>
                                        <Badge
                                            variant={
                                                projectData.status ===
                                                "In Progress"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {projectData.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                                <Button variant="outline">Exporter</Button>
                                <Button
                                    onClick={() =>
                                        navigate(
                                            `/projects/${projectData.id}/edit`
                                        )
                                    }
                                >
                                    Modifier
                                </Button>
                            </div>
                        </div>

                        {/* Progression */}
                        <Card className="p-6 flex flex-col gap-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20 border w-full">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-primary flex items-center gap-2">
                                    <Progress
                                        className="w-4 h-4 mr-2"
                                        value={progress}
                                    />
                                    Progression
                                </span>
                                <span className="text-lg font-bold">
                                    {progress}%
                                </span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-3 rounded-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>
                                    Date de début : {projectData.start_date}
                                </span>
                                <span>
                                    Date de fin : {projectData.end_date}
                                </span>
                            </div>
                        </Card>

                        {/* Description */}
                        <Card className="p-6 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <IconFolder className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-lg">
                                    Description
                                </h2>
                            </div>
                            <p className="text-muted-foreground text-base leading-relaxed break-words max-w-full">
                                {projectData.description}
                            </p>
                        </Card>

                        {/* Grille infos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                            {/* Équipe */}
                            <Card className="p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <IconUsers className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Équipe</h3>
                                </div>
                                <div className="text-muted-foreground">
                                    Équipe à définir
                                </div>
                            </Card>
                            {/* Responsable */}
                            <Card className="p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <IconCircleCheck className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">
                                        Responsable
                                    </h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Responsable à définir
                                </p>
                            </Card>
                            {/* Calendrier */}
                            <Card className="p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <IconCalendarEvent className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Échéances</h3>
                                </div>
                                <div className="space-y-1 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Date de début:</span>
                                        <span>{projectData.start_date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date de fin:</span>
                                        <span>{projectData.end_date}</span>
                                    </div>
                                </div>
                            </Card>
                            {/* Risques */}
                            <Card className="p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <IconAlertCircle className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Risques</h3>
                                </div>
                                <div className="text-muted-foreground">
                                    Aucun risque identifié
                                </div>
                            </Card>
                        </div>

                        {/* Tâches */}
                        <Card className="p-6 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <IconCheckupList className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-lg">
                                    Tâches par semaine
                                </h2>
                                <Dialog
                                    open={openDialog}
                                    onOpenChange={setOpenDialog}
                                >
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="default">
                                            + Ajouter une tâche
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Nouvelle tâche
                                            </DialogTitle>
                                            <DialogDescription>
                                                Créer une nouvelle tâche pour ce
                                                projet
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
                                                                projectData.id,
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
                                                            week: "",
                                                        })
                                                        // Rafraîchir les tâches du projet
                                                        fetchProjectWithTasks(
                                                            Number(id)
                                                        ).then(setProjectData)
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
                                            <Input
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
                                            <Textarea
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
                                                <Input
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
                                                <Input
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
                                                        status: e.target
                                                            .value as any,
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
                                            <Input
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
                            </div>
                            <div className="space-y-6">
                                {Object.entries(projectData.tasks || {}).map(
                                    ([week, tasks]) => (
                                        <div
                                            key={week}
                                            className="border-b last:border-b-0 pb-4 last:pb-0"
                                        >
                                            <h3 className="font-medium mb-2 text-primary/80">
                                                {week}
                                            </h3>
                                            <ul className="space-y-2 pl-2">
                                                {(tasks as any[]).map(task => (
                                                    <li
                                                        key={`${task.id}-${task.name}`}
                                                        className="flex items-center gap-3 group cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition relative"
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                task.status ===
                                                                "Completed"
                                                            }
                                                            onClick={e =>
                                                                e.stopPropagation()
                                                            }
                                                            onCheckedChange={checked => {
                                                                task.status =
                                                                    checked
                                                                        ? "Completed"
                                                                        : "In Progress"
                                                                setForceUpdate(
                                                                    v => v + 1
                                                                )
                                                            }}
                                                            aria-label={
                                                                task.name
                                                            }
                                                        />
                                                        <span
                                                            className={`font-medium ${
                                                                task.status ===
                                                                "Completed"
                                                                    ? "line-through text-green-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {task.name}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                task.status ===
                                                                "Completed"
                                                                    ? "secondary"
                                                                    : task.status ===
                                                                      "In Progress"
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            className="ml-2"
                                                        >
                                                            {task.status ===
                                                            "Completed"
                                                                ? "Fait"
                                                                : task.status ===
                                                                  "In Progress"
                                                                ? "En cours"
                                                                : "À faire"}
                                                        </Badge>
                                                        {task.notes && (
                                                            <span className="ml-2 text-xs italic text-muted-foreground max-w-xs truncate">
                                                                {`📝 ${task.notes}`}
                                                            </span>
                                                        )}
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            className="ml-2"
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setEditTask({
                                                                    ...task,
                                                                })
                                                            }}
                                                        >
                                                            Modifier
                                                        </Button>
                                                        <span className="ml-auto text-xs text-primary/70 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                                            Voir détails{" "}
                                                            <IconArrowRight className="w-3 h-3" />
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                )}
                            </div>
                            {/* Modale édition tâche */}
                            <Dialog
                                open={!!editTask}
                                onOpenChange={v => !v && setEditTask(null)}
                            >
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Modifier la tâche
                                        </DialogTitle>
                                        <DialogDescription>
                                            Éditer ou supprimer cette tâche
                                        </DialogDescription>
                                    </DialogHeader>
                                    {editTask && (
                                        <form
                                            className="flex flex-col gap-3"
                                            onSubmit={async e => {
                                                e.preventDefault()
                                                setEditLoading(true)
                                                setEditError(null)
                                                setEditSuccess(null)
                                                try {
                                                    const updated =
                                                        await updateTask(
                                                            editTask.id,
                                                            {
                                                                name: editTask.name,
                                                                description:
                                                                    editTask.description,
                                                                start_date:
                                                                    editTask.start_date,
                                                                end_date:
                                                                    editTask.end_date,
                                                                status: editTask.status,
                                                                week: editTask.week,
                                                                notes: editTask.notes,
                                                            }
                                                        )
                                                    if (updated) {
                                                        setEditSuccess(
                                                            "Tâche modifiée !"
                                                        )
                                                        setTimeout(
                                                            () =>
                                                                setEditTask(
                                                                    null
                                                                ),
                                                            800
                                                        )
                                                        fetchProjectWithTasks(
                                                            Number(id)
                                                        ).then(setProjectData)
                                                    } else {
                                                        setEditError(
                                                            "Erreur lors de la modification."
                                                        )
                                                    }
                                                } catch (err: any) {
                                                    setEditError(
                                                        "Erreur inattendue : " +
                                                            err.message
                                                    )
                                                } finally {
                                                    setEditLoading(false)
                                                }
                                            }}
                                        >
                                            <Input
                                                className="border rounded px-2 py-1"
                                                placeholder="Nom de la tâche"
                                                required
                                                value={editTask.name}
                                                onChange={e =>
                                                    setEditTask(t => ({
                                                        ...t,
                                                        name: e.target.value,
                                                    }))
                                                }
                                            />
                                            <Textarea
                                                className="border rounded px-2 py-1"
                                                placeholder="Description"
                                                value={editTask.description}
                                                onChange={e =>
                                                    setEditTask(t => ({
                                                        ...t,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    className="border rounded px-2 py-1 flex-1"
                                                    type="date"
                                                    required
                                                    value={editTask.start_date}
                                                    onChange={e =>
                                                        setEditTask(t => ({
                                                            ...t,
                                                            start_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                                <Input
                                                    className="border rounded px-2 py-1 flex-1"
                                                    type="date"
                                                    required
                                                    value={editTask.end_date}
                                                    onChange={e =>
                                                        setEditTask(t => ({
                                                            ...t,
                                                            end_date:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <select
                                                className="border rounded px-2 py-1"
                                                value={editTask.status}
                                                onChange={e =>
                                                    setEditTask(t => ({
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
                                            <Input
                                                className="border rounded px-2 py-1"
                                                placeholder="Semaine (ex: Semaine 1)"
                                                value={editTask.week}
                                                onChange={e =>
                                                    setEditTask(t => ({
                                                        ...t,
                                                        week: e.target.value,
                                                    }))
                                                }
                                            />
                                            <Textarea
                                                className="border rounded px-2 py-1"
                                                placeholder="Notes"
                                                value={editTask.notes || ""}
                                                onChange={e =>
                                                    setEditTask(t => ({
                                                        ...t,
                                                        notes: e.target.value,
                                                    }))
                                                }
                                            />
                                            {editError && (
                                                <div className="text-red-600 text-xs">
                                                    {editError}
                                                </div>
                                            )}
                                            {editSuccess && (
                                                <div className="text-green-600 text-xs">
                                                    {editSuccess}
                                                </div>
                                            )}
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        setEditLoading(true)
                                                        setEditError(null)
                                                        try {
                                                            const ok =
                                                                await deleteTask(
                                                                    editTask.id
                                                                )
                                                            if (ok) {
                                                                setEditSuccess(
                                                                    "Tâche supprimée."
                                                                )
                                                                setTimeout(
                                                                    () =>
                                                                        setEditTask(
                                                                            null
                                                                        ),
                                                                    800
                                                                )
                                                                fetchProjectWithTasks(
                                                                    Number(id)
                                                                ).then(
                                                                    setProjectData
                                                                )
                                                            } else {
                                                                setEditError(
                                                                    "Erreur lors de la suppression."
                                                                )
                                                            }
                                                        } catch (err: any) {
                                                            setEditError(
                                                                "Erreur inattendue : " +
                                                                    err.message
                                                            )
                                                        } finally {
                                                            setEditLoading(
                                                                false
                                                            )
                                                        }
                                                    }}
                                                >
                                                    Supprimer
                                                </Button>
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
                                                    disabled={editLoading}
                                                >
                                                    {editLoading
                                                        ? "Enregistrement..."
                                                        : "Enregistrer"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
