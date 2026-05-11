# AI Site Builder

An AI-powered website builder is a software tool that uses artificial intelligence to automatically generate, edit, preview, and deploy websites based on simple conversational prompts from the user.

Instead of writing code manually, users can describe what they want in natural language, and the AI creates a fully functional website with layout, design, and content in real time.

---

# 🚀 Live Demo

- Frontend: https://ai-site-builder-zeta.vercel.app  
- Backend: https://ai-site-builder-saua.onrender.com  

---

# ⚙️ Tech Stack

## Frontend
- React 18
- TypeScript
- React Router
- Axios
- Tailwind CSS
- Lucide Icons
- Sonner

## Backend
- Express.js
- Node.js
- Prisma ORM
- PostgreSQL
- Better Auth
- Stripe API

---

# ✨ Features

## AI Website Generation
Generate complete websites using simple prompts with live editing support.

## Version Control
Track and rollback to previous versions of generated websites.

## Live Preview
Instant preview with device responsiveness (mobile, tablet, desktop).

## Authentication
Secure login/signup with session handling.

## Payments
Stripe integration for billing and subscriptions.

---

# 📁 Project Structure

## Client
- components/
- pages/
- configs/
- lib/
- App.tsx

## Server
- routes/
- controllers/
- lib/
- prisma/
- server.ts

---

# 🔌 API Configuration

https://ai-site-builder-saua.onrender.com


---

# 🌐 Routes

## Frontend Routes
- / → Home
- /pricing → Pricing
- /projects → Projects
- /projects/:id → Project Editor
- /preview/:id → Preview
- /community → Community
- /view/:id → Public View
- /auth/:type → Authentication
- /account/settings → Settings

---

# 🔐 Environment Variables

## Backend (.env)


## Frontend (.env)

VITE_BASEURL=https://ai-site-builder-saua.onrender.com


---

# 🚀 Deployment

## Frontend
Hosted on Vercel

## Backend
Hosted on Render

---

# 🧠 Architecture

Frontend (React)
        ↓
Backend (Express API)
        ↓
PostgreSQL (Prisma)
        ↓
AI + Stripe + Auth Services

---

# ⚠️ Important Notes

- Do not use `app.options('*')` in Express v5
- CORS must include frontend domain
- Stripe webhook must be before JSON middleware
- Always use correct backend URL in frontend

---

# 👨‍💻 Author

Ayush Raj
