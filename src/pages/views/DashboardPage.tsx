import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
import { fetchProjects, supabase } from "@/lib/supabaseClient"

export default function Page() {
    const { theme } = useTheme()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            const projs = await fetchProjects()
            // Pour chaque projet, charger ses tâches
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
            setLoading(false)
        }
        fetchAll()
    }, [])

    // Génération des lignes du tableau à partir des projets dynamiques
    const data = projects.map((item, idx) => ({
        header: item.name ?? "",
        id: item.id,
        status: item.status ?? "",
        type: "Projet",
        target: item.start_date ?? "",
        limit: item.end_date ?? "",
        reviewer: "",
        start_date: item.start_date,
        end_date: item.end_date,
    }))

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
                <div className="flex flex-1 flex-col" data-theme={theme}>
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <SectionCards projects={projects} />
                            <div className="px-4 lg:px-6">
                                <ChartAreaInteractive projects={projects} />
                            </div>
                            <div className="bg-background rounded shadow">
                                <DataTable data={data} />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
