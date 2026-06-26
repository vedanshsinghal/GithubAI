"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import AskQuestionCard from '../dashboard/ask-question'
import dynamic from 'next/dynamic'
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
const MDEditorMarkdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })
import CodeReferences from '../dashboard/code-references'

const QAPage = () => {
    const { projectId } = useProject()
    const { data: questions } = api.project.getQuestions.useQuery({ projectId }) // data renamed to questions
    const [questionIndex, setQuestionIndex] = React.useState(0)
    const [open, setOpen] = React.useState(false)
    const question = questions?.[questionIndex]
    return (
        <>
            <AskQuestionCard />
            <div className="h-4"></div>
            <h1 className='text-xl font-semibold'>Saved Questions</h1>
            <div className="h-2"></div>
            <div className="flex-col gap-2">
                {questions?.map((question, index) => {
                    return <React.Fragment key={question.id}>
                        <button onClick={() => { setQuestionIndex(index); setOpen(true) }} className="w-full">
                            <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                                <img className='rounded-full' height={30} width={30} src={question.user.imageUrl ?? ""} />
                                <div className="text-left flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                                            {question.question}
                                        </p>
                                        <span className='text-xs text-gray-400 whitespace-nowrap'>
                                            {question.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className='text-gray-500 line-clamp-1 text-sm'>
                                        {question.answer}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </React.Fragment>
                })}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                {question && (
                    <DialogContent className='sm:max-w-[80vw] max-h-[85vh] flex flex-col p-6'>
                        <DialogHeader>
                            <DialogTitle>
                                {question.question}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-4">
                            <MDEditorMarkdown source={question.answer} />
                            <div className="h-4"></div>
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
                            <CodeReferences filesReferences={question.filesReferences ?? ([] as any)}></CodeReferences>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </>
    )
}

export default QAPage
