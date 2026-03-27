-- Fase 5: fila de notificações para intermediador (WhatsApp 1:1 via webhook).

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  event_type text not null default 'lead_qualified_positive',
  channel text not null default 'whatsapp_intermediador',
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'retrying', 'sent', 'failed', 'dead_letter')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  next_retry_at timestamptz not null default now(),
  idempotency_key text not null unique,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_jobs_status_next_retry
  on public.notification_jobs(status, next_retry_at);

create index if not exists idx_notification_jobs_lead_id
  on public.notification_jobs(lead_id);

create or replace function public.notification_jobs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists notification_jobs_set_updated_at on public.notification_jobs;
create trigger notification_jobs_set_updated_at
before update on public.notification_jobs
for each row execute function public.notification_jobs_set_updated_at();

alter table public.notification_jobs enable row level security;

drop policy if exists "notification_jobs_insert_public" on public.notification_jobs;
create policy "notification_jobs_insert_public" on public.notification_jobs
  for insert to anon, authenticated
  with check (true);

drop policy if exists "notification_jobs_select_admin" on public.notification_jobs;
create policy "notification_jobs_select_admin" on public.notification_jobs
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "notification_jobs_update_admin" on public.notification_jobs;
create policy "notification_jobs_update_admin" on public.notification_jobs
  for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
