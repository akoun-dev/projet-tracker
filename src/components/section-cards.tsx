import dataJson from "../pages/views/data.json"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export function SectionCards() {
  // Statistiques calculées à partir des projets
  const totalProjects = dataJson.length
  const activeProjects = dataJson.filter((p: any) => p.status === "In Progress").length
  const plannedProjects = dataJson.filter((p: any) => p.status === "Planning").length
  const completedProjects = dataJson.filter((p: any) => p.status === "Completed").length
  const totalTasks = dataJson.reduce((acc: number, p: any) => acc + Object.values(p.tasks).flat().length, 0)
  const completedTasks = dataJson.reduce((acc: number, p: any) => acc + Object.values(p.tasks).flat().filter((t: any) => t.status === "Completed").length, 0)
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Projets actifs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeProjects} / {totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {((activeProjects / totalProjects) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activeProjects} projet(s) en cours
          </div>
          <div className="text-muted-foreground">
            {plannedProjects} à venir, {completedProjects} terminés
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tâches terminées</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completedTasks} / {totalTasks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {progress}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Progression globale
          </div>
          <div className="text-muted-foreground">
            {totalTasks} tâches au total
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Projets planifiés</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {plannedProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {((plannedProjects / totalProjects) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {plannedProjects} projet(s) à venir
          </div>
          <div className="text-muted-foreground">
            {totalProjects} projets au total
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Projets terminés</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completedProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {((completedProjects / totalProjects) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {completedProjects} projet(s) terminés
          </div>
          <div className="text-muted-foreground">
            {totalProjects} projets au total
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
