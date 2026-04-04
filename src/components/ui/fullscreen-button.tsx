"use client"

import { IconButton, IconButtonProps } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs"


interface FullscreenButtonProps extends IconButtonProps { }

export const FullscreenButton = (props: FullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync state with actual document status (handles Escape key exit)
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleChange)
    return () => document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
    }
  }

  return (
    <IconButton
      onClick={toggleFullscreen}
      variant="outline"
      aria-label="Toggle Fullscreen"
      size="sm"
      // rounded="full"
      {...props}
    >
      {isFullscreen ? <BsFullscreen /> : <BsFullscreenExit />}
    </IconButton>
  )
}
