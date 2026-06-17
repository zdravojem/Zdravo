import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteImage,
  getPublicUrl,
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from '../lib/supabase'
import { ingredientCategoryLabel } from '../lib/ingredientCategories'

function ingredientImageUrl(path) {
  return path ? getPublicUrl('ingredient-images', path) : ''
}

function IngredientsPage() {
  const [ingredients, setIngredients] = useState([])
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

    async function fetchIngredients() {
      const { data, error: fetchError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name_sl', { ascending: true })

      if (cancelled) {
        return
      }

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setIngredients(data ?? [])
      }

      setLoading(false)
    }

    fetchIngredients()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(ingredient) {
    if (!supabase) {
      setError(supabaseConfigError)
      return
    }

    const confirmed = window.confirm(`Delete ${ingredient.name_sl}?`)

    if (!confirmed) {
      return
    }

    setDeletingId(ingredient.id)
    setError('')

    const { error: deleteError } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', ingredient.id)

    if (deleteError) {
      setError(deleteError.message)
      setDeletingId(null)
      return
    }

    setIngredients((current) => current.filter((item) => item.id !== ingredient.id))

    if (ingredient.image_path) {
      try {
        await deleteImage('ingredient-images', ingredient.image_path)
      } catch (storageError) {
        setError(
          `Ingredient deleted, but the image could not be removed: ${storageError.message}`,
        )
      }
    }

    setDeletingId(null)
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Ingredients</h1>
        </div>
        <Link className="button primary" to="/ingredients/new">
          Add Ingredient
        </Link>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="empty-cell">
                  Loading ingredients...
                </td>
              </tr>
            ) : ingredients.length ? (
              ingredients.map((ingredient) => {
                const imageUrl = ingredientImageUrl(ingredient.image_path)

                return (
                  <tr key={ingredient.id}>
                    <td>
                      {imageUrl ? (
                        <img
                          className="thumbnail"
                          src={imageUrl}
                          alt={ingredient.name_sl}
                        />
                      ) : (
                        <span className="thumbnail placeholder">
                          -
                        </span>
                      )}
                    </td>
                    <td className="strong-cell">{ingredient.name_sl}</td>
                    <td>{ingredientCategoryLabel(ingredient.category, ingredient.name_sl)}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="button ghost" to={`/ingredients/${ingredient.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="button danger"
                          type="button"
                          disabled={deletingId === ingredient.id}
                          onClick={() => handleDelete(ingredient)}
                        >
                          {deletingId === ingredient.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-cell">
                  No ingredients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default IngredientsPage
