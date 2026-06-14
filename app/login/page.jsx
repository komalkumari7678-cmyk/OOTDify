'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Fill in all fields!')
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Wrong email or password!')
      setLoading(false)
      return
    }

    router.push('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo box */}
        <div className="pixel-box bg-pink-500 p-4 mb-6 text-center">
          <h1 className="text-2xl text-black leading-relaxed">OOTDify</h1>
          <p className="text-black text-xs mt-2 leading-relaxed">
            &gt; WELCOME BACK_
          </p>
        </div>

        {/* Form box */}
        <div className="pixel-box bg-green-950 p-6">

          {error && (
            <div className="border-2 border-red-500 bg-red-950 p-3 mb-4">
              <p className="text-red-400 text-xs leading-relaxed">
                !! {error}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">

            <div>
              <label className="text-pink-400 text-xs mb-2 block">
                &gt; EMAIL
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pixel-input w-full bg-black text-pink-400 px-3 py-3 text-xs placeholder-green-900"
              />
            </div>

            <div>
              <label className="text-pink-400 text-xs mb-2 block">
                &gt; PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pixel-input w-full bg-black text-pink-400 px-3 py-3 text-xs placeholder-green-900"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="pixel-btn bg-pink-500 text-black text-xs py-4 mt-2 border-2 border-black disabled:opacity-50 w-full"
            >
              {loading ? '> LOADING...' : '> LOGIN [ ENTER ]'}
            </button>

          </div>

          <div className="border-t-2 border-green-800 mt-6 pt-4">
            <p className="text-green-700 text-xs text-center leading-relaxed">
              NO ACCOUNT?{' '}
              <a href="/signup" className="text-pink-400 hover:text-pink-300">
                [ SIGN UP ]
              </a>
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="text-green-900 text-xs text-center mt-4">
          © OOTDIFY v1.0
        </p>

      </div>
    </div>
  )
}