"use client"
import React, { useState, useEffect } from 'react'
import {useForm} from "react-hook-form"
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import useRefetch from '~/hooks/use-refetch'
import { api } from '~/trpc/react' // frontend so react
type FormInput ={
    repoUrl: string,
    projectName: string,
    githubToken?: string
}

const loadingMessages = [
    "🔗 Connecting to GitHub...",
    "📂 Loading repository files...",
    "🤖 AI is reading your code...",
    "📝 Summarizing source files...",
    "🧠 Generating embeddings...",
    "💾 Saving to database...",
    "⏳ Almost there...",
]

const CreatePage = () => {
    const {register,handleSubmit,reset}=useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const refetch=useRefetch()
    const [currentMessage, setCurrentMessage] = useState(0)

    useEffect(() => {
        if (!createProject.isPending) {
            setCurrentMessage(0)
            return
        }
        const interval = setInterval(() => {
            setCurrentMessage(prev =>
                prev < loadingMessages.length - 1 ? prev + 1 : prev
            )
        }, 20000) // Cycle through messages every 20 seconds
        return () => clearInterval(interval)
    }, [createProject.isPending])

    function onSubmit(data:FormInput){
        createProject.mutate({
            githubUrl:data.repoUrl,
            name:data.projectName,
            githubToken:data.githubToken
        },{
            onSuccess:()=> {
                toast.success("Project created!")
                void refetch()
                reset()
            },
            onError:()=> {
                toast.error("Error creating project")
            }
        }
    )
        return true
    }
  return (
    <div className="flex items-center gap-12 h-full justify-center">
        <img src="githubLogo.png" alt="" className='h-56 w-auto'/>
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>Link your Github Repository</h1>
                <p>Enter the URL of your Repository</p>
            </div>
            <div className='h-4'></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input {...register("projectName",{required:true})} placeholder="Project Name" disabled={createProject.isPending}/>
                    <div className="h-2"></div>
                    <Input {...register("repoUrl",{required:true})} type="url" placeholder="Github Repo URL" disabled={createProject.isPending}/>
                    <div className="h-2"></div>
                    <Input {...register("githubToken")} placeholder="Github Token (Optional)" disabled={createProject.isPending}/>
                    <div className="h-4"></div>
                    <Button disabled={createProject.isPending} className="w-full">
                        {createProject.isPending ? "Creating..." : "Create Project"}
                    </Button>
                </form>

                {createProject.isPending && (
                    <div className="mt-6">
                        {/* Progress bar */}
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                    animation: "indeterminate 2s ease-in-out infinite",
                                }}
                            />
                        </div>
                        {/* Status message */}
                        <p className="mt-3 text-sm text-muted-foreground text-center animate-pulse">
                            {loadingMessages[currentMessage]}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60 text-center">
                            This may take a few minutes depending on repo size
                        </p>

                        <style jsx>{`
                            @keyframes indeterminate {
                                0% {
                                    width: 0%;
                                    margin-left: 0%;
                                }
                                50% {
                                    width: 60%;
                                    margin-left: 20%;
                                }
                                100% {
                                    width: 0%;
                                    margin-left: 100%;
                                }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default CreatePage

