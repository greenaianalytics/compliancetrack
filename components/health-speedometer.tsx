'use client'

import { useEffect, useState } from 'react'

interface HealthProgressRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
}

export default function HealthProgressRing({ 
  score, 
  size = 'md', 
  showLabel = true,
  animate = true
}: HealthProgressRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  const clampedScore = Math.max(0, Math.min(100, score))
  
  useEffect(() => {
    if (!animate) {
      setAnimatedScore(clampedScore)
      return
    }
    
    const duration = 1000
    const steps = 60
    const increment = clampedScore / steps
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      const newScore = Math.min(increment * currentStep, clampedScore)
      setAnimatedScore(newScore)
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [clampedScore, animate])

  const sizeConfig = {
    sm: { width: 100, strokeWidth: 6, fontSize: 'lg' },
    md: { width: 140, strokeWidth: 8, fontSize: 'xl' },
    lg: { width: 180, strokeWidth: 10, fontSize: '2xl' }
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return '#10B981' // Green
    if (score >= 60) return '#84CC16' // Lime
    if (score >= 40) return '#F59E0B' // Amber
    if (score >= 20) return '#F97316' // Orange
    return '#EF4444' // Red
  }

  const getStatus = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    if (score >= 20) return 'Needs Attention'
    return 'Critical'
  }

  const currentColor = getColor(animatedScore)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={config.width} height={config.width} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={currentColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${
            size === 'lg' ? 'text-3xl' : 
            size === 'md' ? 'text-2xl' : 
            'text-xl'
          } text-gray-900 transition-all duration-300`}>
            {Math.round(animatedScore)}%
          </div>
          {showLabel && (
            <div className={`${
              size === 'lg' ? 'text-sm' : 
              size === 'md' ? 'text-xs' : 
              'text-xs'
            } text-gray-500 mt-1 transition-all duration-300`}>
              Completed
            </div>
          )}
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-3 flex items-center justify-center space-x-2 transition-all duration-300">
        <div 
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm font-medium text-gray-700">
          {getStatus(animatedScore)}
        </span>
      </div>
    </div>
  )
}