import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type PrimaryCtaProps = {
  to: string
  children: React.ReactNode
}

export function PrimaryCta({ to, children }: PrimaryCtaProps) {
  return (
    <Button asChild className="min-h-11 w-full sm:w-auto sm:min-w-56">
      <Link to={to}>{children}</Link>
    </Button>
  )
}
