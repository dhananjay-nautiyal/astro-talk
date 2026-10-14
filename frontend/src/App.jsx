import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { LanguageProvider } from './context/LanguageContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleRoute from './components/layout/RoleRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'
import UpdatePrompt from './components/common/UpdatePrompt'
import { useUpdateCheck } from './hooks/useUpdateCheck'

const LandingPage = lazy(() => import('./features/landing/pages/LandingPage'))
const HomePage = lazy(() => import('./features/landing/pages/HomePage'))
const AstrologerListPage = lazy(() => import('./features/astrologer/pages/AstrologerListPage'))
const AstrologerProfilePage = lazy(() => import('./features/astrologer/pages/AstrologerProfilePage'))
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'))

const DashboardPage = lazy(() => import('./features/consultation/pages/DashboardPage'))
const WalletPage = lazy(() => import('./features/wallet/pages/WalletPage'))
const ConsultationPage = lazy(() => import('./features/consultation/pages/ConsultationPage'))
const HistoryPage = lazy(() => import('./features/consultation/pages/HistoryPage'))
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'))

const AstrologerDashboardPage = lazy(() => import('./features/astrologer/pages/AstrologerDashboardPage'))
const AstrologerProfileEditPage = lazy(() => import('./features/astrologer/pages/AstrologerProfileEditPage'))
const EarningsPage = lazy(() => import('./features/astrologer/pages/EarningsPage'))

const AdminDashboardPage = lazy(() => import('./features/admin/pages/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./features/admin/pages/AdminUsersPage'))
const AdminAstrologersPage = lazy(() => import('./features/admin/pages/AdminAstrologersPage'))
const AdminRevenuePage = lazy(() => import('./features/admin/pages/AdminRevenuePage'))
const NotFoundPage = lazy(() => import('./features/landing/pages/NotFoundPage'))

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
)

const DashboardLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  </div>
)

const ConsultationLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
)

function App() {
  const { update, dismiss, applyUpdate } = useUpdateCheck()
  const content = (
    <Provider store={store}>
        <LanguageProvider>
          <SocketProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#1f1f1f',
                  color: '#fff',
                  fontSize: '14px',
                },
                success: {
                  style: { background: '#065f46' },
                },
                error: {
                  style: { background: '#991b1b' },
                },
              }}
            />
            <Suspense fallback={<LoadingSpinner className="py-20" size="lg" />}>
              <ErrorBoundary>
              {update && (
                <UpdatePrompt
                  version={update.version}
                  notes={update.notes}
                  onUpdate={applyUpdate}
                  onLater={dismiss}
                />
              )}
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route element={<PublicLayout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/astrologers" element={<AstrologerListPage />} />
                  <Route path="/astrologers/:id" element={<AstrologerProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route element={<ProtectedRoute><RoleRoute allowedRoles={['USER']}><DashboardLayout /></RoleRoute></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route element={<ProtectedRoute><ConsultationLayout /></ProtectedRoute>}>
                  <Route path="/consultation/:id" element={<ConsultationPage />} />
                </Route>

                <Route element={<ProtectedRoute><RoleRoute allowedRoles={['ASTROLOGER']}><DashboardLayout /></RoleRoute></ProtectedRoute>}>
                  <Route path="/astrologer/dashboard" element={<AstrologerDashboardPage />} />
                  <Route path="/astrologer/profile" element={<AstrologerProfileEditPage />} />
                  <Route path="/astrologer/earnings" element={<EarningsPage />} />
                </Route>

                <Route element={<ProtectedRoute><RoleRoute allowedRoles={['ADMIN']}><DashboardLayout /></RoleRoute></ProtectedRoute>}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/astrologers" element={<AdminAstrologersPage />} />
                  <Route path="/admin/revenue" element={<AdminRevenuePage />} />
                </Route>

                <Route path="*" element={<PublicLayout />}>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
              </ErrorBoundary>
            </Suspense>
          </BrowserRouter>
          </SocketProvider>
        </LanguageProvider>
      </Provider>
  )
  return content
}

export default App
