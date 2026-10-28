import { Link } from 'react-router-dom'
import { AppFooter } from '../components/AppFooter'
import { ButtonLink } from '../components/Button'
import { PixelBrand } from '../components/PixelIcons'
import presentePixelArt from '../assets/presente-pixel-art.svg?no-inline'

export function HomePage() {
  return (
    <>
      <main className="min-h-dvh overflow-hidden bg-amber-100/50 px-4 py-5 font-mono text-black sm:px-8 sm:py-6">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <PixelBrand />
        <ButtonLink className="shadow-[3px_3px_0_#151515] hover:shadow-[1px_1px_0_#151515]" size="small" to="/login">
          Entrar
        </ButtonLink>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24" aria-labelledby="home-title">
        <div>
          <p className="mb-5 inline-block border-2 border-black bg-green-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#151515]">
            Sorteio sem complicação
          </p>
          <h1 id="home-title" className="max-w-xl text-4xl leading-[0.95] font-black tracking-[-0.08em] my-6 sm:text-6xl lg:text-7xl">
            Vamos criar um <span className="text-red-600">amigo secreto</span>?
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-black/70 sm:text-lg">
            Crie um grupo, convide as pessoas e deixe o Sorteador cuidar do sorteio.. obviamente. Simples, privado e divertido!
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <ButtonLink className="w-full sm:w-auto" size="large" to="/register">Cadastrar-se</ButtonLink>
            <ButtonLink className="w-full text-red-600 shadow-[4px_4px_0_#151515] sm:w-auto" size="large" variant="secondary" to="/login">
              Fazer Login
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md border-2 border-black bg-green-900 p-4 shadow-[8px_8px_0_#151515] sm:p-8">
          <div className="absolute -left-3 -top-3 size-6 border-2 border-black bg-white" />
          <div className="absolute -bottom-4 -right-4 size-9 border-2 border-black bg-red-600" />
          <div className="relative grid min-h-64 place-items-center border-2 border-dashed border-black bg-white p-5 sm:min-h-72 sm:p-6">
            <span aria-hidden="true" className="home-gift-sparkle home-gift-sparkle--one" />
            <span aria-hidden="true" className="home-gift-sparkle home-gift-sparkle--two" />
            <span aria-hidden="true" className="home-gift-sparkle home-gift-sparkle--three" />
            <span aria-hidden="true" className="home-gift-sparkle home-gift-sparkle--four" />
            <Link aria-label="Entrar na sua conta" className="home-gift-link" to="/login">
              <span className="home-gift-float block">
                <img
                  alt=""
                  className="pointer-events-none block h-auto w-52 max-w-full select-none [image-rendering:pixelated]"
                  decoding="async"
                  draggable={false}
                  fetchPriority="high"
                  height="240"
                  src={presentePixelArt}
                  width="208"
                />
              </span>
            </Link>
          </div>
          <p className="mt-5 text-center text-xs text-white font-black uppercase tracking-[0.18em]">Quem será que eu tirei hein..</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 pb-8 md:grid-cols-3" aria-label="Como funciona">
        {[
          ['01', 'Crie seu grupo', 'Dê um nome para o encontro e inclua a turma.'],
          ['02', 'Envie os convites', 'Compartilhe o acesso com cada participante.'],
          ['03', 'Faça o sorteio', 'Cada pessoa vê seu resultado em particular e podem interagir através de um mural anônimo.'],
        ].map(([step, title, description]) => (
          <article key={step} className={`border-2 border-black p-5 shadow-[5px_5px_0_#151515] bg-white`}>
            <span className="inline-block border-2 border-black bg-amber-400 px-2 py-1 text-xs font-black">{step}</span>
            <h2 className="mt-4 text-lg font-black uppercase">{title}</h2>
            <p className={`mt-2 text-sm leading-6 text-black/70`}>{description}</p>
          </article>
        ))}
      </section>

      </main>
      <AppFooter />
    </>
  )
}
