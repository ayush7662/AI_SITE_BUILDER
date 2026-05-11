import React, { useState, useEffect } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import type { Project } from '../types'

import Footer from '../components/Footer'
import api from '@/configs/axios'
import { toast } from 'sonner'

const Community: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  const fetchProjects = async () => {
   try{
    const {data} = await api.get('/api/project/published');
      setProjects(data.projects);
      setLoading(false);
   }catch(error:any){
    console.log(error);
    toast.error(error?.response?.data?.message || error.message)
   }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
              <h1 className="text-2xl font-medium text-white">
                Published Projects
              </h1>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <Link
                  key={project.id}
                  to={`/view/${project.id}`}
                  target="_blank"
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
                    <h2 className="text-lg font-medium line-clamp-2">
                      {project.name}
                    </h2>

                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {project.initial_prompt}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>

                      {/* Single Button */}
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-sm"
                        onClick={e => e.preventDefault()}
                      >
                        <FcGoogle size={18} />
                        <span>GreatStack</span>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold text-gray-300">
              No published projects yet!
            </h1>

            <button
              onClick={() => navigate('/')}
              className="text-white px-5 py-2 mt-5 rounded-md
              bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
            >
              Create a Project
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default Community
