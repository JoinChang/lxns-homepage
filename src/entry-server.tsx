import { StrictMode } from 'react'
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from '@/App.tsx'
import { SSRDataProvider, type SSRData } from '@/contexts/SSRDataContext.tsx'

export function render(
  url: string,
  ssrData: SSRData,
  options?: RenderToPipeableStreamOptions,
) {
  return renderToPipeableStream(
    <StrictMode>
      <SSRDataProvider value={ssrData}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SSRDataProvider>
      <vite-streaming-end></vite-streaming-end>
    </StrictMode>,
    options,
  )
}
