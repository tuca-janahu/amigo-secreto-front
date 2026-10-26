import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('does not render when closed', () => {
    const markup = renderToStaticMarkup(
      <Dialog open={false} onDismiss={() => undefined}>
        <Dialog.Title>Confirmar</Dialog.Title>
        <Dialog.Description>Descrição</Dialog.Description>
      </Dialog>,
    )

    expect(markup).toBe('')
  })

  it('connects its accessible title and description', () => {
    const markup = renderToStaticMarkup(
      <Dialog open onDismiss={() => undefined}>
        <Dialog.Title>Confirmar exclusão</Dialog.Title>
        <Dialog.Description>Esta ação não pode ser desfeita.</Dialog.Description>
        <Dialog.Actions>
          <Button variant="secondary">Cancelar</Button>
          <Button data-dialog-initial-focus>Confirmar</Button>
        </Dialog.Actions>
      </Dialog>,
    )

    const labelledBy = markup.match(/aria-labelledby="([^"]+)"/)?.[1]
    const describedBy = markup.match(/aria-describedby="([^"]+)"/)?.[1]

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain(`id="${labelledBy}"`)
    expect(markup).toContain(`id="${describedBy}"`)
    expect(markup).toContain('data-dialog-initial-focus="true"')
    expect(markup).toContain('flex-col-reverse')
    expect(markup).toContain('sm:flex-row')
  })
})
