'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SavedPosts({ userId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      // First get all save records for this user
      const { data: saveData, error: saveError } = await supabase
        .from('saves')
        .select('post_id')
        .eq('user_id', userId)

      if (saveError || !saveData || saveData.length === 0) {
        setLoading(false)
        return
      }

      // Then fetch the actual posts
      const postIds = saveData.map((s) => s.post_id)

      const { data: postData } = await supabase
        .from('posts')
        .select(`*, profiles(username)`)
        .in('id', postIds)
        .order('created_at', { ascending: false })

      setPosts(postData || [])
      setLoading(false)
    }

    fetchSaved()
  }, [userId])

  if (loading) {
    return (
      <p className="text-pink-400 text-xs animate-pulse text-center">
        &gt; LOADING SAVED...
      </p>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="pixel-box bg-green-950 p-8 text-center">
        <p className="text-green-700 text-xs leading-relaxed">
          NO SAVED FITS YET...<br /><br />
          HEART POSTS YOU LOVE!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {posts.map((post) => (
        
        <a  key={post.id}
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
          <div className="p-2">
            <p className="text-pink-400 text-xs truncate">
              @{post.profiles?.username}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}