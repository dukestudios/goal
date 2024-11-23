'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';

export default function Home() {
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [isHovering1, setIsHovering1] = useState(false)
  const [isHovering2, setIsHovering2] = useState(false)

  const validateIndianMobile = (number: string) => {
    // Remove any spaces or special characters
    const cleanNumber = number.replace(/[^\d]/g, '')
    
    // Check if it's exactly 10 digits and starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9']
    if (cleanNumber.length === 10 && validPrefixes.includes(cleanNumber[0])) {
      return true
    }
    return false
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers, spaces, and plus sign
    const sanitizedValue = value.replace(/[^\d\s+]/g, '')
    setMobileNumber(sanitizedValue)
    
    // Clear error when user starts typing again
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateIndianMobile(mobileNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      return
    }
    
    router.push('/select-language')
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden animated-gradient">
      {/* Animated gradient backgrounds - z-index 0 */}
      <div className="gradient-1"></div>
      <div className="gradient-2"></div>
      <div className="gradient-3"></div>
      
      {/* Overlay - z-index 10 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-transparent to-red-950/50 z-10"></div>

      {/* Snow Effect - z-index 30 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❄</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❄</div>
        <div className="snowflake">❅</div>
        <div className="snowflake">❆</div>
        <div className="snowflake">❄</div>
      </div>

      {/* Content - z-index 20 */}
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-20 p-4 md:p-8">
        {/* Right side - Example Images - Now on the left */}
        <div className="w-full lg:flex-1 order-1 lg:order-1 relative h-auto flex items-center justify-center">
          <div className="flex justify-center items-center gap-8 md:gap-12 lg:gap-16">
            {/* First image - positioned higher */}
            <div 
              className="bg-gradient-to-br from-red-950/50 to-red-900/50 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden 
                        w-28 md:w-40 lg:w-56
                        transform translate-x-8 md:translate-x-12 lg:translate-x-16 -translate-y-8 md:-translate-y-12 lg:-translate-y-16
                        hover:scale-105 hover:-translate-y-12 md:hover:-translate-y-16 lg:hover:-translate-y-20 
                        transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10 z-10
                        border border-red-800/20"
              onMouseEnter={() => setIsHovering1(true)}
              onMouseLeave={() => setIsHovering1(false)}
            >
              <div className="aspect-[9/16]">
                <Image 
                  src={isHovering1 ? "/placeholder2hover.jpg" : "/placeholder2.jpg"}
                  alt="Login Example 2"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  width={500}
                  height={300}
                />
              </div>
            </div>
            {/* Second image */}
            <div 
              className="bg-gradient-to-br from-red-950/50 to-red-900/50 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden 
                        w-28 md:w-40 lg:w-56
                        transform -translate-x-8 md:-translate-x-12 lg:-translate-x-16
                        hover:scale-105 hover:-translate-y-4 md:hover:-translate-y-6 lg:hover:-translate-y-8 
                        transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10
                        border border-red-800/20"
              onMouseEnter={() => setIsHovering2(true)}
              onMouseLeave={() => setIsHovering2(false)}
            >
              <div className="aspect-[9/16]">
                <Image 
                  src={isHovering2 ? "/placeholder3hover.jpg" : "/placeholder3.jpg"}
                  alt="Login Example 3"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  width={500}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left side - Login Form - Now on the right */}
        <div className="w-full lg:flex-1 order-2 lg:order-2">
          <div className="space-y-2 mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin tracking-[6px] text-white text-center lg:text-left leading-none uppercase">
              Let's Share
            </h1>
            <div className="space-y-1">
              <p className="text-2xl md:text-3xl lg:text-4xl font-thin tracking-[4px] text-center lg:text-left uppercase">
                <span className="text-white">THE</span>
                <span className="text-red-500 ml-2 animated-text glowing-text">GOSPEL</span>
              </p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-thin tracking-[4px] text-center lg:text-left">
                <span className="text-white uppercase">THIS</span>
                <span className="text-red-500 ml-2 uppercase animated-text glowing-text">CHRISTMAS</span>
                <span className="text-white ml-2 font-allura text-5xl md:text-6xl lg:text-7xl hover:scale-110 transition-transform duration-300 -mt-2">
                  Season
                </span>
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 -mt-4">
            <div className="bg-gradient-to-br from-red-950/50 to-red-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-red-800/20 p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-red-200 text-sm">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    className="w-full p-3 bg-gradient-to-br from-red-900/50 to-red-800/50 border border-red-800/50 rounded-xl 
                              text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                              transition-all duration-300 placeholder-red-200/50
                              text-lg tracking-wide
                              shadow-inner shadow-red-950/50"
                    placeholder="Enter 10-digit mobile number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    style={{
                      caretColor: 'white',  // Makes the cursor white
                      textShadow: '0 0 1px rgba(255,255,255,0.1)'  // Subtle text shadow for better readability
                    }}
                    required
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-1 animate-fade-in">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 rounded-xl
                           hover:from-red-600 hover:to-orange-600 transition-all duration-300
                           font-medium text-center border border-red-400
                           shadow-lg hover:shadow-red-500/30"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
