import { Link } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'

const primaryButton = 'inline-flex cursor-pointer items-center justify-center border-2 border-black bg-green-900 px-5 py-3 font-mono text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151515] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black'

export function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-amber-100/50 px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <PixelBrand />
        <Link className="inline-flex cursor-pointer items-center justify-center border-2 border-black bg-green-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-green-800 hover:shadow-[1px_1px_0_#151515]" to="/login">
          Entrar
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24" aria-labelledby="home-title">
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
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className={primaryButton} to="/register">Começar agora</Link>
            <Link className="inline-flex cursor-pointer items-center justify-center border-2 border-black bg-white px-5 py-3 text-sm font-black text-red-600 uppercase tracking-wider shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151515]" to="/login">
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md border-2 border-black bg-green-900 p-5 shadow-[8px_8px_0_#151515] sm:p-8" aria-hidden="true">
          <div className="absolute -left-3 -top-3 size-6 border-2 border-black bg-white" />
          <div className="absolute -bottom-4 -right-4 size-9 border-2 border-black bg-red-600" />
          <div className="grid min-h-72 place-items-center border-2 border-dashed border-black bg-white p-6">
            <div className="relative grid size-40 place-items-center border-2 border-black bg-red-600 shadow-[6px_6px_0_#151515]">
              <span className="font-sans text-7xl font-black text-white">?</span>
              <span className="absolute -left-8 top-4 grid size-12 place-items-center border-2 border-black bg-white text-xl">*</span>
              <span className="absolute -right-7 bottom-3 grid size-11 place-items-center border-2 border-black bg-amber-400 text-xl text-white">!</span>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-white font-black uppercase tracking-[0.18em]">Quem será que eu tirei hein..</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 pb-8 md:grid-cols-3" aria-label="Como funciona">
        {[
          ['01', 'Crie seu grupo', 'Dê um nome para o encontro e inclua a turma.'],
          ['02', 'Envie os convites', 'Compartilhe o acesso com cada participante.'],
          ['03', 'Faça o sorteio', 'Cada pessoa vê seu resultado em particular (não vale bizoiar viu)'],
        ].map(([step, title, description]) => (
          <article key={step} className={`border-2 border-black p-5 shadow-[5px_5px_0_#151515] bg-white`}>
            <span className="inline-block border-2 border-black bg-amber-400 px-2 py-1 text-xs font-black">{step}</span>
            <h2 className="mt-4 text-lg font-black uppercase">{title}</h2>
            <p className={`mt-2 text-sm leading-6 text-black/70`}>{description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
