import Replicate from 'replicate'
import { NextResponse } from 'next/server'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request) {
  try {
    const { humanImage, garmentImage } = await request.json()

    if (!humanImage || !garmentImage) {
      return NextResponse.json(
        { error: 'Both human and garment images are required' },
        { status: 400 }
      )
    }

    const output = await replicate.run(
      "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
      {
        input: {
          human_img: humanImage,
          garm_img: garmentImage,
          garment_des: "clothing item",
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        }
      }
    )

    return NextResponse.json({ output })

  } catch (error) {
    console.error('Try-on error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}