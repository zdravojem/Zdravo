import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteImage,
  getPublicUrl,
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from '../lib/supabase'

const flags = [
  ['is_vegetarian', 'Vegetarian'],
  ['is_vegan', 'Vegan'],
  ['is_gluten_free', 'Gluten-free'],
  ['is_lactose_free', 'Lactose-free'],
  ['is_heart_healthy', 'Heart-healthy'],
  ['is_quick', 'Quick'],
]

function recipeImageUrl(path) {
  return path ? getPublicUrl('recipe-images', path) : ''
}

function difficultyStars(difficulty) {
  const count = Number(difficulty) || 0

  return count ? '\u2b50'.repeat(count) : '-'
}

function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [error, setError] = useState(
    hasSupabaseConfig ? '' : supabaseConfigError,
  )
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return undefined
    }

    let cancelled = false

    async function fetchRecipes() {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('name_sl', { ascending: true })

      if (cancelled) {
        return
      }

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setRecipes(data ?? [])
      }

      setLoading(false)
    }

    fetchRecipes()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(recipe) {
    if (!supabase) {
      setError(supabaseConfigError)
      return
    }

    const confirmed = window.confirm(`Delete ${recipe.name_sl}?`)

    if (!confirmed) {
      return
    }

    setDeletingId(recipe.id)
    setError('')

    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)

    if (deleteError) {
      setError(deleteError.message)
      setDeletingId(null)
      return
    }

    setRecipes((current) => current.filter((item) => item.id !== recipe.id))

    if (recipe.image_path) {
      try {
        await deleteImage('recipe-images', recipe.image_path)
      } catch (storageError) {
        setError(`Recipe deleted, but the image could not be removed: ${storageError.message}`)
      }
    }

    setDeletingId(null)
  }

  return (
    <section className="page wide-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Recipes</h1>
        </div>
        <Link className="button primary" to="/recipes/new">
          Add Recipe
        </Link>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      <div className="table-shell">
        <table className="recipes-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Difficulty</th>
              <th>Season</th>
              <th>Flags</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Loading recipes...
                </td>
              </tr>
            ) : recipes.length ? (
              recipes.map((recipe) => {
                const imageUrl = recipeImageUrl(recipe.image_path)
                const activeFlags = flags.filter(([key]) => Number(recipe[key]) === 1)

                return (
                  <tr key={recipe.id}>
                    <td>
                      {imageUrl ? (
                        <img className="thumbnail" src={imageUrl} alt={recipe.name_sl} />
                      ) : (
                        <span className="thumbnail placeholder">-</span>
                      )}
                    </td>
                    <td className="strong-cell">{recipe.name_sl}</td>
                    <td>{difficultyStars(recipe.difficulty)}</td>
                    <td>{recipe.season || '-'}</td>
                    <td>
                      <div className="badge-list">
                        {activeFlags.length ? (
                          activeFlags.map(([key, label]) => (
                            <span className="flag-badge" key={key}>
                              {label}
                            </span>
                          ))
                        ) : (
                          <span className="muted-text">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link className="button ghost" to={`/recipes/${recipe.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="button danger"
                          type="button"
                          disabled={deletingId === recipe.id}
                          onClick={() => handleDelete(recipe)}
                        >
                          {deletingId === recipe.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No recipes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecipesPage
