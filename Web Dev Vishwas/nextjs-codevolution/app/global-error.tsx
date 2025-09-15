'use client'

import React from 'react'

// as this completely replace the root layout, so html and body tag are required

const GlobalError = () => {
  return (
    <html>
      <body>
        <div>
          <h2>Global Error</h2>
          <button onClick={() => window.location.reload()}>reload</button>
        </div>
      </body>
    </html>
  )
}

export default GlobalError
