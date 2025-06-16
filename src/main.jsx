import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { LocalStorageManager, SQLJSProvider, ThemeProvider } from 'components'
import { SkillDatabaseProvider } from 'eduComponents'
import { router } from 'routing'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocalStorageManager>
      <SQLJSProvider>
        <SkillDatabaseProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </SkillDatabaseProvider>
      </SQLJSProvider>
    </LocalStorageManager>
  </StrictMode>,
)
