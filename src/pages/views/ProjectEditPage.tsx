import { AppSidebar } from "@/components/app-sidebar"

import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    fetchProjectWithTasks,
    updateProject,
    deleteProject,
} from "@/lib/supabaseClient"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function Page() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [project, setProject] = useState<any | null>(null)
    const [showDelete, setShowDelete] = useState(false)

    useEffect(() => {
        if (!id) return
        fetchProjectWithTasks(Number(id)).then(p => {
            setProject(p)
            setLoading(false)
        })
    }, [id])

    const handleChange = (field: string, value: any) => {
        setProject((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const updated = await updateProject(Number(id), {
                name: project.name,
                description: project.description,
                start_date: project.start_date,
                end_date: project.end_date,
                status: project.status,
                responsable: project.responsable,
                risques: project.risques,
            })
            if (updated) {
                setSuccess("Projet mis à jour !")
                setTimeout(() => navigate(`/projects/${id}`), 1200)
            } else {
                setError("Erreur lors de la mise à jour.")
            }
        } catch (err: any) {
            setError("Erreur inattendue : " + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setSaving(true)
        setError(null)
        try {
            const ok = await deleteProject(Number(id))
            if (ok) {
                setSuccess("Projet supprimé.")
                setTimeout(() => navigate("/projects"), 1000)
            } else {
                setError("Erreur lors de la suppression.")
            }
        } catch (err: any) {
            setError("Erreur inattendue : " + err.message)
        } finally {
            setSaving(false)
            setShowDelete(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[40vh]">
                <span className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                <div className="text-muted-foreground text-lg font-medium ml-4">
                    Chargement du projet...
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-8 text-center text-destructive">
                Projet introuvable
            </div>
        )
    }

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
                <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
                    <form
                        onSubmit={handleSave}
                        className="w-full max-w-xl bg-card rounded-lg shadow p-8 flex flex-col gap-6 border"
                    >
                        <h1 className="text-2xl font-bold mb-2">
                            Modifier le projet
                        </h1>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Nom du projet</label>
                            <Input
                                value={project.name}
                                onChange={e =>
                                    handleChange("name", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Description</label>
                            <Textarea
                                value={project.description}
                                onChange={e =>
                                    handleChange("description", e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Dates</label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={project.start_date}
                                    onChange={e =>
                                        handleChange(
                                            "start_date",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <Input
                                    type="date"
                                    value={project.end_date}
                                    onChange={e =>
                                        handleChange("end_date", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Statut</label>
                            <Select
                                value={project.status}
                                onValueChange={v => handleChange("status", v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planning">
                                        Planifié
                                    </SelectItem>
                                    <SelectItem value="In Progress">
                                        En cours
                                    </SelectItem>
                                    <SelectItem value="Completed">
                                        Terminé
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Responsable</label>
                            <Input
                                value={project.responsable || ""}
                                onChange={e =>
                                    handleChange("responsable", e.target.value)
                                }
                                placeholder="Nom du responsable"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Risques</label>
                            <Textarea
                                value={project.risques || ""}
                                onChange={e =>
                                    handleChange("risques", e.target.value)
                                }
                                rows={2}
                                placeholder="Risques identifiés (optionnel)"
                            />
                        </div>
                        {error && (
                            <div className="text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-600 text-sm">
                                {success}
                            </div>
                        )}
                        <div className="flex gap-2 justify-between mt-4">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDelete(true)}
                            >
                                Supprimer
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving
                                        ? "Enregistrement..."
                                        : "Enregistrer"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </SidebarInset>
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer ce projet ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Toutes les tâches
                            associées seront également supprimées.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    )
}
