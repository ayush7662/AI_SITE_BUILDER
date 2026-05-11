import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets'
import EditorPanel from './EditorPanel'
import LoaderSteps from './LoaderSteps'

interface ProjectPreviewProps {
  project: Project
  isGenerating: boolean
  device?: 'phone' | 'tablet' | 'desktop'
  showEditorPanel?: boolean
}

export interface ProjectPreviewRef {
  getCode: () => string | undefined
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [selectedElement, setSelectedElement] = useState<any>(null)

    const resolution = {
      phone: 'w-[412px]',
      tablet: 'w-[768px]',
      desktop: 'w-full',
    }

    // ✅ SINGLE useImperativeHandle
    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument
        if (!doc) return undefined

        // Remove selection styles
        doc
          .querySelectorAll('.ai-selected-element,[data-ai-selected]')
          .forEach((el) => {
            el.classList.remove('ai-selected-element')
            el.removeAttribute('data-ai-selected')
            ;(el as HTMLElement).style.outline = ''
          })

        // Remove injected helpers
        doc.getElementById('ai-preview-style')?.remove()
        doc.getElementById('ai-preview-script')?.remove()

        return doc.documentElement.outerHTML
      },
    }))

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'ELEMENT_SELECTED') {
          setSelectedElement(event.data.payload)
        } else if (event.data?.type === 'CLEAR_SELECTION') {
          setSelectedElement(null)
        }
      }

      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }, [])

    const handleUpdate = (updates: any) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'UPDATE_ELEMENT', payload: updates },
        '*'
      )
    }

    const injectPreview = (html?: string) => {
      if (!html) return ''
      if (!showEditorPanel) return html

      let processedHtml = html.trim()

      if (!processedHtml.includes('<html')) {
        processedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
</head>
<body>${processedHtml}</body>
</html>`
      }

      if (processedHtml.includes('</body>')) {
        return processedHtml.replace('</body>', iframeScript + '</body>')
      }

      return processedHtml + iframeScript
    }

    return (
      <div className={`relative h-full w-full bg-gray-900 flex-1 ${showEditorPanel ? 'rounded-xl' : ''} overflow-hidden`}>
        {project.current_code ? (
          <>
            <iframe
              ref={iframeRef}
              key={`preview-${project.id}-${showEditorPanel}`}
              srcDoc={injectPreview(project.current_code)}
              sandbox="allow-scripts allow-same-origin"
              className={`h-full ${resolution[device]} mx-auto transition-all`}
            />

            {showEditorPanel && selectedElement && (
              <EditorPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdate}
                onClose={() => {
                  setSelectedElement(null)
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: 'CLEAR_SELECTION_REQUEST' },
                    '*'
                  )
                }}
              />
            )}
          </>
        ) : isGenerating ? (
          <LoaderSteps />
        ) : null}
      </div>
    )
  }
)

export default ProjectPreview
