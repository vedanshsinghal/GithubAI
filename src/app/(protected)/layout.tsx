import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'

type Props = {
    children: React.ReactNode
}//This block acts like a bouncer at a club. It says: "The SidebarLayout component is only allowed to accept an object containing a property called children, and that property must be valid React code (React.ReactNode)."

const SidebarLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full m-2'>
                <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>
                    <SidebarTrigger />
                    <div className='ml-auto'>
                        <UserButton />
                    </div>
                </div>
                <div className="h-4"></div> {/* This is just an invisible, empty box used to push the main content down slightly from the header. */}
                <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4  ">
                    {children} {/* Active page hoga jo wo children banjayega */}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default SidebarLayout
