'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewPostPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Tagging state
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState(null) // { x, y, visible }
  const [tagLabel, setTagLabel] = useState('')
  const [tagLink, setTagLink] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError('Only image files allowed!')
      return
    }
    setFile(selected)
    setError('')
    setTags([]) // reset tags when new image picked
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(selected)
  }

  const handleImageClick = (e) => {
    // Don't trigger if clicking on an existing tag dot
    if (e.target.closest('.tag-dot')) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setNewTag({ x, y, visible: true })
    setTagLabel('')
    setTagLink('')
  }

  const handleSaveTag = () => {
    if (!tagLabel) return

    setTags([...tags, {
      x: newTag.x,
      y: newTag.y,
      label: tagLabel,
      buy_link: tagLink,
    }])

    setNewTag(null)
    setTagLabel('')
    setTagLink('')
  }

  const handleCancelTag = () => {
    setNewTag(null)
    setTagLabel('')
    setTagLink('')
  }

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Pick an image first!')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Upload image
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { data, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const imageUrl = supabase.storage
      .from('posts')
      .getPublicUrl(data.path).data.publicUrl

    // Save post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ user_id: user.id, image_url: imageUrl, caption })
      .select()
      .single()

    if (postError) {
      setError(postError.message)
      setLoading(false)
      return
    }

    // Save all tags
    if (tags.length > 0) {
      const tagRows = tags.map((tag) => ({
        post_id: post.id,
        label: tag.label,
        x_percent: tag.x,
        y_percent: tag.y,
        buy_link: tag.buy_link || null,
      }))

      const { error: tagError } = await supabase
        .from('tags')
        .insert(tagRows)

      if (tagError) {
        setError(tagError.message)
        setLoading(false)
        return
      }
    }

    router.push('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-6">
          <h1 className="text-pink-400 text-lg leading-relaxed">&gt; NEW POST</h1>
          <p className="text-green-700 text-xs mt-2">SHARE YOUR FIT WITH THE WORLD</p>
        </div>

        <div className="pixel-box bg-green-950 p-6">

          {error && (
            <div className="border-2 border-red-500 bg-red-950 p-3 mb-4">
              <p className="text-red-400 text-xs leading-relaxed">!! {error}</p>
            </div>
          )}

          {/* Step 1 — File picker */}
          <div className="mb-6">
            <label className="text-pink-400 text-xs mb-3 block">
              &gt; STEP 1: PICK YOUR FIT
            </label>
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-pink-800 hover:border-pink-400 transition-colors p-8 text-center">
                <p className="text-green-600 text-xs leading-relaxed">
                  {file ? `✓ ${file.name}` : '[ CLICK TO UPLOAD IMAGE ]'}
                </p>
                <p className="text-green-900 text-xs mt-2">JPG, PNG, WEBP</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Step 2 — Preview + Tagging */}
          {preview && (
            <div className="mb-6">
              <label className="text-pink-400 text-xs mb-3 block">
                &gt; STEP 2: TAG YOUR ITEMS
              </label>
              <p className="text-green-700 text-xs mb-3">
                [ CLICK ANYWHERE ON THE IMAGE TO TAG AN ITEM ]
              </p>

              {/* Image with tag dots */}
              <div
                className="relative border-2 border-pink-500 cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Existing tag dots */}
                {tags.map((tag, i) => (
                  <div
                    key={i}
                    className="tag-dot absolute"
                    style={{
                      left: `${tag.x}%`,
                      top: `${tag.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Dot */}
                    <div className="w-4 h-4 bg-pink-500 border-2 border-black" />

                    {/* Tooltip */}
                    <div className="absolute z-10 bg-black border-2 border-pink-500 px-2 py-1 text-xs text-pink-400 whitespace-nowrap"
                      style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)' }}
                    >
                      {tag.label}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveTag(i) }}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* New tag popup */}
                {newTag?.visible && (
                  <div
                    className="absolute z-20 bg-black border-2 border-pink-500 p-3"
                    style={{
                      left: `${newTag.x}%`,
                      top: `${newTag.y}%`,
                      transform: 'translate(-50%, -110%)',
                      minWidth: '200px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-pink-400 text-xs mb-2">&gt; TAG ITEM</p>
                    <input
                      type="text"
                      placeholder="Item name (e.g. Nike Air Force)"
                      value={tagLabel}
                      onChange={(e) => setTagLabel(e.target.value)}
                      className="pixel-input w-full bg-green-950 text-pink-400 px-2 py-2 text-xs placeholder-green-900 mb-2"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Buy link (optional)"
                      value={tagLink}
                      onChange={(e) => setTagLink(e.target.value)}
                      className="pixel-input w-full bg-green-950 text-pink-400 px-2 py-2 text-xs placeholder-green-900 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTag}
                        className="pixel-btn flex-1 bg-pink-500 text-black text-xs py-2 border-2 border-black"
                      >
                        [ SAVE ]
                      </button>
                      <button
                        onClick={handleCancelTag}
                        className="pixel-btn flex-1 bg-black text-pink-400 text-xs py-2 border-2 border-pink-800"
                      >
                        [ CANCEL ]
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags list */}
              {tags.length > 0 && (
                <div className="mt-3">
                  <p className="text-green-700 text-xs mb-2">
                    ✓ {tags.length} ITEM(S) TAGGED
                  </p>
                  {tags.map((tag, i) => (
                    <div key={i} className="flex items-center justify-between border border-green-900 px-2 py-1 mb-1">
                      <span className="text-pink-400 text-xs">{tag.label}</span>
                      <button
                        onClick={() => handleRemoveTag(i)}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        [ REMOVE ]
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Caption */}
          <div className="mb-6">
            <label className="text-pink-400 text-xs mb-3 block">
              &gt; STEP 3: ADD CAPTION
            </label>
            <textarea
              placeholder="describe your fit..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="pixel-input w-full bg-black text-pink-400 px-3 py-3 text-xs placeholder-green-900 resize-none"
            />
          </div>

          {/* Step 4 — Submit */}
          <div>
            <label className="text-pink-400 text-xs mb-3 block">
              &gt; STEP 4: POST IT
            </label>
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="pixel-btn w-full bg-pink-500 text-black text-xs py-4 border-2 border-black disabled:opacity-50"
            >
              {loading ? '> UPLOADING...' : '> SHARE FIT [ ENTER ]'}
            </button>
          </div>

        </div>

        <div className="text-center mt-4">
          <a href="/feed" className="text-green-700 text-xs hover:text-green-500">
            [ CANCEL — BACK TO FEED ]
          </a>
        </div>

      </div>
    </div>
  )
}