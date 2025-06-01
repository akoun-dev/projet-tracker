import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { StatsCards } from "@/components/stats-cards"
import { TrendingUp } from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    Pie,
    PieChart,
    Radar,
    RadarChart,
    PolarAngleAxis,
    PolarGrid,
    XAxis,
} from "recharts"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { SiteHeader } from "@/components/site-header"
import { useTheme } from "@/hooks/use-theme"
import { useMemo } from "react"
import data from "./data.json"

export default function Page() {
    const { theme } = useTheme()

    // Extraction des données réelles depuis data.json
    const projects = useMemo(() => data, [])
    // Statistiques globales dynamiques
    const totalTasks = useMemo(
        () =>
            projects.reduce(
                (acc, p) => acc + Object.values(p.tasks || {}).flat().length,
                0
            ),
        [projects]
    )
    const completedTasks = useMemo(
        () =>
            projects.reduce(
                (acc, p) =>
                    acc +
                    Object.values(p.tasks || {})
                        .flat()
                        .filter(t => t.status === "Completed").length,
                0
            ),
        [projects]
    )
    const inProgressTasks = useMemo(
        () =>
            projects.reduce(
                (acc, p) =>
                    acc +
                    Object.values(p.tasks || {})
                        .flat()
                        .filter(t => t.status === "In Progress").length,
                0
            ),
        [projects]
    )
    const plannedTasks = useMemo(
        () =>
            projects.reduce(
                (acc, p) =>
                    acc +
                    Object.values(p.tasks || {})
                        .flat()
                        .filter(t => t.status === "Planned").length,
                0
            ),
        [projects]
    )
    const overdueTasks = useMemo(
        () =>
            projects.reduce(
                (acc, p) =>
                    acc +
                    Object.values(p.tasks || {})
                        .flat()
                        .filter(t => {
                            if (t.status === "Completed") return false
                            const end = new Date(t.end_date)
                            return end < new Date() // tâche en retard
                        }).length,
                0
            ),
        [projects]
    )

    const months = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ]
    // Barres : nombre de tâches par statut (terminées, en cours, à faire) par mois
    const chartDataBar = months.slice(0, 6).map((month, i) => {
        let terminees = 0,
            enCours = 0,
            aFaire = 0
        projects.forEach(p => {
            Object.values(p.tasks || {})
                .flat()
                .forEach(t => {
                    const d = new Date(t.end_date)
                    if (d.getMonth() === i) {
                        if (t.status === "Completed") terminees++
                        else if (t.status === "In Progress") enCours++
                        else aFaire++
                    }
                })
        })
        return { month, terminees, enCours, aFaire }
    })
    const chartConfigBar = {
        terminees: {
            label: "Terminées",
            color: "#22c55e",
        },
        enCours: {
            label: "En cours",
            color: "#eab308",
        },
        aFaire: {
            label: "À faire",
            color: "#64748b",
        },
    } satisfies ChartConfig

    // Pie : répartition des projets par statut
    const chartDataPie = [
        {
            status: "En cours",
            value: projects.filter(p => p.status === "In Progress").length,
            fill: "#3b82f6",
        },
        {
            status: "Planifié",
            value: projects.filter(p => p.status === "Planning").length,
            fill: "#eab308",
        },
        {
            status: "Terminé",
            value: projects.filter(p => p.status === "Completed").length,
            fill: "#22c55e",
        },
    ]
    const chartConfigPie = {
        value: { label: "Projets" },
        "En cours": { label: "En cours", color: "#3b82f6" },
        Planifié: { label: "Planifié", color: "#eab308" },
        Terminé: { label: "Terminé", color: "#22c55e" },
    } satisfies ChartConfig

    const totalProjects = chartDataPie.reduce(
        (acc, curr) => acc + curr.value,
        0
    )

    // Radar : nombre de projets actifs par mois (projets ayant au moins une tâche ce mois)
    const chartDataRadar = months.slice(0, 6).map((month, i) => {
        let actifs = 0
        projects.forEach(p => {
            const hasTask = Object.values(p.tasks || {})
                .flat()
                .some(t => new Date(t.end_date).getMonth() === i)
            if (hasTask) actifs++
        })
        return { month, actifs }
    })
    const chartConfigRadar = {
        actifs: {
            label: "Projets actifs",
            color: "#3b82f6",
        },
    } satisfies ChartConfig

    // Chart radial : progression globale des tâches
    const globalProgress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const chartDataRadial = [{ name: "Progression", value: globalProgress }]

    // Bar chart empilé : répartition des tâches par projet (terminées, en cours, à faire)
    const chartDataStacked = projects.map(p => {
        const tasks = Object.values(p.tasks || {}).flat()
        return {
            projet: p.name,
            terminees: tasks.filter(t => t.status === "Completed").length,
            enCours: tasks.filter(t => t.status === "In Progress").length,
            aFaire: tasks.filter(t => t.status === "Planned").length,
        }
    })

    // Line chart : évolution des tâches terminées par mois
    const chartDataLine = months.slice(0, 6).map((month, i) => {
        let terminees = 0
        projects.forEach(p => {
            Object.values(p.tasks || {})
                .flat()
                .forEach(t => {
                    const d = new Date(t.end_date)
                    if (d.getMonth() === i && t.status === "Completed")
                        terminees++
                })
        })
        return { month, terminees }
    })
    // Donut chart : répartition des tâches par type (fallback si pas de champ type)
    const typeMap = new Map<string, number>()
    projects.forEach(p => {
        Object.values(p.tasks || {})
            .flat()
            .forEach(t => {
                // Utilise t.type si présent, sinon fallback sur t.status ou "Autre"
                const type = (t as any).type || t.status || "Autre"
                typeMap.set(type, (typeMap.get(type) || 0) + 1)
            })
    })
    const chartDataDonut = Array.from(typeMap.entries()).map(
        ([type, value]) => ({ type, value })
    )
    // ChartConfig pour radial chart progression globale
    const chartConfigRadial = {
        value: { label: "Progression", color: "#22c55e" },
    } satisfies ChartConfig
    // ChartConfig pour bar chart empilé par projet
    const chartConfigStacked = {
        terminees: { label: "Terminées", color: "#22c55e" },
        enCours: { label: "En cours", color: "#eab308" },
        aFaire: { label: "À faire", color: "#64748b" },
    } satisfies ChartConfig
    // ChartConfig pour line chart évolution tâches terminées
    const chartConfigLine = {
        terminees: { label: "Terminées", color: "#22c55e" },
    } satisfies ChartConfig
    // ChartConfig pour donut chart répartition tâches par type
    const chartConfigDonut = Object.fromEntries(
        chartDataDonut.map(d => [d.type, { label: d.type, color: "#3b82f6" }])
    ) satisfies ChartConfig

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
                        <div className="flex flex-col gap-8 py-8 md:gap-10 md:py-10 px-4 md:px-8">
                            <StatsCards
                                totalTasks={totalTasks}
                                completedTasks={completedTasks}
                                inProgressTasks={inProgressTasks}
                                plannedTasks={plannedTasks}
                                overdueTasks={overdueTasks}
                            />
                            {/* Section 1 : Statuts & Répartition */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 border-b pb-8">
                                {/* Tâches par statut (BarChart) - utilise chartDataBar */}
                                <div className="flex flex-col gap-4 xl:col-span-2">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Tâches par statut
                                    </h2>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Tâches par statut
                                            </CardTitle>
                                            <CardDescription>
                                                Janvier - Juin 2025
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer
                                                config={chartConfigBar}
                                            >
                                                <BarChart
                                                    accessibilityLayer
                                                    data={chartDataBar}
                                                >
                                                    <CartesianGrid
                                                        vertical={false}
                                                    />
                                                    <XAxis
                                                        dataKey="month"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                        tickFormatter={value =>
                                                            value.slice(0, 3)
                                                        }
                                                    />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                            <ChartTooltipContent indicator="dashed" />
                                                        }
                                                    />
                                                    <Bar
                                                        dataKey="terminees"
                                                        fill="#22c55e"
                                                        radius={4}
                                                    />
                                                    <Bar
                                                        dataKey="enCours"
                                                        fill="#eab308"
                                                        radius={4}
                                                    />
                                                    <Bar
                                                        dataKey="aFaire"
                                                        fill="#64748b"
                                                        radius={4}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-2 text-sm">
                                            <div className="flex gap-2 leading-none font-medium">
                                                Progression des tâches sur 6
                                                mois
                                            </div>
                                            <div className="text-muted-foreground leading-none">
                                                Total toutes catégories
                                                confondues
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </div>
                                {/* Répartition des projets (PieChart) - utilise chartDataPie */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Répartition des projets
                                    </h2>
                                    <Card className="flex flex-col h-full">
                                        <CardHeader className="items-center pb-0">
                                            <CardTitle>
                                                Répartition des projets
                                            </CardTitle>
                                            <CardDescription>
                                                Par statut
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-0 flex items-center justify-center">
                                            <ChartContainer
                                                config={chartConfigPie}
                                                className="mx-auto aspect-square max-h-[250px]"
                                            >
                                                <PieChart>
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                            <ChartTooltipContent
                                                                hideLabel
                                                            />
                                                        }
                                                    />
                                                    <Pie
                                                        data={chartDataPie}
                                                        dataKey="value"
                                                        nameKey="status"
                                                        innerRadius={60}
                                                        strokeWidth={5}
                                                    >
                                                        <Label
                                                            content={props => {
                                                                const {
                                                                    cx,
                                                                    cy,
                                                                } = props as {
                                                                    cx?: number
                                                                    cy?: number
                                                                }
                                                                if (
                                                                    typeof cx ===
                                                                        "number" &&
                                                                    typeof cy ===
                                                                        "number"
                                                                ) {
                                                                    return (
                                                                        <text
                                                                            x={
                                                                                cx
                                                                            }
                                                                            y={
                                                                                cy
                                                                            }
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                        >
                                                                            <tspan className="fill-foreground text-3xl font-bold">
                                                                                {
                                                                                    totalProjects
                                                                                }
                                                                            </tspan>
                                                                            <tspan
                                                                                x={
                                                                                    cx
                                                                                }
                                                                                y={
                                                                                    cy +
                                                                                    24
                                                                                }
                                                                                className="fill-muted-foreground"
                                                                            >
                                                                                Projets
                                                                            </tspan>
                                                                        </text>
                                                                    )
                                                                }
                                                                return null
                                                            }}
                                                        />
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                        <CardFooter className="flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2 leading-none font-medium">
                                                Répartition des projets par
                                                statut
                                            </div>
                                            <div className="text-muted-foreground leading-none">
                                                Total projets : {totalProjects}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                            {/* Section 2 : Activité & Progression */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
                                {/* Projets actifs (RadarChart) - utilise chartDataRadar */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Projets actifs
                                    </h2>
                                    <Card className="h-full flex flex-col">
                                        <CardHeader className="items-center">
                                            <CardTitle>
                                                Projets actifs par mois
                                            </CardTitle>
                                            <CardDescription>
                                                Nombre de projets ayant des
                                                tâches chaque mois
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-0 flex-1 flex items-center justify-center">
                                            <ChartContainer
                                                config={chartConfigRadar}
                                                className="mx-auto aspect-square max-h-[250px]"
                                            >
                                                <RadarChart
                                                    data={chartDataRadar}
                                                >
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                            <ChartTooltipContent />
                                                        }
                                                    />
                                                    <PolarAngleAxis dataKey="month" />
                                                    <PolarGrid />
                                                    <Radar
                                                        dataKey="actifs"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.6}
                                                        dot={{
                                                            r: 4,
                                                            fillOpacity: 1,
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ChartContainer>
                                        </CardContent>
                                        <CardFooter className="flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2 leading-none font-medium">
                                                Projets actifs sur 6 mois
                                            </div>
                                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                                Janvier - Juin 2025
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </div>
                                {/* Progression globale (PieChart radial) - utilise chartDataRadial */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Progression globale
                                    </h2>
                                    <Card className="h-full flex flex-col">
                                        <CardHeader className="items-center pb-0">
                                            <CardTitle>
                                                Progression globale
                                            </CardTitle>
                                            <CardDescription>
                                                Pourcentage de tâches terminées
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center justify-center flex-1">
                                            <ChartContainer
                                                config={chartConfigRadial}
                                                className="mx-auto aspect-square max-h-[200px]"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={chartDataRadial}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        fill="#22c55e"
                                                        stroke="#e5e7eb"
                                                        strokeWidth={6}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        isAnimationActive={
                                                            false
                                                        }
                                                    >
                                                        <Label
                                                            position="center"
                                                            content={() => (
                                                                <text
                                                                    x={80}
                                                                    y={80}
                                                                    textAnchor="middle"
                                                                    dominantBaseline="middle"
                                                                >
                                                                    <tspan className="fill-foreground text-3xl font-bold">
                                                                        {
                                                                            globalProgress
                                                                        }
                                                                        %
                                                                    </tspan>
                                                                    <tspan
                                                                        x={80}
                                                                        y={100}
                                                                        className="fill-muted-foreground text-xs"
                                                                    >
                                                                        terminées
                                                                    </tspan>
                                                                </text>
                                                            )}
                                                        />
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Tâches par projet (BarChart empilé) - utilise chartDataStacked */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Tâches par projet
                                    </h2>
                                    <Card className="h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle>
                                                Tâches par projet
                                            </CardTitle>
                                            <CardDescription>
                                                Répartition par statut
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex items-center justify-center">
                                            <ChartContainer
                                                config={chartConfigStacked}
                                                className="w-full max-h-[220px]"
                                            >
                                                <BarChart
                                                    data={chartDataStacked}
                                                    height={200}
                                                    margin={{
                                                        left: 0,
                                                        right: 0,
                                                        top: 10,
                                                        bottom: 10,
                                                    }}
                                                >
                                                    <XAxis
                                                        dataKey="projet"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tick={{ fontSize: 10 }}
                                                        interval={0}
                                                        angle={-20}
                                                        textAnchor="end"
                                                    />
                                                    <CartesianGrid
                                                        vertical={false}
                                                    />
                                                    <Bar
                                                        dataKey="terminees"
                                                        stackId="a"
                                                        fill="#22c55e"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar
                                                        dataKey="enCours"
                                                        stackId="a"
                                                        fill="#eab308"
                                                    />
                                                    <Bar
                                                        dataKey="aFaire"
                                                        stackId="a"
                                                        fill="#64748b"
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Évolution des tâches terminées (BarChart) - utilise chartDataLine */}
                                <div className="flex flex-col gap-4 xl:col-span-2">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Évolution des tâches terminées
                                    </h2>
                                    <Card className="h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle>
                                                Évolution des tâches terminées
                                            </CardTitle>
                                            <CardDescription>
                                                Par mois
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex items-center justify-center">
                                            <ChartContainer
                                                config={chartConfigLine}
                                                className="w-full max-h-[220px]"
                                            >
                                                <BarChart
                                                    data={chartDataLine}
                                                    height={200}
                                                    margin={{
                                                        left: 0,
                                                        right: 0,
                                                        top: 10,
                                                        bottom: 10,
                                                    }}
                                                >
                                                    <XAxis
                                                        dataKey="month"
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <CartesianGrid
                                                        vertical={false}
                                                    />
                                                    <Bar
                                                        dataKey="terminees"
                                                        fill="#22c55e"
                                                        radius={4}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Répartition par type de tâche (PieChart donut) - utilise chartDataDonut */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-lg font-semibold mb-2 text-primary">
                                        Répartition par type de tâche
                                    </h2>
                                    <Card className="h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle>
                                                Répartition par type de tâche
                                            </CardTitle>
                                            <CardDescription>
                                                Types métiers
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex items-center justify-center">
                                            <ChartContainer
                                                config={chartConfigDonut}
                                                className="mx-auto aspect-square max-h-[200px]"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={chartDataDonut}
                                                        dataKey="value"
                                                        nameKey="type"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        fill="#3b82f6"
                                                        stroke="#e5e7eb"
                                                        strokeWidth={6}
                                                        label={({ name }) =>
                                                            name
                                                        }
                                                    />
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
