import { StoreProvider } from './demo/store.tsx'
import { Shell } from './shell/Shell.tsx'

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
