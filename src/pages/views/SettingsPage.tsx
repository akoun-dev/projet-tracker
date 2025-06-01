import { useTheme } from "@/hooks/use-theme"
import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import * as React from "react"

export default function SettingsPage() {
    const { theme } = useTheme()
    const [tab, setTab] = React.useState("account")

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div
                    className="flex flex-1 flex-col bg-muted/40"
                    data-theme={theme}
                >
                    <div className="flex flex-col gap-6 py-6 px-4 mx-auto w-full">
                        <h1 className="text-2xl font-bold">Paramètres</h1>
                        <Tabs
                            value={tab}
                            onValueChange={setTab}
                            className="w-full"
                        >
                            <TabsList className="mb-4">
                                <TabsTrigger value="account">
                                    Compte
                                </TabsTrigger>
                                <TabsTrigger value="app">
                                    Application
                                </TabsTrigger>
                                <TabsTrigger value="notifications">
                                    Notifications
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="account">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Paramètres du compte
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="flex flex-col gap-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Nom d'utilisateur
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value="Jean Dupont"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="input input-bordered w-full"
                                                    value="jean.dupont@email.com"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Mot de passe
                                                </label>
                                                <input
                                                    type="password"
                                                    className="input input-bordered w-full"
                                                    value="********"
                                                    readOnly
                                                />
                                                <button
                                                    type="button"
                                                    className="text-xs text-primary underline mt-1"
                                                >
                                                    Modifier le mot de passe
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-error mt-4"
                                                >
                                                    Se déconnecter
                                                </button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="app">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Préférences de l'application
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="flex flex-col gap-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Thème
                                                </label>
                                                <select className="input input-bordered w-full">
                                                    <option>Système</option>
                                                    <option>Clair</option>
                                                    <option>Sombre</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Langue
                                                </label>
                                                <select className="input input-bordered w-full">
                                                    <option>Français</option>
                                                    <option>Anglais</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Accessibilité
                                                </label>
                                                <div className="flex gap-4 items-center">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                        />
                                                        Police dyslexie
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                        />
                                                        Contraste élevé
                                                    </label>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="notifications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Préférences de notifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="flex flex-col gap-4 max-w-md">
                                            <div>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                        defaultChecked
                                                    />
                                                    Email
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                    />
                                                    Notifications dans
                                                    l’application
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                    />
                                                    Notifications push (mobile)
                                                </label>
                                            </div>
                                            <div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary mt-2"
                                                >
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
