import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, CalendarCheck, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface ProjectStatsCardsProps {
  totalProjects: number
  activeProjects: number
  plannedProjects: number
  completedProjects: number
  overdueProjects: number
}

export function ProjectStatsCards({
  totalProjects,
  activeProjects,
  plannedProjects,
  completedProjects,
  overdueProjects
}: ProjectStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total projets</CardTitle>
          <Folder className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((activeProjects / totalProjects) * 100)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Planifiés</CardTitle>
          <CalendarCheck className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plannedProjects}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((plannedProjects / totalProjects) * 100)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProjects}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((completedProjects / totalProjects) * 100)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">En retard</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueProjects}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((overdueProjects / totalProjects) * 100)}% du total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
