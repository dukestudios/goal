'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ContentType {
  title: string
  welcome: string
}

interface ContentMapType {
  [key: string]: ContentType
}

interface Video {
  id: number
  url: string
  title: string
  description: string
}

interface UploadedImage {
  id: number
  originalUrl: string
  generatedUrl?: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

interface NameImage {
  id: number;
  name: string;
  status: 'generating' | 'completed' | 'error';
  imageUrl?: string;
  error?: string;
}

export default function LanguageDashboard() {
  const params = useParams()
  const router = useRouter()
  const language = params.language as string
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState<Video[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameImages, setNameImages] = useState<NameImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Duplicating the video 4 times to fill the row
    const languageVideos = [
      {
        id: 1,
        url: `/english/videos/video1.mp4`,
        title: "Christmas Message",
        description: "Share the message of hope"
      },
      {
        id: 2,
        url: `/english/videos/video1.mp4`,
        title: "Christmas Message",
        description: "Share the message of hope"
      },
      {
        id: 3,
        url: `/english/videos/video1.mp4`,
        title: "Christmas Message",
        description: "Share the message of hope"
      },
      {
        id: 4,
        url: `/english/videos/video1.mp4`,
        title: "Christmas Message",
        description: "Share the message of hope"
      }
    ]
    setVideos(languageVideos)
  }, [language])

  const contentMap: ContentMapType = {
    telugu: {
      title: 'తెలుగు',
      welcome: ''
    },
    hindi: {
      title: 'हिंदी',
      welcome: ''
    },
    english: {
      title: 'Content',
      welcome: ''
    }
  }

  const content = contentMap[language] || contentMap.english

  const handleLogout = () => {
    localStorage.removeItem('selectedLanguage')
    router.push('/')
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      // Create a temporary canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Create a new image object
      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'  // Enable cross-origin image loading
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      if (ctx) {
        // Draw the original image
        ctx.drawImage(img, 0, 0)

        // Add watermark text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'  // Semi-transparent background
        ctx.fillRect(canvas.width - 200, canvas.height - 40, 190, 30)
        
        ctx.font = '16px Arial'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText('www.truly.co.in', canvas.width - 20, canvas.height - 25)

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => 
          canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95)
        )

        // Create download link
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'christmas-image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image')
    }
  }

  const handleShare = async (videoUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Christmas Message',
          text: 'Share this Christmas message',
          url: window.location.origin + videoUrl
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(window.location.origin + videoUrl)
      alert('Link copied to clipboard!')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setIsUploading(true)
    const imageId = Date.now()

    try {
      // Create temporary URL for preview
      const imageUrl = URL.createObjectURL(file)
      
      setUploadedImages(prev => [...prev, {
        id: imageId,
        originalUrl: imageUrl,
        status: 'processing'
      }])

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Call API endpoint
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64Image })
      })

      const data = await response.json()

      if (data.success && data.output) {
        setUploadedImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, generatedUrl: data.output[0], status: 'completed' }
            : img
        ))
      } else {
        throw new Error(data.error || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setUploadedImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to generate image'
            }
          : img
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) return

    setIsGenerating(true)
    const generationId = Date.now()

    setNameImages(prev => [...prev, {
      id: generationId,
      name: nameInput,
      status: 'generating'
    }])

    try {
      const response = await fetch('/api/generate-name-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput })
      })

      const data = await response.json()

      if (data.success && data.output) {
        setNameImages(prev => prev.map(img => 
          img.id === generationId 
            ? { ...img, imageUrl: data.output[0], status: 'completed' }
            : img
        ))
      } else {
        throw new Error(data.error || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Error:', error)
      setNameImages(prev => prev.map(img => 
        img.id === generationId 
          ? { 
              ...img, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to generate image'
            }
          : img
      ))
    } finally {
      setIsGenerating(false)
      setNameInput('')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800/50 rounded-xl overflow-hidden group hover:ring-2 hover:ring-red-500/50 transition-all">
                <div className="aspect-[9/16] bg-gray-700/50 relative group-hover:scale-105 transition-transform duration-500">
                  <video 
                    className="absolute inset-0 w-full h-full object-cover"
                    src={video.url}
                    controls
                    preload="metadata"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-gray-200 font-medium">{video.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{video.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button 
                      onClick={() => handleDownload(video.url)}
                      className="flex-1 bg-red-900/50 text-gray-300 py-2 rounded-lg text-sm hover:bg-red-800/50 transition-colors"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleShare(video.url)}
                      className="flex-1 bg-red-900/50 text-gray-300 py-2 rounded-lg text-sm hover:bg-red-800/50 transition-colors"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Upload section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-gray-200 font-medium mb-4">Create Christmas Profile Picture</h3>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-red-700 border-dashed rounded-lg cursor-pointer hover:border-red-500/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Max file size: 5MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Generated images grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploadedImages.map((image) => (
                <div key={image.id} className="group relative aspect-square bg-gray-800/50 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500/50 transition-all">
                  {image.status === 'processing' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 p-4">
                      <div className="w-full max-w-[80%] space-y-2">
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                          <span>Processing...</span>
                          <span>50%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
                            style={{ width: '50%' }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Applying Christmas effects...
                        </p>
                      </div>
                    </div>
                  ) : image.status === 'error' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 p-4">
                      <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-xs text-red-400 text-center">{image.error}</p>
                      <button 
                        onClick={() => setUploadedImages(prev => prev.filter(img => img.id !== image.id))}
                        className="mt-2 text-xs text-gray-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : image.generatedUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={image.generatedUrl} 
                        alt="Generated profile" 
                        className="w-full h-full object-cover"
                      />
                      {/* Watermark Overlay */}
                      <div className="absolute bottom-4 right-4 text-white text-sm font-light opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                        www.truly.co.in
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(image.generatedUrl!)}
                          className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg text-sm"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )
      case 'nameArt':
        return (
          <div className="space-y-8">
            {/* Name input form */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-gray-200 font-medium mb-4">Create Christmas Greetings</h3>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-400 mb-2">
                    Enter Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-3 bg-red-900/50 border border-red-700 rounded-xl 
                              text-white focus:outline-none focus:border-red-500 focus:ring-2 
                              focus:ring-red-500/20 transition-all"
                    placeholder="Enter a name for the artwork"
                    disabled={isGenerating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGenerating || !nameInput.trim()}
                  className="w-full bg-red-500/20 text-red-400 py-3 rounded-xl
                           hover:bg-red-500/30 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Art'}
                </button>
              </form>
            </div>

            {/* Generated images grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nameImages.map((image) => (
                <div key={image.id} className="bg-gray-800/50 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h4 className="text-gray-200">{image.name}</h4>
                  </div>
                  <div className="aspect-[9/16] relative">
                    {image.status === 'generating' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      </div>
                    ) : image.status === 'error' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 p-4">
                        <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs text-red-400 text-center">{image.error}</p>
                      </div>
                    ) : image.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={image.imageUrl} 
                          alt={`Art for ${image.name}`} 
                          className="w-full h-full object-cover"
                        />
                        {/* Watermark Overlay */}
                        <div className="absolute bottom-4 right-4 text-white text-sm font-light opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                          www.truly.co.in
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {image.status === 'completed' && (
                    <div className="p-4 bg-gray-900/30">
                      <button 
                        onClick={() => handleDownload(image.imageUrl!)}
                        className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg 
                                 hover:bg-red-500/30 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/truly.svg"
                alt="Truly Logo"
                width={150}
                height={60}
                className="h-12 w-auto"
              />
            </div>

            {/* Menu Items */}
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {[
            { id: 'videos', label: 'Videos' },
            { id: 'profile', label: 'Profile Pictures' },
            { id: 'nameArt', label: 'Greetings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl transition-all font-medium
                ${activeTab === tab.id 
                  ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' 
                  : 'bg-red-900/50 text-gray-300 hover:bg-red-800/50 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-red-900/30 border border-red-800/30 rounded-2xl p-6 backdrop-blur-sm">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-4">
              <Image
                src="/truly.svg"
                alt="Truly Logo"
                width={100}
                height={40}
                className="h-8 w-auto"
              />
              <span className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Truly. All rights reserved.
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a 
                href="#privacy" 
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#terms" 
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="#contact" 
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
} 