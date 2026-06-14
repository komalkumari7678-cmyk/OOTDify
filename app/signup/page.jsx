'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    if (!email || !password || !username) {
      setError('Fill in all fields!')
      setLoading(false)
      return
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username,
      })

    if (profileError) {
      setError(profileError.message)
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
            &gt; CREATE ACCOUNT_
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
                &gt; USERNAME
              </label>
              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pixel-input w-full bg-black text-pink-400 px-3 py-3 text-xs placeholder-green-900"
              />
            </div>

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
              onClick={handleSignup}
              disabled={loading}
              className="pixel-btn bg-pink-500 text-black text-xs py-4 mt-2 border-2 border-black disabled:opacity-50 w-full"
            >
              {loading ? '> LOADING...' : '> SIGN UP [ ENTER ]'}
            </button>

          </div>

          <div className="border-t-2 border-green-800 mt-6 pt-4">
            <p className="text-green-700 text-xs text-center leading-relaxed">
              HAVE AN ACCOUNT?{' '}
              <a href="/login" className="text-pink-400 hover:text-pink-300">
                [ LOGIN ]
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