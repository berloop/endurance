"use client"

import { CursorProvider } from "react-cursor-custom"

const CursorWrapper = ({ children }) => {
  return (
    <CursorProvider color="#efeded" ringSize={20} transitionTime={100}>
      {children}
    </CursorProvider>
  )
}

export default CursorWrapper

// Alternative color: '#eab308' // text-yellow-500 color