import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'API token not configured' },
      { status: 500 }
    )
  }

  try {
    const { name } = await req.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'No name provided' },
        { status: 400 }
      )
    }

    // Create prediction using Flux model with the exact working parameters
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00",
        input: {
          prompt: `Christmas themed art with snow text "${name}", 3D, Disney style, festive, joyful, holiday spirit, red and green colors, snow, ornaments, highly detailed`,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "9:16",  // For mobile-friendly vertical format
          output_format: "webp",
          output_quality: 80
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Prediction creation failed:", error)
      throw new Error(error.detail || 'Failed to create prediction')
    }

    const prediction = await response.json()
    console.log("Prediction created:", prediction)

    let result = prediction
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      )
      result = await pollResponse.json()
      console.log("Polling status:", result.status)
    }

    if (result.status === "failed") {
      throw new Error(result.error || 'Prediction failed')
    }

    return NextResponse.json({ success: true, output: result.output })
  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image'
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 