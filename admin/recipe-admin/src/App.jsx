import {
  HashRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import AuthProvider from './auth/AuthProvider.jsx'
import { useAuth } from './auth/useAuth'
import DashboardPage from './pages/DashboardPage.jsx'
import IngredientFormPage from './pages/IngredientFormPage.jsx'
import IngredientsPage from './pages/IngredientsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RecipeFormPage from './pages/RecipeFormPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { supabase } from './lib/supabase'
import './App.css'

function AppLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut()
    }

    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">Z</span>
          <div>
            <p className="brand-name">Zdravo</p>
            <p className="brand-kicker">Admin</p>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/ingredients">Ingredients</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/ingredients/new" element={<IngredientFormPage key="new-ingredient" />} />
          <Route path="/ingredients/:id/edit" element={<IngredientFormPage key="edit-ingredient" />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage key="new-recipe" />} />
          <Route path="/recipes/:id/edit" element={<RecipeFormPage key="edit-recipe" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function ProtectedApp() {
  const location = useLocation()
  const { loading, session } = useAuth()

  if (loading) {
    return <main className="app-loading">Checking session...</main>
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <AppLayout />
}

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
