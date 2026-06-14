import {Octokit} from "octokit"
import { db } from "~/server/db"

export const octokit=new Octokit({
    auth:process.env.GITHUB_TOKEN
})

const githubUrl=""

type Response={
    commitHash : string,
    commitMessage: string,
    commitAuthorName: string,
    commitAuthorAvatar:string,
    commitDate :string,

}

/*
Because getCommitHashes is an async function, it always returns a JavaScript Promise.

By writing : Promise<Response[]>, you are telling TypeScript: "When this asynchronous function finally finishes downloading the data, I promise the final result will be an array ([]) of objects that perfectly match my Response type blueprint."

*/
export const getCommitHashes= async(githubUrl:string) :Promise<Response[]>=>{
    const {data} = await octokit.rest.repos.listCommits({
        owner:"",
        repo:""
    })
    // sort commits by time
    // sorting : sort((a,b) =>) , a - b = Ascending (Smallest/Oldest first), b-a is descending. Compare all pairs of dates.
    const sortedCommits = data.sort((a:any,b:any)=> new Date(b.commit.author.date).getTime()-new Date(a.commit.author.date).getTime()) as any[]
    return sortedCommits.slice(0,10).map((commit:any)=>({
        commitHash:commit.sha as string,
        commitMessage:commit.commit.message ??"",
        commitAuthorName:commit.commit?.author?.name??"",
        commitAuthorAvatar:commit?.author?.avatar_url??"",
        commitDate: commit.commit?.author?.date??""
        // ?? if value on left is null or undefined
    }))
}

export const pollCommits=async (projectId:string)=>{
    const {project,githubUrl}=await fetchProjectGithubUrl(projectId) // get url of repo
    const commitHashes=await getCommitHashes(githubUrl)
    const unprocessedCommits=await filterUnprocessedCommits(projectId,commitHashes) // get commits who have not been processed yet, so you dont generate ai summaries again
}

async function summariseCommits(githubUrl:string ,commitHash:string){

}

async function fetchProjectGithubUrl(projectId:string){
    const project=await db.project.findUnique({
        where: {id:projectId},
        select:{
            githubUrl:true
        }
    })
    if (!project?.githubUrl){
        throw new Error("Project has no github url")
    }
    return {project,githubUrl:project?.githubUrl}
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]){
    const processedCommits=await db.commit.findMany({
        where:{projectId}
    })
    const unprocessedCommits= commitHashes.filter((commit)=> !processedCommits.some((processedCommit)=> processedCommit.commitHash===commit.commitHash))
    return unprocessedCommits
}