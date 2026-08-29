import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.scss'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/noises_audio-hosting">
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
