import * as React from "react"
import {
    IconChartBar,
    IconDashboard,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
    IconCalendar,
} from "@tabler/icons-react"
import { Link } from "react-router-dom"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Tableau de bord",
            url: "/",
            icon: IconDashboard,
        },
        {
            title: "Projets",
            url: "/projects",
            icon: IconFolder,
        },
        {
            title: "Tâches",
            url: "/tasks",
            icon: IconListDetails,
        },
        {
            title: "Planning",
            url: "/planning",
            icon: IconCalendar,
        },
        {
            title: "Statistiques",
            url: "/stats",
            icon: IconChartBar,
        },
        {
            title: "Paramètres",
            url: "/settings",
            icon: IconSettings,
        },
    ],
    navSecondary: [
        {
            title: "Paramètres",
            url: "#",
            icon: IconSettings,
        },
    ],
    documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link to="/">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">
                                    Acme Inc.
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/* <NavDocuments items={data.documents} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
