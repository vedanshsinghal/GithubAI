"use client"
import Image from 'next/image'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import useProject from '~/hooks/use-project'
import { askQuestion } from './actions'
import { readStreamableValue } from "@ai-sdk/rsc"
import dynamic from 'next/dynamic'

const MDEditorMarkdown = dynamic(
    () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
    { ssr: false }
)
import CodeReferences from './code-references'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
const AskQuestionCard = () => {
    const { project } = useProject()
    const [question, setQuestion] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const [answer, setAnswer] = React.useState("")
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer("")
        setFilesReferences([])
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)

        const { output, filesReferences } = await askQuestion(question, project.id)
        setOpen(true)

        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[80vw] max-h-[85vh] flex flex-col'>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                <Image src="/githubLogo.png" alt="Logo" width={40} height={40}></Image>
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                                saveAnswer.mutate({
                                    projectId: project!.id,
                                    question,
                                    answer,
                                    filesReferences
                                }, {
                                    onSuccess: () => {
                                        toast.success("Answer Saved!")
                                    },
                                    onError: () => {
                                        toast.error("Failed to save answer!")
                                    }
                                })
                            }}>Save Answer</Button>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                        <MDEditorMarkdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll' />
                        <div className="h-4"></div>
                        <CodeReferences filesReferences={filesReferences} />
                    </div>
                    <Button type='button' onClick={() => { setOpen(false) }}>Close</Button>
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should I edit to change the homepage?' value={question} onChange={e => setQuestion(e.target.value)}></Textarea>
                        <div className="h-4"></div>
                        <Button type='submit' disabled={loading}>Ask AI</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AskQuestionCard
