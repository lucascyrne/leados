-- Restringe visão admin a um único utilizador e estabiliza insert público de leads.

-- 1) Inserção pública via função SECURITY DEFINER (evita erro RLS 42501 no formulário)
create or replace function public.create_public_lead(
  p_nome text,
  p_email text,
  p_telefone text,
  p_renda_mensal numeric,
  p_valor_desejado numeric,
  p_parcela_desejada numeric,
  p_objetivo text,
  p_prazo_inicio date,
  p_score integer,
  p_categoria text
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.leads;
begin
  insert into public.leads (
    nome,
    email,
    telefone,
    renda_mensal,
    valor_desejado,
    parcela_desejada,
    objetivo,
    prazo_inicio,
    score,
    categoria
  ) values (
    p_nome,
    p_email,
    p_telefone,
    p_renda_mensal,
    p_valor_desejado,
    p_parcela_desejada,
    coalesce(p_objetivo, ''),
    p_prazo_inicio,
    p_score,
    p_categoria
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_public_lead(
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  text,
  date,
  integer,
  text
) to anon, authenticated;

-- 2) Reforça políticas de insert público (idempotente / explícito)
drop policy if exists "leads_insert_anon" on public.leads;
drop policy if exists "leads_insert_authenticated" on public.leads;

create policy "leads_insert_anon" on public.leads
  for insert to anon
  with check (true);

create policy "leads_insert_authenticated" on public.leads
  for insert to authenticated
  with check (true);

-- 3) Admin exclusivo por UUID fixo
drop policy if exists "leads_select_admin" on public.leads;
drop policy if exists "leads_update_admin" on public.leads;
drop policy if exists "interacoes_select_admin" on public.interacoes;

create policy "leads_select_admin" on public.leads
  for select
  using (
    auth.uid() = 'af04b943-1452-4b43-9772-a20b8643cd53'::uuid
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "leads_update_admin" on public.leads
  for update
  using (
    auth.uid() = 'af04b943-1452-4b43-9772-a20b8643cd53'::uuid
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    auth.uid() = 'af04b943-1452-4b43-9772-a20b8643cd53'::uuid
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "interacoes_select_admin" on public.interacoes
  for select
  using (
    auth.uid() = 'af04b943-1452-4b43-9772-a20b8643cd53'::uuid
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
