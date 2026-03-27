// import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ObrigadoPage() {
  usePageTitle('Obrigado')

  const navigate = useNavigate()

  // useEffect(() => {
  //   const t = window.setTimeout(() => navigate('/', { replace: true }), 7000)
  //   return () => window.clearTimeout(t)
  // }, [navigate])

  return (
    <PublicLayout centerMain>
      <div className="mx-auto flex w-full max-w-full flex-col items-center text- gap-4">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Recebemos o seu pedido
        </h1>
        <p className="text-muted-foreground max-w-md text-pretty text-sm leading-relaxed sm:text-base">
          Recebemos suas informações com sucesso. Em poucos minutos, um representante da nossa
          equipe entrará em contato pelo telefone ou e-mail informados.
        </p>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed text-balance sm:max-w-md">
          Em poucos segundos, você será redirecionado para a página inicial.
        </p>
        <div className="mt-2 flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            variant="outline"
            className="w-full sm:min-w-48"
            onClick={() => navigate('/')}
          >
            Voltar ao início
          </Button>
          <Button
            className="w-full sm:min-w-48"
            onClick={() => navigate('/simulador')}
          >
            Nova simulação
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}
