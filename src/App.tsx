import LoginPage from "./pages/auth/LoginPage"
import { Routes, Route } from "react-router-dom"
import { useTheme } from "./hooks/use-theme"
import RegisterPage from "./pages/auth/RegisterPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import NotFound from "./pages/NotFound"
import DashboardPage from "./pages/views/DashboardPage"
import ProjectsPage from "./pages/views/ProjectsPage"
import ProjectDetailsPage from "./pages/views/ProjectDetailsPage"
import ProjectEditPage from "./pages/views/ProjectEditPage"
import TasksPage from "./pages/views/TasksPage"
import TaskDetailsPage from "./pages/views/TaskDetailsPage"
import PlanningPage from "./pages/views/PlanningPage"
import UsersPage from "./pages/views/UsersPage"
import UserProfilePage from "./pages/views/UserProfilePage"
import StatsPage from "./pages/views/StatsPage"
import SearchPage from "./pages/views/SearchPage"
import ExportHistoryPage from "./pages/views/ExportHistoryPage"
import SettingsPage from "./pages/views/SettingsPage"

function App() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route
                    path="/auth/reset-password"
                    element={<ResetPasswordPage />}
                />

                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route
                    path="/projects/:id/edit"
                    element={<ProjectEditPage />}
                />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:id" element={<TaskDetailsPage />} />
                <Route path="/planning" element={<PlanningPage />} />
      <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/export-history" element={<ExportHistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}

export default App
