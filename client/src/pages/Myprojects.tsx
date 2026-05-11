import React, { useState, useEffect } from 'react'
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'

import Footer from '../components/Footer'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

const MyProjects: React.FC = () => {
  const {data: session, isPending} = authClient.useSession()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  const fetchProjects = async () => {
   try{
      const {data} = await api.get('/api/user/projects')
      setProjects(data.projects)
      setLoading(false)

   }catch(error : any){
     console.log(error)
     toast.error(error?.response?.data?.message || error.message)
   }
  }

  const deleteProject = async (projectId: string) => {
        try{
          const confirm = window.confirm('Are you sure yu want to delete this project?');
          if(!confirm) return;
          const {data} = await api.delete(`/api/project/${projectId}`)
          toast.success(data.message);
          fetchProjects()
        }catch(error:any){
          console.log(error);
          toast.error(error?.response?.data?.message || error.message)
        }
  }

  useEffect(() => {
    if(session?.user && !isPending){
            fetchProjects()
    } else if(!isPending && !session?.user){
      navigate('/')
      toast('Please login to view your projects');
    }
    
  }, [session?.user, isPending, navigate])

  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32 min-h-[80vh]">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="size-7 animate-spin text-indigo-200" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-2xl font-medium text-white">My Projects</h1>

              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white px-6 py-2 rounded
                bg-gradient-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all"
              >
                <PlusIcon size={18} />
                Create New
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="group relative rounded-lg bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                >
                  {/* Preview */}
                  <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                    {project.current_code ? (
                      <iframe
                        srcDoc={project.current_code}
                        className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                        style={{ transform: 'scale(0.25)' }}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No Preview
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium line-clamp-2">
                        {project.name}
                      </h2>

                      <button className="px-2.5 py-0.5 text-xs bg-gray-800 rounded-full">
                        Website
                      </button>
                    </div>

                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {project.initial_prompt}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/preview/${project.id}`)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md"
                        >
                          Preview
                        </button>

                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <TrashIcon
                    onClick={e => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="absolute top-3 right-3 size-6 bg-white p-1 rounded text-red-500 
                    opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold text-gray-300">
              You have no project yet!
            </h1>

            <button
              onClick={() => navigate('/')}
              className="text-white px-5 py-2 mt-5 rounded-md
              bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default MyProjects
