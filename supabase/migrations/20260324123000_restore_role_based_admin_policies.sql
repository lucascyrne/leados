-- Restaura políticas admin baseadas apenas em role.

drop policy if exists "leads_select_admin" on public.leads;
drop policy if exists "leads_update_admin" on public.leads;
drop policy if exists "interacoes_select_admin" on public.interacoes;

create policy "leads_select_admin" on public.leads
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "leads_update_admin" on public.leads
  for update using (
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

create policy "interacoes_select_admin" on public.interacoes
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
