import './index.scss'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App.tsx'
import { SSRDataProvider, type SSRData } from '@/contexts/SSRDataContext.tsx'

const ssrData: SSRData = window.__SSR_DATA__ ?? { albums: [], friends: [] }

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <SSRDataProvider value={ssrData}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SSRDataProvider>
  </StrictMode>,
)
