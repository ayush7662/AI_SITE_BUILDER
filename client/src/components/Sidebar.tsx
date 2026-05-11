import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types'
import { BotIcon, EyeIcon, UserIcon, Loader2Icon, SendIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/configs/axios'
import { toast } from 'sonner'

interface SidebarProps {
  isMenuOpen: boolean
  project: Project | null
  setProject: React.Dispatch<React.SetStateAction<Project | null>>
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
}

const Sidebar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating
}: SidebarProps) => {

  if (!project) return null

  const messageRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${project.id}`)
      setProject(data.project)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleRollback = async (versionId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to rollback to this version?')

      if (!confirm) return

      setIsGenerating(true)

      const { data } = await api.get(
        `/api/project/rollback/${project.id}/${versionId}`
      )

      const { data: data2 } = await api.get(
        `/api/user/project/${project.id}`
      )

      toast.success(data.message)
      setProject(data2.project)

      setIsGenerating(false)

    } catch (error: any) {

      setIsGenerating(false)
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const handleRevisions = async (e: React.FormEvent) => {

    e.preventDefault()

    let interval: number | undefined

    try {

      setIsGenerating(true)

      interval = setInterval(() => {
        fetchProject()
      }, 10000)

      const { data } = await api.post(
        `/api/project/revision/${project.id}`,
        { message: input }
      )

      fetchProject()

      toast.success(data.message)

      setInput('')

      clearInterval(interval)

      setIsGenerating(false)

    } catch (error: any) {

      setIsGenerating(false)

      toast.error(error?.response?.data?.message || error.message)

      console.log(error)

      clearInterval(interval)
    }
  }

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [project.conversation.length, isGenerating])

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    if (!input.trim() || isGenerating) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setProject({
      ...project,
      conversation: [...project.conversation, userMsg],
    })

    setInput("")

    setIsGenerating(true)

    setTimeout(() => {

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I've made the changes to your website! You can now preview it.",
        timestamp: new Date().toISOString(),
      }

      setProject(prev => prev && ({
        ...prev,
        conversation: [...prev.conversation, botMsg],
      }))

      setIsGenerating(false)

    }, 1200)
  }

  return (
    <div
      className={`h-full max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all
      ${isMenuOpen ? 'w-full' : 'max-sm:w-0 overflow-hidden'}`}
    >

      <div className='flex flex-col h-full'>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>

          {[...project.conversation, ...project.versions]
            .sort((a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime()
            )
            .map((message) => {

              if ('content' in message) {

                const msg = message as Message

                const isUser = msg.role === 'user'

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
                  >

                    {!isUser && (
                      <BotIcon className='size-5 text-white' />
                    )}

                    <div
                      className={`max-w-[80%] p-2 px-4 rounded-2xl text-sm mt-5
                      ${isUser
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-gray-800 text-gray-100 rounded-tl-none'
                        }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center'>
                        <UserIcon className='size-5 text-gray-200' />
                      </div>
                    )}

                  </div>
                )
              }

              const ver = message as Version

              return (
                <div
                  key={ver.id}
                  className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100'
                >

                  <div className='text-xs font-medium'>
                    Code updated
                    <br />

                    <span className='text-gray-500'>
                      {new Date(ver.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className='flex items-center justify-between mt-2'>

                    {project.current_version_index === ver.id ? (
                      <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>
                        Current version
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRollback(ver.id)}
                        className='px-3 py-1 rounded-md text-xs bg-indigo-500 text-white'
                      >
                        Roll back to this version
                      </button>
                    )}

                    <Link
                      target='_blank'
                      to={`/preview/${project.id}/${ver.id}`}
                    >
                      <EyeIcon className='size-6 p-1 bg-gray-700 hover:bg-indigo-500 rounded' />
                    </Link>

                  </div>
                </div>
              )
            })}

          {isGenerating && (
            <div className='flex items-start gap-3'>

              <BotIcon className='size-5 text-white' />

              <div className='flex gap-1'>
                <span className='size-2 rounded-full animate-bounce bg-gray-600' />
                <span className='size-2 rounded-full animate-bounce bg-gray-600 delay-150' />
                <span className='size-2 rounded-full animate-bounce bg-gray-600 delay-300' />
              </div>

            </div>
          )}

          <div ref={messageRef} />

        </div>

        {/* Input */}
        <form className='m-3' onSubmit={handleRevisions}>

          <div className='flex gap-2'>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              disabled={isGenerating}
              placeholder='Describe your website or request changes...'
              className='flex-1 p-3 rounded-xl bg-gray-800 text-gray-100'
            />

            <button type='submit'>

              {isGenerating ? (
                <Loader2Icon className='size-7 animate-spin text-white' />
              ) : (
                <SendIcon className='size-7 text-white' />
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default Sidebar