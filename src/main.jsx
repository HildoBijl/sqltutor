import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { SQLJSProvider, ThemeProvider } from 'components'
import { router } from 'routing'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SQLJSProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </SQLJSProvider>
  </StrictMode>,
)
