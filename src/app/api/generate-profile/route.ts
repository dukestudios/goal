import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'API token not configured' },
      { status: 500 }
    )
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      )
    }

    // Create prediction using the exact working parameters
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "f1ca369da43885a347690a98f6b710afbf5f167cb9bf13bd5af512ba4a9f7b63",
        input: {
          image: imageUrl,
          prompt: "A portrait of Santa Claus with red hat, kind eyes, Christmas theme, professional studio lighting, cinematic, canond 5d 55mm, red background with bokeh of lights",
          scheduler: "EulerDiscreteScheduler",
          enable_lcm: false,
          num_outputs: 1,
          sdxl_weights: "protovision-xl-high-fidel",
          output_format: "webp",
          width: 1080,  // Set width to 1080px
          height: 1920, // Set height to 1920px
          pose_strength: 0.8,
          canny_strength: 0.3,
          depth_strength: 0.5,
          guidance_scale: 7.5,
          output_quality: 95,   // Increased for higher quality
          negative_prompt: "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
          ip_adapter_scale: 0.8,
          lcm_guidance_scale: 1.5,
          num_inference_steps: 40,
          enable_pose_controlnet: true,
          enhance_nonface_region: true,
          enable_canny_controlnet: false,
          enable_depth_controlnet: false,
          lcm_num_inference_steps: 5,
          face_detection_input_width: 1080,  // Match output width
          face_detection_input_height: 1920,  // Match output height
          controlnet_conditioning_scale: 0.8
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