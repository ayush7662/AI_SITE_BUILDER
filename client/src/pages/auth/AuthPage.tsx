import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="w-full max-w-md">
        <AuthView pathname={pathname} classNames={{base: 'bg-black/10 ring ring-indigo-900'}} />
      </div>
    </main>
  )
}