import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PrivateRoute } from './auth/PrivateRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { TournamentsListPage } from './pages/organizer/TournamentsListPage'
import { TournamentEditPage } from './pages/organizer/TournamentEditPage'
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminSeasonsPage } from './pages/admin/AdminSeasonsPage'
import { TournamentPage } from './pages/TournamentPage'
import { RankingPage } from './pages/RankingPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/players/:id" element={<PublicProfilePage />} />
          <Route path="/tournaments/:id" element={<TournamentPage />} />
          <Route path="/t/:id" element={<TournamentPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route
            path="/organizer"
            element={
              <PrivateRoute requiredRole="ORGANIZER">
                <OrganizerDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/tournaments"
            element={
              <PrivateRoute requiredRole="ORGANIZER">
                <TournamentsListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/tournaments/:id/edit"
            element={
              <PrivateRoute requiredRole="ORGANIZER">
                <TournamentEditPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/seasons"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminSeasonsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
