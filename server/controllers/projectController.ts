import { Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import openai from '../configs/openai.js'

// ==========================
// MAKE REVISION CONTROLLER
// ==========================
export const makeRevision = async (req: Request, res: Response) => {
  const userId = (req as any).userId

  try {
    const { projectId } = req.params
    const { message } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (user.credits < 5) {
      return res
        .status(403)
        .json({ message: 'Add more credits to make changes' })
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Please enter a valid prompt' })
    }

    const currentProject = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    })

    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Save user message
    await prisma.conversation.create({
      data: {
        role: 'user',
        content: message,
        projectId,
      },
    })

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    })

    // ==========================
    // PROMPT ENHANCEMENT
    // ==========================
    const promptEnhanceResponse =
      await openai.chat.completions.create({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          {
            role: 'system',
            content: `
You are a prompt enhancement specialist. The user wants to make changes to their website.
Enhance their request to be more specific and actionable for a web developer.

Enhance this by:
1. Being specific about what elements to change
2. Mentioning design details (colors, spacing, sizes)
3. Clarifying the desired outcome
4. Using clear technical terms

Return ONLY the enhanced request, nothing else.
Keep it concise (1–2 sentences).
            `,
          },
          {
            role: 'user',
            content: `User's request: "${message}"`,
          },
        ],
      })

    const enhancedPrompt =
      promptEnhanceResponse.choices[0].message?.content || ''

    await prisma.conversation.create({
      data: {
        role: 'assistant',
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId,
      },
    })

    await prisma.conversation.create({
      data: {
        role: 'assistant',
        content: 'Now making changes to your website...',
        projectId,
      },
    })

    // ==========================
    // CODE GENERATION
    // ==========================
    const codeGenerationResponse =
      await openai.chat.completions.create({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          {
            role: 'system',
            content: `
You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- Use Tailwind CSS for ALL styling (NO custom CSS).
- Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Include all JavaScript in <script> tags before </body>.
- Make sure it's a complete, standalone HTML document.
- Use Tailwind utility classes extensively for styling, animations, and responsiveness.
- Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:).
- Use Tailwind animations and transitions (animate-*, transition-*).
- Use modern, beautiful design with great UX using Tailwind classes.

CRITICAL HARD RULES:
1. You MUST put ALL output ONLY into message.content.
2. You MUST NOT include markdown code fences (three backticks with html or just three backticks).
3. You MUST NOT include explanations, notes, or comments outside the HTML.
4. Return HTML ONLY, no markdown, no explanations.

Apply the requested changes while maintaining Tailwind CSS styling.
            `,
          },
          {
            role: 'user',
            content: `
Here is the current website code:
"${currentProject.current_code}"

The user wants this change:
"${enhancedPrompt}"
            `,
          },
        ],
      })

    const rawCode =
      codeGenerationResponse.choices[0].message?.content || '';
      if(!rawCode || rawCode.trim() === ''){
        await prisma.conversation.create({
          data:{
            role: 'assistant',
            content: "Unable to generate the code, please try again",
            projectId
          }
        })
        await prisma.user.update({
          where: {id:userId},
          data: {credits: {increment: 5}}
        })
        return res.status(500).json({ message: 'Failed to generate code' });
      }

    const cleanCode = rawCode
      .replace(/```[a-z]*\n?/gi, '')
      .replace(/```$/g, '')
      .trim()

    // Save new version
    const version = await prisma.version.create({
      data: {
        code: cleanCode,
        description: 'Revision update',
        projectId,
      },
    })

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: cleanCode,
        current_version_index: version.id,
      },
    })

    await prisma.conversation.create({
      data: {
        role: 'assistant',
        content:
          "I've made the changes to your website! You can now preview it.",
        projectId,
      },
    })

    res.json({ message: 'Changes made successfully' })
  } catch (error: any) {
    // Refund credits on failure
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } },
    })

    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// ROLLBACK VERSION
// ==========================
export const rollbackToVersion = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId
    const { projectId, versionId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const version = project.versions.find(
      (v: { id: string }) => v.id === versionId
    )

    if (!version) {
      return res.status(404).json({ message: 'Version not found' })
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    })

    await prisma.conversation.create({
      data: {
        role: 'assistant',
        content:
          "I've rolled back your website to the selected version.",
        projectId,
      },
    })

    res.json({ message: 'Version rolled back successfully' })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// DELETE PROJECT
// ==========================
export const deleteProject = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId
    const { projectId } = req.params

    await prisma.websiteProject.delete({
      where: { id: projectId, userId },
    })

    res.json({ message: 'Project deleted successfully' })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// GET PROJECT PREVIEW
// ==========================
export const getProjectPreview = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId
    const { projectId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ project })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// GET PUBLISHED PROJECTS
// ==========================
export const getPublishedProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: { user: true },
    })

    res.json({ projects })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// GET PROJECT BY ID
// ==========================
export const getProjectById = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId },
    })

    if (!project || !project.isPublished || !project.current_code) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ code: project.current_code })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}

// ==========================
// SAVE PROJECT CODE
// ==========================
export const saveProjectCode = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId
    const { projectId } = req.params
    const { code } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!code) {
      return res.status(400).json({ message: 'Code is required' })
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code,
        current_version_index: '',
      },
    })

    res.json({ message: 'Project saved successfully' })
  } catch (error: any) {
    console.log(error.code || error.message)
    res.status(500).json({ message: error.message })
  }
}
