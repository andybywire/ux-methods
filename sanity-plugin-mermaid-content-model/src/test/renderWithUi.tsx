import type {ReactElement, ReactNode} from 'react'
import {render, type RenderResult} from '@testing-library/react'
import {LayerProvider, ThemeProvider, ToastProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'

const theme = buildTheme()

/**
 * Render a component inside the @sanity/ui providers it relies on at runtime
 * (theme + layers + toasts), mirroring the Studio provider stack so component
 * tests can exercise Studio-native UI — including popovers/portals — without a
 * full Studio. Shared across the tool's component tests.
 *
 * Lives under src/test/ and is excluded from the dist build (tsconfig.dist.json)
 * — it's test-only and pulls in devDependencies.
 */
export function renderWithUi(ui: ReactElement): RenderResult {
  return render(ui, {
    wrapper: ({children}: {children: ReactNode}) => (
      <ThemeProvider theme={theme}>
        <LayerProvider>
          <ToastProvider>{children}</ToastProvider>
        </LayerProvider>
      </ThemeProvider>
    ),
  })
}
