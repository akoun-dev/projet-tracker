import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate } from "react-router-dom"

export type TaskRow = {
  id: number
  name: string
  status: string
  start_date: string
  end_date: string
  projectName?: string
  projectStatus?: string
  notes?: string
}

type Props = {
  tasks: TaskRow[]
  showProject?: boolean
}

export function TasksTable({ tasks, showProject = true }: Props) {
  const navigate = useNavigate()
  // Ajout d'un état local pour forcer le re-render lors du changement de statut
  const [, setForceUpdate] = React.useState(0)

  // Gestion du clic sur la case à cocher
  const handleStatusChange = (task: TaskRow, checked: boolean) => {
    task.status = checked ? "Completed" : "In Progress"
    setForceUpdate(v => v + 1)
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2"></TableHead>
            <TableHead className="w-1/4">Tâche</TableHead>
            {showProject && <TableHead>Projet</TableHead>}
            <TableHead>Statut</TableHead>
            <TableHead>Début de début</TableHead>
            <TableHead>Fin de fin</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <TableCell>
                <Checkbox
                  checked={task.status === "Completed"}
                  onCheckedChange={checked => handleStatusChange(task, !!checked)}
                  aria-label={`Marquer ${task.name} comme faite`}
                />
              </TableCell>
              <TableCell className="font-medium">{task.name}</TableCell>
              {showProject && <TableCell className="text-xs text-muted-foreground">{task.projectName}</TableCell>}
              <TableCell>
                <Badge variant={task.status === "Completed" ? "secondary" : task.status === "In Progress" ? "default" : "outline"}>
                  {task.status === "Completed" ? "Fait" : task.status === "In Progress" ? "En cours" : "À faire"}
                </Badge>
              </TableCell>
              <TableCell>{task.start_date}</TableCell>
              <TableCell>{task.end_date}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{task.notes || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
