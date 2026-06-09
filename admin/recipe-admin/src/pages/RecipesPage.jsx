import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteImage,
  getPublicUrl,
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from '../lib/supabase'
import { parseRecipeTags } from '../lib/recipeOptions'

function recipeImageUrl(path) {
  return path ? getPublicUrl('recipe-images', path) : ''
}

function servingsText(recipe) {
  const quantity = recipe.servings_quantity ?? recipe.servings

  if (quantity === undefined || quantity === null || quantity === '') {
    return '-'
  }

  return [quantity, recipe.servings_unit].filter(Boolean).join(' ')
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
              <th>Time</th>
              <th>Servings</th>
              <th>Tags</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  Loading recipes...
                </td>
              </tr>
            ) : recipes.length ? (
              recipes.map((recipe) => {
                const imageUrl = recipeImageUrl(recipe.image_path)
                const tags = parseRecipeTags(recipe.tags)

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
                    <td>{recipe.difficulty || '-'}</td>
                    <td>{recipe.time_min ? `${recipe.time_min} min` : '-'}</td>
                    <td>{servingsText(recipe)}</td>
                    <td>
                      <div className="badge-list">
                        {tags.length ? (
                          tags.map((tag) => (
                            <span className="flag-badge" key={tag}>
                              {tag}
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
                <td colSpan="7" className="empty-cell">
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
