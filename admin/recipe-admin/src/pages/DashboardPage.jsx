import { useEffect, useState } from 'react'
import {
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from '../lib/supabase'

const initialCounts = {
  ingredients: 0,
  recipes: 0,
}

function DashboardPage() {
  const [counts, setCounts] = useState(initialCounts)
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [error, setError] = useState(
    hasSupabaseConfig ? '' : supabaseConfigError,
  )

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return undefined
    }

    let cancelled = false

    async function fetchCounts() {
      const [ingredientsResult, recipesResult] = await Promise.all([
        supabase.from('ingredients').select('*', { count: 'exact', head: true }),
        supabase.from('recipes').select('*', { count: 'exact', head: true }),
      ])

      if (cancelled) {
        return
      }

      const requestError = ingredientsResult.error || recipesResult.error

      if (requestError) {
        setError(requestError.message)
      } else {
        setCounts({
          ingredients: ingredientsResult.count ?? 0,
          recipes: recipesResult.count ?? 0,
        })
      }

      setLoading(false)
    }

    fetchCounts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      <div className="stats-grid" aria-busy={loading}>
        <article className="stat-card">
          <span className="stat-label">Recipes</span>
          <strong>{loading ? '...' : counts.recipes}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Ingredients</span>
          <strong>{loading ? '...' : counts.ingredients}</strong>
        </article>
      </div>
    </section>
  )
}

export default DashboardPage
