"use client"
import { ExternalLink, GitFork } from 'lucide-react'
import React from 'react'
import useProject from '~/hooks/use-project'
import Link from "next/link"
import ArchiveButton from './archive-button'
import InviteButton from './invite-button'
import TeamMembers from './team-members'
import AskQuestionCard from './ask-question'
import CommitLog from './commit-log'

const DashboardPage = () => {
  const { project } = useProject()
  return (
    <div>
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        <div className='w-fit rounded-md bg-primary px-4 py-3'>
          <div className="flex items-center">
            <GitFork className="size-5 text-white" />
            <div className='ml-2'>
              <p className='text-sm font-medium text-white'>
                This project is linked to {''}
                <Link href={project?.githubUrl ?? ""} className="inline-flex items-center text-white/80 hover:underline">
                  {project?.githubUrl}
                  <ExternalLink className='ml-1 size-4' />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className='h-4'></div>
        <div className='flex items-center gap-4'>
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      <div className='mt-4'>
        <div className='grid grid-cols-1 gap-4 '>
          <AskQuestionCard />
          <div className='col-span-2'>
            <CommitLog />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
