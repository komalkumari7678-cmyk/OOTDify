'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        if (profile) setUsername(profile.username)
      }
    }

    getUser()

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Change navbar style on scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-2 border-pink-500
        ${scrolled
          ? 'bg-black/90 backdrop-blur-sm shadow-[0_4px_0px_#ec4899]'
          : 'bg-transparent backdrop-blur-sm'
        }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}

        <a href="/feed"
          className="text-pink-400 text-sm hover:text-pink-300 transition-colors pixel-btn px-3 py-2 border-2 border-pink-500 bg-black/50"
        >
          OOTD<span className="text-green-400">ify</span>
        </a>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">

            {/* Username */}
            
            <a href={`/u/${username}`}
              className="text-green-400 text-xs hover:text-green-300 hidden sm:block"
            >
              &gt; {username}
            </a>

            {/* Post button */}
            
            <a href="/new-post"
              className="pixel-btn bg-pink-500 text-black text-xs px-3 py-2 border-2 border-black hover:bg-pink-400"
            >
              + POST
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="pixel-btn bg-black text-pink-400 text-xs px-3 py-2 border-2 border-pink-500 hover:bg-pink-950"
            >
              [ EXIT ]
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-3">
            
            <a href="/login"
              className="text-pink-400 text-xs hover:text-pink-300 border-2 border-pink-800 px-3 py-2 hover:border-pink-500 transition-colors"
            >
              [ LOGIN ]
            </a>
            
            <a href="/signup"
              className="pixel-btn bg-pink-500 text-black text-xs px-3 py-2 border-2 border-black"
            >
              [ SIGN UP ]
            </a>
          </div>
        )}

      </div>

      {/* Pixel scanline effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />

    </nav>
  )
}