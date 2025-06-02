"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function getProjectActivityData(projects: any[]) {
    const days = 90
    const today = new Date()
    const data: {
        date: string
        terminees: number
        enCours: number
        aFaire: number
    }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const allTasks = projects.flatMap((p: any) =>
            Array.isArray(p.tasks) ? p.tasks : []
        )
        const done = Math.floor(
            (allTasks.filter((t: any) => t.status === "Completed").length /
                days) *
                (days - i)
        )
        const inProgress = Math.floor(
            (allTasks.filter((t: any) => t.status === "In Progress").length /
                days) *
                (days - i)
        )
        const toDo = Math.max(allTasks.length - done - inProgress, 0)
        data.push({
            date: d.toISOString().slice(0, 10),
            terminees: done,
            enCours: inProgress,
            aFaire: toDo,
        })
    }
    return data
}

const chartConfig = {
    terminees: { label: "Terminées", color: "#22c55e" },
    enCours: { label: "En cours", color: "#eab308" },
    aFaire: { label: "À faire", color: "#64748b" },
} satisfies ChartConfig

export function ChartAreaInteractive({ projects }: { projects: any[] }) {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")
    const chartData = React.useMemo(
        () => getProjectActivityData(projects),
        [projects]
    )

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    const filteredData = chartData.filter(item => {
        const date = new Date(item.date)
        const referenceDate = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(referenceDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Progression des tâches</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Tâches terminées, en cours et à faire (90 derniers
                        jours)
                    </span>
                    <span className="@[540px]/card:hidden">
                        90 derniers jours
                    </span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">90 jours</ToggleGroupItem>
                        <ToggleGroupItem value="30d">30 jours</ToggleGroupItem>
                        <ToggleGroupItem value="7d">7 jours</ToggleGroupItem>
                    </ToggleGroup>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient
                                id="fillTerminees"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#22c55e"
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#22c55e"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillEnCours"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#eab308"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#eab308"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillAFaire"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#64748b"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#64748b"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => {
                                const date = new Date(value)
                                return date.toLocaleDateString("fr-FR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            defaultIndex={isMobile ? -1 : 10}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value: string) => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString("fr-FR", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="terminees"
                            type="natural"
                            fill="url(#fillTerminees)"
                            stroke="#22c55e"
                            stackId="a"
                        />
                        <Area
                            dataKey="enCours"
                            type="natural"
                            fill="url(#fillEnCours)"
                            stroke="#eab308"
                            stackId="a"
                        />
                        <Area
                            dataKey="aFaire"
                            type="natural"
                            fill="url(#fillAFaire)"
                            stroke="#64748b"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
