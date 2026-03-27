export function AdminEmptyState({ message }: { message: string }) {
  return <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">{message}</p>
}

export function AdminErrorState({ message }: { message: string }) {
  return (
    <p className="text-destructive rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert">
      {message}
    </p>
  )
}
