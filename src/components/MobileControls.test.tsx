import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { Input } from './Input'

describe('mobile controls', () => {
  it('renders a touch-sized button with an accessible icon label', () => {
    const markup = renderToStaticMarkup(
      <Button aria-label="Excluir participante"><span aria-hidden="true">x</span></Button>,
    )

    expect(markup).toContain('aria-label="Excluir participante"')
    expect(markup).toContain('min-h-11')
    expect(markup).toContain('touch-manipulation')
    expect(markup).toContain('focus-visible:outline-3')
  })

  it('keeps text inputs at 16px on mobile and compact on larger screens', () => {
    const markup = renderToStaticMarkup(<Input aria-invalid="false" />)

    expect(markup).toContain('min-h-11')
    expect(markup).toContain('text-base')
    expect(markup).toContain('sm:text-sm')
  })
})
