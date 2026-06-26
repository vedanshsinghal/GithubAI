"use client"
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import useProject from '~/hooks/use-project'

const InviteButton = () => {
    const {projectId}=useProject()
    const [open,setOpen]=React.useState(false)
    const [origin,setOrigin]=React.useState("")

    React.useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Invite Team Members
                </DialogTitle>
            </DialogHeader>
            <p className='text-sm text-gray-500'>
                Ask them to copy and paste this link
            </p>
            <Input className='mt-4' readOnly onClick={()=>{
                void navigator.clipboard.writeText(`${origin}/join/${projectId}`)
                toast.success("copied to clipboard")
            }} value={`${origin}/join/${projectId}`}></Input>
        </DialogContent>
      </Dialog>
      <Button onClick={()=> setOpen(true)}>Invite Members</Button>
    </div>
  )
}

export default InviteButton
