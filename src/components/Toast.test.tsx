import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AppToaster } from './Toast'

describe('AppToaster', () => {
  it('renders an accessible global notification region', () => {
    const markup = renderToStaticMarkup(<AppToaster />)

    expect(markup).toContain('aria-label="Notificações alt+T"')
    expect(markup).toContain('aria-live="polite"')
  })
})
