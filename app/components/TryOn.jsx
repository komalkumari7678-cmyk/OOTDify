'use client'

import { useState } from 'react'

export default function TryOn({ garmentImageUrl }) {
  const [humanFile, setHumanFile] = useState(null)
  const [humanPreview, setHumanPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleHumanImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setHumanFile(file)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setHumanPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleTryOn = async () => {
    if (!humanFile) {
      setError('Upload your photo first!')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Convert human image to base64
      const humanBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(humanFile)
      })

      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: humanBase64,
          garmentImage: garmentImageUrl,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.output)
      }

    } catch (err) {
      setError('Something went wrong. Try again!')
    }

    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pixel-btn w-full bg-green-500 text-black text-xs py-3 border-2 border-black mt-3 hover:bg-green-400"
      >
        👗 TRY THIS ON
      </button>
    )
  }

  return (
    <div className="pixel-box bg-green-950 p-4 mt-3">

      <div className="flex items-center justify-between mb-4">
        <p className="text-pink-400 text-xs">&gt; VIRTUAL TRY-ON</p>
        <button
          onClick={() => {
            setOpen(false)
            setResult(null)
            setHumanPreview(null)
            setError('')
          }}
          className="text-green-700 text-xs hover:text-green-500"
        >
          [ CLOSE ]
        </button>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-950 p-3 mb-4">
          <p className="text-red-400 text-xs">!! {error}</p>
        </div>
      )}

      {/* Side by side — garment + human */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-green-600 text-xs mb-2">&gt; THE FIT</p>
          <div className="border-2 border-pink-800">
            <img
              src={garmentImageUrl}
              alt="Garment"
              className="w-full aspect-square object-cover"
            />
          </div>
        </div>

        <div>
          <p className="text-green-600 text-xs mb-2">&gt; YOUR PHOTO</p>
          <label className="cursor-pointer block">
            <div className={`border-2 ${humanPreview ? 'border-pink-500' : 'border-dashed border-pink-800'} aspect-square flex items-center justify-center overflow-hidden`}>
              {humanPreview ? (
                <img
                  src={humanPreview}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-green-900 text-xs text-center p-2">
                  [ CLICK TO UPLOAD ]
                </p>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleHumanImage}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleTryOn}
        disabled={loading || !humanFile}
        className="pixel-btn w-full bg-pink-500 text-black text-xs py-3 border-2 border-black disabled:opacity-50 mb-4"
      >
        {loading ? '> GENERATING... (30-60 secs)' : '> GENERATE [ ENTER ]'}
      </button>

      {loading && (
        <div className="text-center mb-4">
          <p className="text-green-600 text-xs animate-pulse">
            AI IS WORKING ITS MAGIC...
          </p>
          <p className="text-green-900 text-xs mt-1">
            THIS TAKES 30-60 SECONDS
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <p className="text-pink-400 text-xs mb-2">&gt; RESULT</p>
          <div className="border-2 border-pink-500 pixel-box">
            <img
              src={Array.isArray(result) ? result[0] : result}
              alt="Try-on result"
              className="w-full object-cover"
            />
          </div>
          
        <a    href={Array.isArray(result) ? result[0] : result}
            download="my-tryon.png"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn block text-center mt-3 bg-black text-pink-400 text-xs py-3 border-2 border-pink-800"
          >
            [ DOWNLOAD RESULT ]
          </a>
        </div>
      )}

    </div>
  )
}