import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"

import dataJson from "./data.json"

type DataRow = {
  header: string
  id: number
  status: string
  type: string
  target: string
  limit: string
  start_date?: string
  end_date?: string
  reviewer?: string
}

// Map dataJson to DataRow[]
const data: DataRow[] = (dataJson as any[]).map((item, idx) => ({
  header: item.name ?? "",
  id: item.id,
  status: item.status ?? "",
  type: "", // Provide a default or map accordingly
  target: item.start_date ?? "", // Use start_date from dataJson if available
  limit: item.end_date ?? "",   // Use end_date from dataJson if available
  reviewer: "", // Provide a default or map accordingly
  start_date: item.start_date,
  end_date: item.end_date,
}))



export default function Page() {
  const { theme } = useTheme()

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
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="bg-background rounded shadow">
                <DataTable 
                  data={data.map(project => ({
                    ...project,
                    header: project.header,
                    target: project.target || project.start_date || "",
                    limit: project.limit || project.end_date || "",
                    type: project.type || "Projet",
                    reviewer: project.reviewer || "Assign reviewer"
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
