'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LikeSaveButtons({ postId }) {
  const [userId, setUserId] = useState(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // Get like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      setLikeCount(count || 0)

      // Check if current user liked/saved
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        const { data: saveData } = await supabase
          .from('saves')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        if (likeData) setLiked(true)
        if (saveData) setSaved(true)
      }
    }

    init()
  }, [postId])

  const handleLike = async () => {
    if (!userId) return
    setLoading(true)

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      setLikeCount((c) => c - 1)
      setLiked(false)
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId })

      setLikeCount((c) => c + 1)
      setLiked(true)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)

    if (saved) {
      await supabase
        .from('saves')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      setSaved(false)
    } else {
      await supabase
        .from('saves')
        .insert({ post_id: postId, user_id: userId })

      setSaved(true)
    }

    setLoading(false)
  }

  return (
    <div className="flex gap-3 mt-4">

      {/* Like button */}
      <button
        onClick={handleLike}
        disabled={loading || !userId}
        className={`pixel-btn flex-1 text-xs py-3 border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2
          ${liked
            ? 'bg-pink-500 text-black'
            : 'bg-black text-pink-400 border-pink-800'
          }`}
      >
        {liked ? '♥' : '♡'} {likeCount > 0 ? likeCount : ''} {liked ? 'LIKED' : 'LIKE'}
      </button>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading || !userId}
        className={`pixel-btn flex-1 text-xs py-3 border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2
          ${saved
            ? 'bg-green-500 text-black'
            : 'bg-black text-green-400 border-green-800'
          }`}
      >
        {saved ? '★ SAVED' : '☆ SAVE'}
      </button>

    </div>
  )
}