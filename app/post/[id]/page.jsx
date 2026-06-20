'use client'
import LikeSaveButtons from '@/app/components/LikeSaveButtons'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      // Fetch post + profile
      const { data: postData } = await supabase
        .from('posts')
        .select(`*, profiles(username, avatar_url)`)
        .eq('id', id)
        .single()

      // Fetch tags
      const { data: tagData } = await supabase
        .from('tags')
        .select('*')
        .eq('post_id', id)

      setPost(postData)
      setTags(tagData || [])
      setLoading(false)
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pink-400 text-xs animate-pulse">
          &gt; LOADING FIT...
        </p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-box bg-green-950 p-8 text-center">
          <p className="text-red-400 text-xs">!! POST NOT FOUND</p>
          <a href="/feed" className="text-pink-400 text-xs mt-4 block">
            [ BACK TO FEED ]
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <div className="mb-4">
          <a href="/feed" className="text-green-700 text-xs hover:text-green-500">
            &lt; BACK TO FEED
          </a>
        </div>

        {/* Post header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="pixel-box bg-pink-500 w-8 h-8 flex items-center justify-center">
            <span className="text-black text-xs">
              {post.profiles?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-pink-400 text-xs">
              @{post.profiles?.username}
            </p>
          </div>
        </div>

        {/* Image with tag dots */}
        <div className="pixel-box overflow-hidden mb-4">
          <div
            className="relative"
            onClick={() => setActiveTag(null)}
          >
            <img
              src={post.image_url}
              alt={post.caption || 'outfit'}
              className="w-full object-cover"
            />

            {/* Tag dots */}
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="absolute"
                style={{
                  left: `${tag.x_percent}%`,
                  top: `${tag.y_percent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: activeTag?.id === tag.id ? 30 : 20,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTag(activeTag?.id === tag.id ? null : tag)
                }}
              >
                {/* Pulsing dot */}
                <div className="relative cursor-pointer">
                  <div className="w-5 h-5 bg-pink-500 border-2 border-black animate-pulse" />
                  <div className="absolute inset-0 w-5 h-5 bg-pink-500 opacity-30 scale-150" />
                </div>

                {/* Tag popup */}
                {activeTag?.id === tag.id && (
                  <div
                    className="absolute bg-black border-2 border-pink-500 p-3 z-30"
                    style={{
                      bottom: '24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: '160px',
                    }}
                  >
                    <p className="text-pink-400 text-xs mb-1">
                      {tag.label}
                    </p>
                    {tag.buy_link && (
                      
                    <a    href={tag.buy_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="pixel-btn block mt-2 bg-pink-500 text-black text-xs px-2 py-2 border-2 border-black text-center hover:bg-pink-400"
                      >
                        [ SHOP NOW ]
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveTag(null)
                      }}
                      className="block mt-2 text-green-700 text-xs hover:text-green-500 w-full text-center"
                    >
                      [ CLOSE ]
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="pixel-box bg-green-950 p-4 mb-4">
            <p className="text-green-600 text-xs mb-1">&gt; CAPTION</p>
            <p className="text-pink-400 text-xs leading-relaxed">
              {post.caption}
            </p>
          </div>
        )}
        {/* Like and Save */}
<LikeSaveButtons postId={post.id} />

        {/* Tags list */}
        {tags.length > 0 && (
          <div className="pixel-box bg-green-950 p-4">
            <p className="text-green-600 text-xs mb-3">
              &gt; ITEMS IN THIS FIT ({tags.length})
            </p>
            <div className="flex flex-col gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between border border-green-900 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500" />
                    <span className="text-pink-400 text-xs">{tag.label}</span>
                  </div>
                  {tag.buy_link && (
                    
                    <a href={tag.buy_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 text-xs hover:text-green-400"
                    >
                      [ BUY ]
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}