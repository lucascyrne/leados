import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type PagePlaceholderProps = {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-background text-foreground mx-auto flex max-w-lg flex-col gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">Em construção</p>
      <div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Início
        </Button>
      </div>
    </div>
  )
}
