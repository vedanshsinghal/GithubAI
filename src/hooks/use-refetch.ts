import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

// no need to refresh everytime to reload projects with this hook
const useRefetch = () => {
  const queryClient =useQueryClient()
  return async ()=> {
    await queryClient.refetchQueries({
        type:"active"
    })
  }
}

export default useRefetch
