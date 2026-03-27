import { useNavigate } from 'react-router-dom'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RealExamplesSection } from '@/components/RealExamplesSection'
import { formatBRL } from '@/utils/currency'
import { useSimuladorLogic } from './useSimuladorLogic'

type SimuladorPanelProps = {
  variant?: 'landing' | 'page'
  showExamples?: boolean
  showIntroCopy?: boolean
}

export function SimuladorPanel({
  variant = 'landing',
  showExamples = true,
  showIntroCopy = false,
}: SimuladorPanelProps) {
  const navigate = useNavigate()
  const {
    setFromSimulador,
    modoEntrada,
    credito,
    setCredito,
    parcela,
    setParcela,
    resultado,
    continuar,
    podeContinuar,
  } = useSimuladorLogic()

  const isPage = variant === 'page'

  return (
    <div className={isPage ? 'space-y-8' : 'space-y-5 sm:space-y-6'}>
      {showIntroCopy ? (
        <p className="text-muted-foreground text-center text-sm leading-relaxed sm:text-left">
          Informe o valor de crédito desejado ou a parcela que cabe no seu orçamento.
          Usamos a tabela oficial e interpolação entre os pontos quando necessário.
        </p>
      ) : null}

      <RadioGroup
        value={modoEntrada}
        onValueChange={(v) =>
          setFromSimulador({
            modoEntrada: v as 'credito' | 'parcela',
          })
        }
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="credito" id="modo-credito" />
          <Label htmlFor="modo-credito" className="cursor-pointer font-normal">
            Por valor do crédito
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="parcela" id="modo-parcela" />
          <Label htmlFor="modo-parcela" className="cursor-pointer font-normal">
            Por parcela mensal
          </Label>
        </div>
      </RadioGroup>

      {modoEntrada === 'credito' ? (
        <CurrencyInput
          label="Valor desejado do crédito"
          value={credito}
          onChange={setCredito}
        />
      ) : (
        <CurrencyInput
          label="Parcela mensal desejada"
          value={parcela}
          onChange={setParcela}
        />
      )}

      {resultado ? (
        <Card className="border-primary/25 bg-primary/5 shadow-sm">
          <CardContent className={isPage ? 'space-y-1.5 pt-6 text-sm' : 'space-y-1.5 pt-5 text-sm'}>
            {resultado.tipo === 'parcela' ? (
              <>
                <p className="text-muted-foreground">Parcela estimada</p>
                <p className="text-foreground text-2xl font-semibold tabular-nums">
                  {formatBRL(resultado.valor)}
                </p>
                <p className="text-muted-foreground pt-1 text-xs">
                  {resultado.oficial
                    ? 'Valor oficial da tabela para este crédito.'
                    : 'Estimativa por interpolação entre pontos da tabela oficial.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Crédito estimado</p>
                <p className="text-foreground text-2xl font-semibold tabular-nums">
                  {formatBRL(resultado.valor)}
                </p>
                <p className="text-muted-foreground pt-1 text-xs">
                  {resultado.oficial
                    ? 'Crédito correspondente a uma linha oficial da tabela.'
                    : 'Estimativa por interpolação; a relação crédito/parcela não é linear em toda a faixa.'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-2">
        <p className="text-muted-foreground text-center text-xs leading-snug sm:text-left mb-2">
          Simulação informativa, sem caráter de proposta ou aprovação de crédito.
        </p>
      </div>
      

      <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:justify-start">
        {isPage ? (
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Início
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={!podeContinuar}
          className="min-h-11 sm:min-w-56"
          onClick={continuar}
        >
          Continuar para qualificação
        </Button>
      </div>

      {showExamples ? (
        <div className="border-border border-t pt-5 text-left">
          <RealExamplesSection />
        </div>
      ) : null}
    </div>
  )
}
