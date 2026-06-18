"use client"

import { Bot, CreditCard, LayoutDashboard, Plus, Presentation, SidebarClose } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenuButton, SidebarMenuItem, SidebarMenu, useSidebar } from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import useProject from "~/hooks/use-project"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    },

]

export function AppSidebar() {
    const pathname = usePathname() //URL the user is currently visiting
    const { open } = useSidebar()
    const { projects, projectId, setProjectId } = useProject()
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src="/githubLogo.png" alt="logo" width={40} height={40} />
                    {open && /* double & - && is logical operator, single & is binary operator */
                        (<h1 className="text-xl font-bold text-primary/80">
                            GitHubAI
                        </h1>)}
                </div>

            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                "!bg-primary !text-white": pathname === item.url
                                            })}> {/* The cn (Class Name) utility checks if they match exactly. If they do match, it automatically attaches the !bg-primary (background color) and !text-white (text color) Tailwind classes to highlight it. */}
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                {projects?.map(project => {
                                    return (
                                        <SidebarMenuItem key={project.name}>
                                            <SidebarMenuButton asChild>
                                                <div onClick={() => {
                                                    setProjectId(project.id)
                                                }}>
                                                    <div className={cn(
                                                        "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                                                        { "bg-primary text-white": project.id === projectId }
                                                    )}>
                                                        {project.name[0]}
                                                    </div>
                                                    <span>{project.name}</span>
                                                </div>

                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}

                                <div className="h-2"></div>
                                {open && (<SidebarMenuItem>
                                    <Link href="/create">
                                        <Button size="sm" variant={"outline"} className="w-fit">
                                            <Plus />
                                            Create Project
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>)}
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}