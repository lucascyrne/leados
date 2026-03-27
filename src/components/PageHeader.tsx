type PageHeaderProps = {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-center mb-8 text-center">
      <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-muted-foreground mx-auto max-w-md text-pretty text-sm leading-relaxed sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
