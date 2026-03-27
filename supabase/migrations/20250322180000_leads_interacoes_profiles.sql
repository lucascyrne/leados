-- Perfis (papel admin para RLS)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'Um registo por utilizador; role=admin permite ler/atualizar leads.';

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user_leados ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created_leados
  after insert on auth.users
  for each row execute function public.handle_new_user_leados();

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid (),
  nome text not null,
  email text not null,
  telefone text,
  renda_mensal numeric not null,
  valor_desejado numeric not null,
  parcela_desejada numeric not null,
  objetivo text not null default '',
  prazo_inicio date,
  score integer not null check (score >= 0 and score <= 100),
  categoria text not null check (categoria in ('HIGH', 'LOW', 'DESCARTADO')),
  status text not null default 'NOVO' check (status in ('NOVO', 'QUALIFICADO', 'ENVIADO', 'CONVERTIDO')),
  created_at timestamptz not null default now()
);

comment on column public.leads.prazo_inicio is 'Data alvo do cliente; formulário pode enviar ISO date.';

alter table public.leads enable row level security;

create or replace function public.leads_force_status_novo ()
returns trigger
language plpgsql
as $$
begin
  new.status := 'NOVO';
  return new;
end;
$$;

create trigger leads_insert_status_novo
  before insert on public.leads
  for each row execute function public.leads_force_status_novo();

create policy "leads_insert_anon" on public.leads
  for insert to anon
  with check (true);

create policy "leads_insert_authenticated" on public.leads
  for insert to authenticated
  with check (true);

create policy "leads_select_admin" on public.leads
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid ()
        and p.role = 'admin'
    )
  );

create policy "leads_update_admin" on public.leads
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid ()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid ()
        and p.role = 'admin'
    )
  );

-- Interações de tracking
create table public.interacoes (
  id uuid primary key default gen_random_uuid (),
  lead_id uuid references public.leads (id) on delete set null,
  tipo text not null,
  payload jsonb,
  created_at timestamptz not null default now ()
);

alter table public.interacoes enable row level security;

create policy "interacoes_insert_anon" on public.interacoes
  for insert to anon
  with check (true);

create policy "interacoes_insert_authenticated" on public.interacoes
  for insert to authenticated
  with check (true);

create policy "interacoes_select_admin" on public.interacoes
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid ()
        and p.role = 'admin'
    )
  );
