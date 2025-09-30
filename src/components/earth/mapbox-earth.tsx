/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '../ui/slider'
import { SliderRange, SliderThumb, SliderTrack } from '@radix-ui/react-slider'
import { Button } from '../ui/button'
import { Play, Pause, CircleDot } from 'lucide-react'
import MusicControls from '../endurance/music-control-earth';

// Get token from environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

if (!MAPBOX_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not defined. Add it to your .env.local file')
}

mapboxgl.accessToken = MAPBOX_TOKEN

const MapboxEarth = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [uiVisible, setUiVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const uiSoundRef = useRef<HTMLAudioElement>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [mapState, setMapState] = useState({
    zoom: 1.5,
    rotationSpeed: 2,
    animating: true,
  })

  const [fogSettings, setFogSettings] = useState({
    range: [0.5, 13.0] as [number, number],
    color: '#8bb5d5',
    horizonBlend: 0.11,
  })

  const playUISound = useCallback(() => {
    if (soundEnabled && uiSoundRef.current) {
      uiSoundRef.current.currentTime = 0
      uiSoundRef.current.volume = 0.3
      uiSoundRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  const addStarfield = useCallback(() => {
    if (!mapContainer.current) return

    // Create canvas for stars behind the map
    const starsCanvas = document.createElement('canvas')
    starsCanvas.style.position = 'absolute'
    starsCanvas.style.top = '0'
    starsCanvas.style.left = '0'
    starsCanvas.style.width = '100%'
    starsCanvas.style.height = '100%'
    starsCanvas.style.pointerEvents = 'none'
    starsCanvas.style.zIndex = '0'
    
    mapContainer.current.style.position = 'relative'
    mapContainer.current.insertBefore(starsCanvas, mapContainer.current.firstChild)

    const ctx = starsCanvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      starsCanvas.width = window.innerWidth
      starsCanvas.height = window.innerHeight
      drawStars()
    }

    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number; phase: number }[] = []
    
    for (let i = 0; i < 1000; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        opacity: Math.random(),
       twinkleSpeed: 1.5 + Math.random() * 3.5,
        phase: Math.random() * Math.PI * 2,
      })
    }

    const drawStars = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, starsCanvas.width, starsCanvas.height)

      const time = Date.now() * 0.001

      stars.forEach(star => {
       const twinkle = (Math.sin(time * star.twinkleSpeed + star.phase) + 1) * 0.7
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(drawStars)
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      starsCanvas.remove()
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/egretfx/cmg6mmfj0007x01sch89v1gdv', // No labels
      projection: { name: 'globe' },
      zoom: mapState.zoom,
      center: [30, 15],
      pitch: 0,
      bearing: 0,
    })

    // Enable mouse interaction
    map.current.dragPan.enable()
    map.current.dragRotate.enable()
    map.current.scrollZoom.enable()
    map.current.doubleClickZoom.enable()
    map.current.touchZoomRotate.enable()

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Set fog/atmosphere
    map.current.on('style.load', () => {
      map.current?.setFog({
        range: fogSettings.range,
        color: fogSettings.color,
        'horizon-blend': fogSettings.horizonBlend,
      })

      // Add twinkling stars
      addStarfield()
    })

    // Auto-rotation
    let userInteracting = false

    const spinGlobe = () => {
      if (!map.current || userInteracting || !mapState.animating) return

      const currentCenter = map.current.getCenter()
      currentCenter.lng -= mapState.rotationSpeed * 0.1

      map.current.easeTo({
        center: currentCenter,
        duration: 1000,
        easing: (t) => t,
      })
    }

    rotationIntervalRef.current = setInterval(spinGlobe, 1000)

    // Pause rotation on user interaction
    map.current.on('mousedown', () => {
      userInteracting = true
    })
    map.current.on('touchstart', () => {
      userInteracting = true
    })
    map.current.on('mouseup', () => {
      setTimeout(() => {
        userInteracting = false
      }, 3000) // Resume after 3 seconds
    })
    map.current.on('touchend', () => {
      setTimeout(() => {
        userInteracting = false
      }, 3000)
    })

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current)
      }
      map.current?.remove()
    }
  }, [])

  // Update map settings when state changes
  useEffect(() => {
    if (!map.current) return

    map.current.setZoom(mapState.zoom)
  }, [mapState.zoom])

  // Update rotation when animation state changes
  useEffect(() => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current)
    }

    if (mapState.animating) {
      const spinGlobe = () => {
        if (!map.current) return

        const currentCenter = map.current.getCenter()
        currentCenter.lng -= mapState.rotationSpeed * 0.1

        map.current.easeTo({
          center: currentCenter,
          duration: 1000,
          easing: (t) => t,
        })
      }

      rotationIntervalRef.current = setInterval(spinGlobe, 1000)
    }

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current)
      }
    }
  }, [mapState.animating, mapState.rotationSpeed])

  useEffect(() => {
    if (!map.current) return

    // Wait for style to load before setting fog
    if (map.current.isStyleLoaded()) {
      map.current.setFog({
        range: fogSettings.range,
        color: fogSettings.color,
        'horizon-blend': fogSettings.horizonBlend,
      })
    } else {
      map.current.once('style.load', () => {
        map.current?.setFog({
          range: fogSettings.range,
          color: fogSettings.color,
          'horizon-blend': fogSettings.horizonBlend,
        })
      })
    }
  }, [fogSettings])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'h' || event.key === 'H') {
        playUISound()
        setUiVisible(!uiVisible)
      }
      if (event.key === 'f' || event.key === 'F') {
        playUISound()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [uiVisible, toggleFullscreen, playUISound])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

    
      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              duration: 0.15,
            }}
            className="hidden md:block absolute top-4 left-4 bg-neutral-950/20 backdrop-blur-sm rounded-sm p-4 text-white max-w-xs"
          >
            <h3 className="text-lg font-semibold mb-3">Planet Earth</h3>

            <div className="space-y-6">
           

              <div>
                <label className="block text-sm mb-2 flex justify-between">
                  <span>Horizon</span>
                  <span className="font-mono">
                    {fogSettings.horizonBlend.toFixed(2)}
                  </span>
                </label>
                <Slider
                  value={[fogSettings.horizonBlend]}
                  onValueChange={(value) =>
                    setFogSettings((prev) => ({
                      ...prev,
                      horizonBlend: value[0],
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.01}
                >
                  <SliderTrack>
                    <SliderRange />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </div>
              <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Spin:</span>
    <span className="font-mono">
      {mapState.rotationSpeed.toFixed(1)}
    </span>
  </label>
  <Slider
    value={[mapState.rotationSpeed]}
    onValueChange={(value) =>
      setMapState((prev) => ({ ...prev, rotationSpeed: value[0] }))
    }
    min={0}
    max={5.0}
    step={0.1}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

            </div>
          </motion.div>
        )}
      </AnimatePresence> 

      {/* Music Controls */}
<AnimatePresence>
  {uiVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        duration: 0.15 
      }}
      className="absolute bottom-14 right-4 hidden md:block"
    >
      <MusicControls />
    </motion.div>
  )}
</AnimatePresence>

   
    <div className="md:block hidden absolute bottom-9 left-4 text-white text-xs opacity-50 pointer-events-none">
        Press &apos;H&apos; to {uiVisible ? 'hide' : 'show'} UI | Press &apos;F&apos; for
        fullscreen
      </div> 

      {/* UI Sound Effect */}
      <audio ref={uiSoundRef} preload="auto">
        <source src="/sounds/ui-click.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}

export default MapboxEarth