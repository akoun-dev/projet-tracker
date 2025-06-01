import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Link } from "react-router-dom"
import { IconFolder, IconCalendarEvent, IconList, IconEye, IconCheckupList } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"

import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DataTable, ProjectDataTable } from "@/components/data-table"
import { useTheme } from "@/hooks/use-theme"
import { Input } from "@/components/ui/input"

import projectsData from "./data.json"

// Stats des projets
const projectStats = [
  {
    label: "Projets actifs",
    value: projectsData.filter(p => p.status === "In Progress").length,
    icon: <IconFolder className="w-6 h-6 text-primary" />,
  },
  {
    label: "Projets à venir",
    value: projectsData.filter(p => p.status === "Planning").length,
    icon: <IconCalendarEvent className="w-6 h-6 text-primary" />,
  },
  {
    label: "Projets terminés",
    value: projectsData.filter(p => p.status === "Completed").length,
    icon: <IconCheckupList className="w-6 h-6 text-green-600" />,
  },
]

// Colonnes pour DataTable (vue liste)
const columns = [
  {
    header: () => <span className="text-lg font-bold text-primary">Nom</span>,
    accessorKey: "name",
    cell: (info: any) => (
      <Link 
        to={`/projects/${info.row.original.id}`}
        className="font-medium flex items-center gap-2 hover:text-primary"
      >
        <IconFolder className="text-primary w-4 h-4" />
        {info.getValue()}
      </Link>
    ),
  },
  {
    header: () => <span className="text-lg font-bold text-primary">Description</span>,
    accessorKey: "description",
    cell: (info: any) => <span>{info.getValue()}</span>,
  },
  {
    header: () => <span className="text-lg font-bold text-primary">Dates</span>,
    cell: (info: any) => (
      <span className="flex items-center gap-1 text-xs"><IconCalendarEvent className="inline w-4 h-4" />{info.row.original.start} - {info.row.original.end}</span>
    ),
  },
  {
    header: () => <span className="text-lg font-bold text-primary">Action</span>,
    cell: (info: any) => (
      <Link 
        to={`/projects/${info.row.original.id}`}
        className="text-primary underline text-sm flex items-center gap-1 hover:translate-x-1 transition-transform"
      >
        <IconEye className="w-4 h-4" /> Voir
      </Link>
    ),
  },
]

// Colonnes adaptées pour un tableau de projets
const projectTableColumns = [
  {
    id: "project",
    header: () => <span className="text-lg font-bold text-primary">Projet</span>,
    accessorKey: "header",
    cell: (info: any) => (
      <span className="font-medium flex items-center gap-2">
        <IconFolder className="text-primary w-4 h-4" />
        <div>
          <div>{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.description}</div>
        </div>
      </span>
    ),
  },
  {
    id: "type",
    header: () => <span className="text-lg font-bold text-primary">Type</span>,
    accessorKey: "type",
    cell: (info: any) => (
      <span className="text-sm">{info.getValue()}</span>
    ),
  },
  {
    id: "status",
    header: () => <span className="text-lg font-bold text-primary">Statut</span>,
    accessorKey: "status",
    cell: (info: any) => (
      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
        {info.getValue()}
      </span>
    ),
  },
  {
    id: "period",
    header: () => <span className="text-lg font-bold text-primary">Période</span>,
    cell: (info: any) => (
      <div className="flex flex-col">
        <span className="text-sm">Début: {info.row.original.start}</span>
        <span className="text-sm">Fin: {info.row.original.end}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="text-lg font-bold text-primary">Actions</span>,
    cell: () => (
      <div className="flex gap-2">
        <button className="text-primary underline text-sm flex items-center gap-1">
          <IconEye className="w-4 h-4" /> Détails
        </button>
      </div>
    ),
  },
]

const VIEW_TYPES = [
  { key: "card", label: <IconFolder className="inline mr-1" /> },
  { key: "list", label: <IconList className="inline mr-1" /> },
  { key: "calendar", label: <IconCalendarEvent className="inline mr-1" /> },
]

export default function Page() {
  const { theme } = useTheme()
  const [view, setView] = useState("card")
  const [search, setSearch] = useState("")

  // Filtrage projets (nom, description, status)
  const filteredProjects = projectsData.filter(project => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      project.name.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      (project.status && project.status.toLowerCase().includes(q))
    )
  })

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Cartes de stats projets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {projectStats.map((stat) => (
                    <Card key={stat.label} className="flex items-center gap-4 p-4 shadow hover:shadow-lg transition-shadow">
                      <div>{stat.icon}</div>
                      <div>
                        <div className="text-2xl font-bold leading-tight">{stat.value}</div>
                        <div className="text-muted-foreground text-sm">{stat.label}</div>
                      </div>
                    </Card>
                  ))}
                </div>
                {/* Zone de recherche projets */}
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="Rechercher un projet..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-muted-foreground underline ml-2">Effacer</button>
                  )}
                </div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">Projets</h1>
                  <div className="flex gap-2">
                    {VIEW_TYPES.map((type) => (
                      <button
                        key={type.key}
                        className={`px-3 py-1 rounded border text-sm flex items-center gap-1 ${view === type.key ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                        onClick={() => setView(type.key)}
                        title={type.key.charAt(0).toUpperCase() + type.key.slice(1)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                {view === "card" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {filteredProjects.map((project) => {
                      const totalTasks = Object.values(project.tasks).flat().length
                      const completedTasks = Object.values(project.tasks).flat().filter(t => t.status === "Completed").length
                      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                      return (
                        <Card key={project.id} className="relative flex flex-col p-6 shadow group hover:shadow-xl transition-shadow border border-border/60 bg-background/80">
                          <div className="flex items-center gap-3 mb-2">
                            <IconFolder className="w-10 h-10 text-primary drop-shadow" />
                            <div className="flex-1">
                              <Link 
                                to={`/projects/${project.id}`}
                                className="font-bold text-lg leading-tight group-hover:text-primary transition-colors"
                              >
                                {project.name}
                              </Link>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <IconCalendarEvent className="inline w-4 h-4" /> {project.start_date} → {project.end_date}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 mb-4 line-clamp-3">{project.description}</p>
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-xs">
                              <span>Progression</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-2">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-accent/40 rounded px-2 py-1">
                              <IconCheckupList className="w-4 h-4 text-green-600" />
                              {completedTasks}/{totalTasks} tâches
                            </span>
                            <Link 
                              to={`/projects/${project.id}`}
                              className="text-primary underline text-sm flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform"
                            >
                              <IconEye className="w-4 h-4" /> Voir
                            </Link>
                          </div>
                          <span className="absolute top-3 right-3 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                            {project.status === "In Progress" ? "Actif" : project.status === "Completed" ? "Terminé" : project.status === "Planning" ? "Planifié" : project.status}
                          </span>
                        </Card>
                      )
                    })}
                  </div>
                )}
                {view === "list" && (
                  <div className="bg-background rounded shadow">
                    <DataTable 
                      data={filteredProjects.map(project => ({
                        ...project,
                        header: project.name,
                        target: project.start_date,
                        limit: project.end_date,
                        type: "Projet",
                        reviewer: "Assign reviewer"
                      }))}
                    />
                  </div>
                )}
                {view === "calendar" && (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground italic">
                    (Vue calendrier à venir)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
