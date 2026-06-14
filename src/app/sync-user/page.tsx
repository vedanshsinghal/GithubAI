import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
import { db } from '~/server/db'

const SyncUser = async () => {
    const {userId}= await auth()
    if (!userId){
        throw new Error("user not found")
    }

    const client = await clerkClient()
    const user= await client.users.getUser(userId) // search for userId in clerks db
    if (!user.emailAddresses[0]?.emailAddress){ // Look at the user's list of emails. Try to grab the first one. If you successfully get it, pull out the actual email string. If at any point during this process you fail or come up empty-handed, trigger the notFound function.
        return notFound()
    }
    await db.user.upsert({
        where: {emailAddress:user.emailAddresses[0]?.emailAddress??''},
        //The ?? is called the Nullish Coalescing Operator. It acts as a safety net or a fallback. It translates to: "Use the value on the left. But if the value on the left is null or undefined, use the value on the right instead." So, if the user has no email, it feeds Prisma a safe, empty string "" instead of crashing.

        update:{
            imageUrl:user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,} ,
    
        create:{
            id:userId,
            emailAddress: user.emailAddresses[0]?.emailAddress??"",
            imageUrl:user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,

    }}
)
    return redirect("/dashboard") // redirect to dashboard after syncing user details from clerk to our own db
}

export default SyncUser
