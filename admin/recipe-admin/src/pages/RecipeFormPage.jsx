import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteImage,
  getPublicUrl,
  hasSupabaseConfig,
  slugify,
  supabase,
  supabaseConfigError,
  syncRecipeQr,
  uploadImage,
} from '../lib/supabase'
import {
  normalizeRecipeDifficulty,
  normalizeRecipeServingUnit,
  parseRecipeTags,
  recipeDifficultyOptions,
  recipeServingUnitOptions,
  recipeTagOptions,
  serializeRecipeTags,
} from '../lib/recipeOptions'

const emptyRecipeForm = {
  name_sl: '',
  slug: '',
  description_sl: '',
  time_min: '',
  servings_quantity: '',
  servings_unit: recipeServingUnitOptions[0],
  difficulty: recipeDifficultyOptions[0],
  tags: [],
  nacin_priprave: '',
  dodatni_nasvet: '',
}

const emptyIngredientDraft = {
  quantity: '',
  unit: '',
  is_optional: false,
}

function parseInteger(value) {
  if (value === '') {
    return null
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isNaN(parsed) ? null : parsed
}

function parseSteps(value) {
  if (!value) {
    return ['']
  }

  try {
    const parsed = JSON.parse(value)

    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((step) => String(step))
    }
  } catch {
    return [String(value)]
  }

  return ['']
}

function storagePathForFile(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
  const baseName = extension ? file.name.slice(0, -(extension.length + 1)) : file.name
  const safeBaseName = slugify(baseName) || 'image'
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '')

  return `${Date.now()}-${safeBaseName}${safeExtension ? `.${safeExtension}` : ''}`
}

function toIngredientId(value) {
  return /^\d+$/.test(value) ? Number(value) : value
}

function RecipeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyRecipeForm)
  const [slugEdited, setSlugEdited] = useState(false)
  const [steps, setSteps] = useState([''])
  const [imagePath, setImagePath] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('')
  const selectedPreviewRef = useRef('')
  const [allIngredients, setAllIngredients] = useState([])
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [ingredientDraft, setIngredientDraft] = useState(emptyIngredientDraft)
  const [recipeIngredients, setRecipeIngredients] = useState([])
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(
    hasSupabaseConfig ? '' : supabaseConfigError,
  )

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return undefined
    }

    let cancelled = false

    async function loadFormData() {
      const ingredientsRequest = supabase
        .from('ingredients')
        .select('id, name_sl')
        .order('name_sl', { ascending: true })

      const requests = isEditing
        ? [
            ingredientsRequest,
            supabase.from('recipes').select('*').eq('id', id).single(),
            supabase.from('recipe_ingredients').select('*').eq('recipe_id', id),
          ]
        : [ingredientsRequest]

      const [ingredientsResult, recipeResult, linksResult] = await Promise.all(requests)

      if (cancelled) {
        return
      }

      if (ingredientsResult.error) {
        setError(ingredientsResult.error.message)
        setLoading(false)
        return
      }

      setAllIngredients(ingredientsResult.data ?? [])

      if (isEditing) {
        const requestError = recipeResult.error || linksResult.error

        if (requestError) {
          setError(requestError.message)
          setLoading(false)
          return
        }

        const recipe = recipeResult.data
        const generatedSlug = slugify(recipe.name_sl ?? '')

        setForm({
          name_sl: recipe.name_sl ?? '',
          slug: recipe.slug ?? '',
          description_sl: recipe.description_sl ?? '',
          time_min: recipe.time_min ?? '',
          servings_quantity: recipe.servings_quantity ?? recipe.servings ?? '',
          servings_unit: normalizeRecipeServingUnit(recipe.servings_unit),
          difficulty: normalizeRecipeDifficulty(recipe.difficulty),
          tags: parseRecipeTags(recipe.tags),
          nacin_priprave: recipe.nacin_priprave ?? '',
          dodatni_nasvet: recipe.dodatni_nasvet ?? '',
        })
        setSlugEdited(Boolean(recipe.slug && recipe.slug !== generatedSlug))
        setSteps(parseSteps(recipe.steps_sl))
        setImagePath(recipe.image_path ?? '')
        setRecipeIngredients(
          (linksResult.data ?? []).map((link) => ({
            ingredient_id: link.ingredient_id,
            quantity: link.quantity ?? '',
            unit: link.unit ?? '',
            is_optional: Number(link.is_optional) === 1,
          })),
        )
      }

      setLoading(false)
    }

    loadFormData()

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

  const ingredientsById = useMemo(() => {
    return new Map(allIngredients.map((ingredient) => [String(ingredient.id), ingredient]))
  }, [allIngredients])

  const filteredIngredients = useMemo(() => {
    const query = ingredientSearch.trim().toLowerCase()
    const selectedIds = new Set(
      recipeIngredients.map((ingredient) => String(ingredient.ingredient_id)),
    )

    return allIngredients.filter((ingredient) => {
      const label = ingredient.name_sl.toLowerCase()

      return !selectedIds.has(String(ingredient.id)) && label.includes(query)
    })
  }, [allIngredients, ingredientSearch, recipeIngredients])

  const currentPreviewUrl =
    hasSupabaseConfig && imagePath ? getPublicUrl('recipe-images', imagePath) : ''
  const previewUrl = selectedPreviewUrl || currentPreviewUrl

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'name_sl' && !slugEdited) {
        next.slug = slugify(value)
      }

      return next
    })
  }

  function updateSlug(event) {
    setSlugEdited(true)
    setForm((current) => ({ ...current, slug: event.target.value }))
  }

  function normalizeSlug() {
    setForm((current) => ({ ...current, slug: slugify(current.slug) }))
  }

  function updateTag(event) {
    const { value, checked } = event.target
    setForm((current) => {
      const tags = checked
        ? [...current.tags, value]
        : current.tags.filter((tag) => tag !== value)

      return {
        ...current,
        tags,
      }
    })
  }

  function updateStep(index, value) {
    setSteps((current) => current.map((step, itemIndex) => (itemIndex === index ? value : step)))
  }

  function addStep() {
    setSteps((current) => [...current, ''])
  }

  function removeStep(index) {
    setSteps((current) => {
      const next = current.filter((_step, itemIndex) => itemIndex !== index)

      return next.length ? next : ['']
    })
  }

  function moveStep(index, direction) {
    setSteps((current) => {
      const nextIndex = index + direction

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current
      }

      const next = [...current]
      const currentStep = next[index]
      next[index] = next[nextIndex]
      next[nextIndex] = currentStep

      return next
    })
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

  function updateIngredientDraft(event) {
    const { name, type, checked, value } = event.target
    setIngredientDraft((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function addIngredient() {
    if (!selectedIngredientId) {
      setError('Choose an ingredient first.')
      return
    }

    const alreadyAdded = recipeIngredients.some(
      (ingredient) => String(ingredient.ingredient_id) === selectedIngredientId,
    )

    if (alreadyAdded) {
      setError('That ingredient is already added.')
      return
    }

    setRecipeIngredients((current) => [
      ...current,
      {
        ingredient_id: toIngredientId(selectedIngredientId),
        quantity: ingredientDraft.quantity,
        unit: ingredientDraft.unit,
        is_optional: ingredientDraft.is_optional,
      },
    ])
    setSelectedIngredientId('')
    setIngredientDraft(emptyIngredientDraft)
    setError('')
  }

  function updateRecipeIngredient(index, field, value) {
    setRecipeIngredients((current) =>
      current.map((ingredient, itemIndex) =>
        itemIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    )
  }

  function removeIngredient(index) {
    setRecipeIngredients((current) => current.filter((_ingredient, itemIndex) => itemIndex !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!supabase) {
      setError(supabaseConfigError)
      return
    }

    const nameSl = form.name_sl.trim()
    const recipeSlug = slugify(form.slug) || slugify(nameSl)

    if (!nameSl) {
      setError('Name is required.')
      return
    }

    if (!recipeSlug) {
      setError('Slug is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let slugQuery = supabase
        .from('recipes')
        .select('id')
        .eq('slug', recipeSlug)
        .limit(1)

      if (isEditing) {
        slugQuery = slugQuery.neq('id', id)
      }

      const { data: matchingSlugs, error: slugError } = await slugQuery

      if (slugError) {
        throw slugError
      }

      if (matchingSlugs?.length) {
        throw new Error('Slug must be unique.')
      }

      let nextImagePath = imagePath

      if (imageFile) {
        if (isEditing && imagePath) {
          await deleteImage('recipe-images', imagePath)
        }

        const uploadedImage = await uploadImage(
          'recipe-images',
          imageFile,
          storagePathForFile(imageFile),
        )
        nextImagePath = uploadedImage.path
      }

      const stepsToSave = steps.map((step) => step.trim()).filter(Boolean)
      const servingsQuantity = parseInteger(form.servings_quantity)
      const payload = {
        name_sl: nameSl,
        slug: recipeSlug,
        description_sl: form.description_sl.trim() || null,
        time_min: parseInteger(form.time_min),
        servings_quantity: servingsQuantity,
        servings_unit: servingsQuantity === null ? null : form.servings_unit || null,
        difficulty: form.difficulty || null,
        tags: serializeRecipeTags(form.tags),
        steps_sl: JSON.stringify(stepsToSave),
        image_path: nextImagePath || null,
        nacin_priprave: form.nacin_priprave.trim() || null,
        dodatni_nasvet: form.dodatni_nasvet.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { data: savedRecipe, error: saveError } = isEditing
        ? await supabase
            .from('recipes')
            .update(payload)
            .eq('id', id)
            .select('id')
            .single()
        : await supabase.from('recipes').insert(payload).select('id').single()

      if (saveError) {
        throw saveError
      }

      const recipeId = savedRecipe.id
      const { error: deleteLinksError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)

      if (deleteLinksError) {
        throw deleteLinksError
      }

      const linkRows = recipeIngredients.map((ingredient) => ({
        recipe_id: recipeId,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity.trim() || null,
        unit: ingredient.unit.trim() || null,
        is_optional: ingredient.is_optional ? 1 : 0,
      }))

      if (linkRows.length) {
        const { error: insertLinksError } = await supabase
          .from('recipe_ingredients')
          .insert(linkRows)

        if (insertLinksError) {
          throw insertLinksError
        }
      }

      await syncRecipeQr({
        record: { id: recipeId },
        schema: 'public',
        table: 'recipes',
        type: isEditing ? 'UPDATE' : 'INSERT',
      })

      navigate('/recipes')
    } catch (submitError) {
      setError(submitError.message || 'Recipe could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page form-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Recipes</p>
          <h1>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</h1>
        </div>
      </div>

      {error ? <p className="notice error">{error}</p> : null}

      {loading ? (
        <p className="notice">Loading recipe...</p>
      ) : (
        <form className="form-panel" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Basic Info</h2>
            <div className="form-grid">
              <label className="field span-2">
                <span>Name</span>
                <input
                  type="text"
                  name="name_sl"
                  value={form.name_sl}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="field span-2">
                <span>Slug</span>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onBlur={normalizeSlug}
                  onChange={updateSlug}
                  required
                />
              </label>

              <label className="field span-2">
                <span>Description</span>
                <textarea
                  name="description_sl"
                  value={form.description_sl}
                  onChange={updateField}
                  rows="5"
                />
              </label>

              <label className="field">
                <span>Prep/Cook Time</span>
                <input
                  type="number"
                  min="0"
                  name="time_min"
                  value={form.time_min}
                  onChange={updateField}
                />
              </label>

              <fieldset className="serving-fieldset span-2">
                <legend>Number of serving</legend>
                <div className="serving-fields">
                  <label className="field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="0"
                      name="servings_quantity"
                      value={form.servings_quantity}
                      onChange={updateField}
                    />
                  </label>

                  <label className="field">
                    <span>Unit</span>
                    <select name="servings_unit" value={form.servings_unit} onChange={updateField}>
                      {recipeServingUnitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>

              <label className="field">
                <span>Difficulty</span>
                <select name="difficulty" value={form.difficulty} onChange={updateField}>
                  {recipeDifficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Method</h2>
            <div className="form-grid">
              <label className="field span-2">
                <span>Način priprave</span>
                <textarea
                  name="nacin_priprave"
                  value={form.nacin_priprave}
                  onChange={updateField}
                  rows="5"
                />
              </label>

              <label className="field span-2">
                <span>Additional advice / Dodatni nasvet</span>
                <textarea
                  name="dodatni_nasvet"
                  value={form.dodatni_nasvet}
                  onChange={updateField}
                  rows="4"
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Tags</h2>
            <div className="checkbox-grid">
              {recipeTagOptions.map((tag) => (
                <label className="checkbox-field" key={tag}>
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag}
                    checked={form.tags.includes(tag)}
                    onChange={updateTag}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h2>Steps</h2>
              <button className="button ghost" type="button" onClick={addStep}>
                Add Step
              </button>
            </div>

            <div className="steps-list">
              {steps.map((step, index) => (
                <div className="step-row" key={`step-${index + 1}`}>
                  <span className="step-number">{index + 1}</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(event) => updateStep(index, event.target.value)}
                  />
                  <button
                    className="button ghost icon-text"
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveStep(index, -1)}
                  >
                    Up
                  </button>
                  <button
                    className="button ghost icon-text"
                    type="button"
                    disabled={index === steps.length - 1}
                    onClick={() => moveStep(index, 1)}
                  >
                    Down
                  </button>
                  <button className="button danger" type="button" onClick={() => removeStep(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <h2>Image</h2>
            <label className="field">
              <span>Recipe Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {previewUrl ? (
              <div className="image-preview large-preview">
                <img src={previewUrl} alt={form.name_sl || 'Recipe preview'} />
              </div>
            ) : null}
          </section>

          <section className="form-section">
            <h2>Ingredients</h2>
            <div className="ingredient-picker">
              <label className="field">
                <span>Search</span>
                <input
                  type="search"
                  value={ingredientSearch}
                  onChange={(event) => setIngredientSearch(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Ingredient</span>
                <select
                  value={selectedIngredientId}
                  onChange={(event) => setSelectedIngredientId(event.target.value)}
                >
                  <option value="">Select ingredient</option>
                  {filteredIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name_sl}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Quantity</span>
                <input
                  type="text"
                  name="quantity"
                  value={ingredientDraft.quantity}
                  onChange={updateIngredientDraft}
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <input
                  type="text"
                  name="unit"
                  value={ingredientDraft.unit}
                  onChange={updateIngredientDraft}
                />
              </label>

              <label className="checkbox-field align-end">
                <input
                  type="checkbox"
                  name="is_optional"
                  checked={ingredientDraft.is_optional}
                  onChange={updateIngredientDraft}
                />
                <span>Optional</span>
              </label>

              <button className="button ghost align-end" type="button" onClick={addIngredient}>
                Add
              </button>
            </div>

            <div className="ingredient-list">
              {recipeIngredients.length ? (
                recipeIngredients.map((ingredient, index) => {
                  const ingredientDetails = ingredientsById.get(String(ingredient.ingredient_id))

                  return (
                    <div className="ingredient-item" key={`${ingredient.ingredient_id}-${index}`}>
                      <div className="ingredient-name">
                        <strong>{ingredientDetails?.name_sl || ingredient.ingredient_id}</strong>
                      </div>
                      <label className="compact-field">
                        <span>Qty</span>
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(event) =>
                            updateRecipeIngredient(index, 'quantity', event.target.value)
                          }
                        />
                      </label>
                      <label className="compact-field">
                        <span>Unit</span>
                        <input
                          type="text"
                          value={ingredient.unit}
                          onChange={(event) =>
                            updateRecipeIngredient(index, 'unit', event.target.value)
                          }
                        />
                      </label>
                      <label className="checkbox-field ingredient-optional">
                        <input
                          type="checkbox"
                          checked={ingredient.is_optional}
                          onChange={(event) =>
                            updateRecipeIngredient(index, 'is_optional', event.target.checked)
                          }
                        />
                        <span>Optional</span>
                      </label>
                      <button
                        className="button danger"
                        type="button"
                        onClick={() => removeIngredient(index)}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })
              ) : (
                <p className="muted-text">No ingredients added.</p>
              )}
            </div>
          </section>

          <div className="form-actions">
            <Link className="button ghost" to="/recipes">
              Cancel
            </Link>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default RecipeFormPage
