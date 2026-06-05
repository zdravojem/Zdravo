import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteImage,
  getPublicUrl,
  hasSupabaseConfig,
  slugify,
  supabase,
  supabaseConfigError,
  uploadImage,
} from '../lib/supabase'
import {
  ingredientCategories,
  normalizeIngredientCategory,
} from '../lib/ingredientCategories'

const emptyForm = {
  name_sl: '',
  category: ingredientCategories[0].value,
  emoji: '',
}

function storagePathForFile(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
  const baseName = extension ? file.name.slice(0, -(extension.length + 1)) : file.name
  const safeBaseName = slugify(baseName) || 'image'
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '')

  return `${Date.now()}-${safeBaseName}${safeExtension ? `.${safeExtension}` : ''}`
}

function IngredientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [imagePath, setImagePath] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('')
  const selectedPreviewRef = useRef('')
  const [loading, setLoading] = useState(isEditing && hasSupabaseConfig)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(
    hasSupabaseConfig ? '' : supabaseConfigError,
  )

  useEffect(() => {
    if (!isEditing || !hasSupabaseConfig || !supabase) {
      return undefined
    }

    let cancelled = false

    async function fetchIngredient() {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .single()

      if (cancelled) {
        return
      }

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setForm({
          name_sl: data.name_sl ?? '',
          category: normalizeIngredientCategory(data.category, data.name_sl),
          emoji: data.emoji ?? '',
        })
        setImagePath(data.image_path ?? '')
      }

      setLoading(false)
    }

    fetchIngredient()

    return () => {
      cancelled = true
    }
  }, [id, isEditing])

  useEffect(() => {
    return () => {
      if (selectedPreviewRef.current) {
        URL.revokeObjectURL(selectedPreviewRef.current)
      }
    }
  }, [])

  const currentPreviewUrl =
    hasSupabaseConfig && imagePath ? getPublicUrl('ingredient-images', imagePath) : ''
  const previewUrl = selectedPreviewUrl || currentPreviewUrl

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null

    if (selectedPreviewRef.current) {
      URL.revokeObjectURL(selectedPreviewRef.current)
      selectedPreviewRef.current = ''
    }

    setImageFile(file)

    if (file) {
      const objectUrl = URL.createObjectURL(file)
      selectedPreviewRef.current = objectUrl
      setSelectedPreviewUrl(objectUrl)
    } else {
      setSelectedPreviewUrl('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nameSl = form.name_sl.trim()

    if (!supabase) {
      setError(supabaseConfigError)
      return
    }

    if (!nameSl) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let nextImagePath = imagePath

      if (imageFile) {
        if (isEditing && imagePath) {
          await deleteImage('ingredient-images', imagePath)
        }

        const uploadedImage = await uploadImage(
          'ingredient-images',
          imageFile,
          storagePathForFile(imageFile),
        )
        nextImagePath = uploadedImage.path
      }

      const payload = {
        name_sl: nameSl,
        category: form.category,
        emoji: form.emoji.trim() || null,
        image_path: nextImagePath || null,
        updated_at: new Date().toISOString(),
      }

      const { error: saveError } = isEditing
        ? await supabase
            .from('ingredients')
            .update(payload)
            .eq('id', id)
            .select('id')
            .single()
        : await supabase.from('ingredients').insert(payload).select('id').single()

      if (saveError) {
        throw saveError
      }

      navigate('/ingredients')
    } catch (submitError) {
      setError(submitError.message || 'Ingredient could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page narrow-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Ingredients</p>
          <h1>{isEditing ? 'Edit Ingredient' : 'Add Ingredient'}</h1>
        </div>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      {loading ? (
        <p className="notice">Loading ingredient...</p>
      ) : (
        <form className="form-panel" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              name="name_sl"
              value={form.name_sl}
              onChange={updateField}
              required
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select name="category" value={form.category} onChange={updateField}>
              {ingredientCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Emoji</span>
            <input
              type="text"
              name="emoji"
              value={form.emoji}
              onChange={updateField}
              maxLength="8"
            />
          </label>

          <label className="field">
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {previewUrl ? (
            <div className="image-preview">
              <img src={previewUrl} alt={form.name_sl || 'Ingredient preview'} />
            </div>
          ) : null}

          <div className="form-actions">
            <Link className="button ghost" to="/ingredients">
              Cancel
            </Link>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Ingredient'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default IngredientFormPage
