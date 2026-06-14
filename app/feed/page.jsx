'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles(username, avatar_url)`)
        .order('created_at', { ascending: false })

      if (!error) setPosts(data)
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pink-400 text-xs animate-pulse">
          &gt; LOADING FITS...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-pink-400 text-lg">&gt; THE FEED</h1>
          <p className="text-green-700 text-xs mt-2">
            {posts.length} FITS POSTED
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="pixel-box bg-green-950 p-8 text-center">
            <p className="text-green-600 text-xs leading-relaxed">
              NO FITS YET...<br /><br />
              BE THE FIRST TO POST!
            </p>
            
            <a  href="/new-post"
              className="pixel-btn inline-block mt-6 bg-pink-500 text-black text-xs px-4 py-3 border-2 border-black"
            >
              + POST YOUR FIT
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {posts.map((post) => (
              
                <a  key={post.id}
                href={`/post/${post.id}`}
                className="pixel-box bg-green-950 overflow-hidden hover:border-pink-400 transition-colors group"
              >
                <div className="relative">
                  <img
                    src={post.image_url}
                    alt={post.caption || 'outfit post'}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <p className="text-white text-xs opacity-0 group-hover:opacity-100">
                      [ VIEW FIT ]
                    </p>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-pink-400 text-xs truncate">
                    @{post.profiles?.username}
                  </p>
                  {post.caption && (
                    <p className="text-green-700 text-xs mt-1 truncate">
                      {post.caption}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}