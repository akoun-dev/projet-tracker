import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-6">
      <h1 className="text-4xl font-bold text-center">404 - Page non trouvée</h1>
      <p className="text-muted-foreground text-center">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link to="/auth/login">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
