import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import ProjectPreview from '../components/ProjectPreview'
import type { Project } from '../types'
import api from '@/configs/axios'
import { toast } from 'sonner'

const View = () => {
  const { projectId } = useParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCode = async () => {
    try{
  const {data} = await api.get(`/api/project/published/${projectId}`);
  setCode(data.code)
  setLoading(false)
    }catch(error: any){
     toast.error(error?.response?.data?.message || error.message)
     setLoading(false)
    }
  }

  useEffect(() => {
    fetchCode()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gray-900">
      {code && (
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false}
          showEditorPanel={false}
          device="desktop"
        />
      )}
    </div>
  )
}

export default View
