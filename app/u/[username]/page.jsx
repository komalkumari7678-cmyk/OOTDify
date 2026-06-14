'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('fits')

  useEffect(() => {
    const fetchProfile = async () => {
      // Get profile by username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Get their posts
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })

      setPosts(postData || [])

      // Check if this is the logged in user
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === profileData.id) setIsOwner(true)

      setLoading(false)
    }

    fetchProfile()
  }, [username])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pink-400 text-xs animate-pulse">
          &gt; LOADING PROFILE...
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-box bg-green-950 p-8 text-center">
          <p className="text-red-400 text-xs">!! USER NOT FOUND</p>
          <a href="/feed" className="text-pink-400 text-xs mt-4 block">
            [ BACK TO FEED ]
          </a>
        </div>
      </div>
    )
  }

  // Stats
  const totalTags = posts.reduce((acc) => acc + 1, 0)
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <div className="mb-4">
          <a href="/feed" className="text-green-700 text-xs hover:text-green-500">
            &lt; BACK TO FEED
          </a>
        </div>

        {/* Profile card */}
        <div className="pixel-box bg-green-950 p-6 mb-6">

          {/* Top row — avatar + info */}
          <div className="flex items-start gap-4 mb-6">

            {/* Avatar — first letter of username */}
            <div className="pixel-box bg-pink-500 w-16 h-16 flex items-center justify-center flex-shrink-0">
              <span className="text-black text-2xl font-bold">
                {profile.username?.[0]?.toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-pink-400 text-sm">
                  @{profile.username}
                </h1>
                {isOwner && (
                  <span className="text-xs bg-green-900 text-green-400 border border-green-700 px-2 py-0 leading-5">
                    YOU
                  </span>
                )}
              </div>

              {profile.full_name && (
                <p className="text-white text-xs mt-1">{profile.full_name}</p>
              )}

              {profile.bio && (
                <p className="text-green-500 text-xs mt-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <p className="text-green-900 text-xs mt-2">
                JOINED {joinDate.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="border-2 border-green-900 p-3 text-center">
              <p className="text-pink-400 text-lg font-bold">{posts.length}</p>
              <p className="text-green-700 text-xs mt-1">FITS</p>
            </div>
            <div className="border-2 border-green-900 p-3 text-center">
              <p className="text-pink-400 text-lg font-bold">{totalTags}</p>
              <p className="text-green-700 text-xs mt-1">POSTS</p>
            </div>
            <div className="border-2 border-green-900 p-3 text-center">
              <p className="text-pink-400 text-lg font-bold">
                {posts.length > 0 ? '🔥' : '—'}
              </p>
              <p className="text-green-700 text-xs mt-1">ACTIVE</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {isOwner ? (
              <>
                
                <a  href="/new-post"
                  className="pixel-btn flex-1 bg-pink-500 text-black text-xs py-3 border-2 border-black text-center"
                >
                  + NEW FIT
                </a>
                <button
                  onClick={handleCopyLink}
                  className="pixel-btn flex-1 bg-black text-pink-400 text-xs py-3 border-2 border-pink-800"
                >
                  {copied ? '✓ COPIED!' : '[ SHARE PROFILE ]'}
                </button>
              </>
            ) : (
              <button
                onClick={handleCopyLink}
                className="pixel-btn flex-1 bg-black text-pink-400 text-xs py-3 border-2 border-pink-800"
              >
                {copied ? '✓ COPIED!' : '[ SHARE PROFILE ]'}
              </button>
            )}
          </div>

        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('fits')}
            className={`pixel-btn text-xs px-4 py-2 border-2 border-black ${
              activeTab === 'fits'
                ? 'bg-pink-500 text-black'
                : 'bg-black text-pink-400 border-pink-800'
            }`}
          >
            [ FITS ]
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pixel-btn text-xs px-4 py-2 border-2 border-black ${
              activeTab === 'about'
                ? 'bg-pink-500 text-black'
                : 'bg-black text-pink-400 border-pink-800'
            }`}
          >
            [ ABOUT ]
          </button>
        </div>

        {/* Fits tab */}
        {activeTab === 'fits' && (
          <>
            {posts.length === 0 ? (
              <div className="pixel-box bg-green-950 p-8 text-center">
                <p className="text-green-700 text-xs leading-relaxed">
                  NO FITS POSTED YET...
                </p>
                {isOwner && (
                  
                <a    href="/new-post"
                    className="pixel-btn inline-block mt-4 bg-pink-500 text-black text-xs px-4 py-3 border-2 border-black"
                  >
                    + POST YOUR FIRST FIT
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {posts.map((post) => (
                  
                <a    key={post.id}
                    href={`/post/${post.id}`}
                    className="pixel-box bg-green-950 overflow-hidden hover:border-pink-400 transition-colors group"
                  >
                    <div className="relative">
                      <img
                        src={post.image_url}
                        alt={post.caption || 'outfit'}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <p className="text-white text-xs opacity-0 group-hover:opacity-100">
                          [ VIEW ]
                        </p>
                      </div>
                    </div>
                    {post.caption && (
                      <div className="p-2">
                        <p className="text-green-700 text-xs truncate">
                          {post.caption}
                        </p>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="pixel-box bg-green-950 p-6">
            <div className="flex flex-col gap-4">

              <div>
                <p className="text-green-600 text-xs mb-1">&gt; USERNAME</p>
                <p className="text-pink-400 text-xs">@{profile.username}</p>
              </div>

              {profile.full_name && (
                <div>
                  <p className="text-green-600 text-xs mb-1">&gt; NAME</p>
                  <p className="text-pink-400 text-xs">{profile.full_name}</p>
                </div>
              )}

              {profile.bio ? (
                <div>
                  <p className="text-green-600 text-xs mb-1">&gt; BIO</p>
                  <p className="text-pink-400 text-xs leading-relaxed">{profile.bio}</p>
                </div>
              ) : (
                <div>
                  <p className="text-green-600 text-xs mb-1">&gt; BIO</p>
                  <p className="text-green-900 text-xs">
                    {isOwner ? 'No bio yet — add one soon!' : 'No bio yet.'}
                  </p>
                </div>
              )}

              <div>
                <p className="text-green-600 text-xs mb-1">&gt; MEMBER SINCE</p>
                <p className="text-pink-400 text-xs">{joinDate.toUpperCase()}</p>
              </div>

              <div>
                <p className="text-green-600 text-xs mb-1">&gt; TOTAL FITS</p>
                <p className="text-pink-400 text-xs">{posts.length} OUTFITS POSTED</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}