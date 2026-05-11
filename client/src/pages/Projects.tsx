import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types'
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

const ProjectPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`)
      const projectData: Project = data.project
      setProject(projectData)
      setIsGenerating(projectData.current_code ? false : true)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch project')
      console.log(error)
    }
  }

  const saveProject = async () => {
    if (!previewRef.current) return
    const code = previewRef.current.getCode()
    if (!code) return

    setIsSaving(true)
    try {
      const { data } = await api.put(`/api/project/save/${projectId}`, { code })
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code
    if (!code) return

    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = 'index.html'
    document.body.appendChild(element)
    element.click()
  }

  const togglePublish = async () => {
    try {
      const { data } = await api.get(`/api/user/publish-toggle/${projectId}`)
      toast.success(data.message)

      setProject((prev) =>
        prev ? { ...prev, isPublished: !prev.isPublished } : null
      )
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const copyLink = () => {
    const link = `${window.location.origin}/view/${projectId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (session?.user) {
      fetchProject()
    } else if (!isPending && !session?.user) {
      navigate('/')
      toast('Please login to view your projects')
    }
  }, [session?.user])

  useEffect(() => {
    if (project && !project.current_code) {
      const intervalId = setInterval(fetchProject, 10000)
      return () => clearInterval(intervalId)
    }
  }, [project])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2Icon className="size-7 animate-spin text-violet-200" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-xl text-gray-300">Unable to load project</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">

      {/* NAVBAR */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800">

        <div className="flex items-center gap-2 min-w-[200px]">
          <img
            src="/favicon.svg"
            className="h-6 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div className="truncate">
            <p className="text-sm font-medium truncate">{project.name}</p>
            <p className="text-xs text-gray-400">Last saved version</p>
          </div>
        </div>

        <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setDevice('phone')}
            className={`size-6 p-1 cursor-pointer rounded ${device === 'phone' ? 'bg-gray-700' : ''}`}
          />
          <TabletIcon
            onClick={() => setDevice('tablet')}
            className={`size-6 p-1 cursor-pointer rounded ${device === 'tablet' ? 'bg-gray-700' : ''}`}
          />
          <LaptopIcon
            onClick={() => setDevice('desktop')}
            className={`size-6 p-1 cursor-pointer rounded ${device === 'desktop' ? 'bg-gray-700' : ''}`}
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">

          <button onClick={saveProject} disabled={isSaving} className="bg-gray-800 px-3 py-1 flex items-center gap-2 rounded">
            {isSaving ? <Loader2Icon size={16} className="animate-spin" /> : <SaveIcon size={16} />}
            Save
          </button>

          <Link to={`/preview/${projectId}`} target="_blank" className="bg-gray-800 px-3 py-1 rounded flex gap-2">
            <FullscreenIcon size={16} /> Preview
          </Link>

          <button onClick={downloadCode} className="bg-blue-600 px-3 py-1 rounded flex gap-2">
            <ArrowBigDownDashIcon size={16} /> Download
          </button>

          {project.isPublished && (
            <button onClick={copyLink} className="bg-green-600 px-3 py-1 rounded flex gap-2 items-center">
              {copied ? <><CheckIcon size={16} /> Copied!</> : <><CopyIcon size={16} /> Copy Link</>}
            </button>
          )}

          <button onClick={togglePublish} className="bg-indigo-600 px-3 py-1 rounded flex gap-2">
            {project.isPublished ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            {project.isPublished ? 'Unpublish' : 'Publish'}
          </button>

        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          isMenuOpen={false}
          project={project}
          setProject={setProject}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        <div className="flex-1 p-2">
          <ProjectPreview
            ref={previewRef}
            project={project}
            isGenerating={isGenerating}
            device={device}
            showEditorPanel={true}
          />
        </div>

      </div>
    </div>
  )
}

export default ProjectPage