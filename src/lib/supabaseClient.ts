import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonctions utilitaires pour les projets
export const fetchProjects = async () => {
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching projects:", error)
        return []
    }

    return data
}

export const fetchProjectWithTasks = async (projectId: number) => {
    const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

    if (projectError) {
        console.error("Error fetching project:", projectError)
        return null
    }

    const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: true })

    if (tasksError) {
        console.error("Error fetching tasks:", tasksError)
        return { ...projectData, tasks: {} }
    }

    // Grouper les tâches par semaine
    const tasksByWeek = tasksData.reduce((acc, task) => {
        const week = task.week || "Non classé"
        if (!acc[week]) {
            acc[week] = []
        }
        acc[week].push(task)
        return acc
    }, {} as Record<string, typeof tasksData>)

    return { ...projectData, tasks: tasksByWeek }
}

export const updateTaskStatus = async (
    taskId: number,
    status: "Planned" | "In Progress" | "Completed"
) => {
    const { data, error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)
        .select()

    if (error) {
        console.error("Error updating task:", error)
        return null
    }

    return data[0]
}

// --- CRUD Projets ---
export const createProject = async (project: {
    name: string
    description?: string
    start_date: string
    end_date: string
    status: "Planning" | "In Progress" | "Completed"
}) => {
    const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
    if (error) {
        console.error("Erreur création projet:", error)
        return null
    }
    return data[0]
}

export const updateProject = async (
    id: number,
    updates: Partial<Omit<Parameters<typeof createProject>[0], "id">>
) => {
    const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
    if (error) {
        console.error("Erreur modification projet:", error)
        return null
    }
    return data[0]
}

export const deleteProject = async (id: number) => {
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (error) {
        console.error("Erreur suppression projet:", error)
        return false
    }
    return true
}

// --- CRUD Tâches ---
export const createTask = async (task: {
    name: string
    description?: string
    start_date: string
    end_date: string
    status: "Planned" | "In Progress" | "Completed"
    project_id: number
    week?: string
    notes?: string
}) => {
    const { data, error } = await supabase.from("tasks").insert([task]).select()
    if (error) {
        console.error("Erreur création tâche:", error)
        return null
    }
    return data[0]
}

export const updateTask = async (
    id: number,
    updates: Partial<
        Omit<Parameters<typeof createTask>[0], "id" | "project_id">
    >
) => {
    const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
    if (error) {
        console.error("Erreur modification tâche:", error)
        return null
    }
    return data[0]
}

export const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) {
        console.error("Erreur suppression tâche:", error)
        return false
    }
    return true
}
