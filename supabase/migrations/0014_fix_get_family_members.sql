-- get_family_members の「column reference "id" is ambiguous」を修正
-- return table の列名に "m_" プレフィックスを付けて曖昧さを解消

create or replace function public.get_family_members()
returns table (
  m_id          uuid,
  m_display_name text,
  m_role        text,
  m_theme_key   text,
  m_avatar_url  text,
  m_has_pin     boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select p.family_id into v_family_id
    from public.profiles p
   where p.id = auth.uid();

  if v_family_id is null then
    return;
  end if;

  return query
    select
      p.id          as m_id,
      p.display_name as m_display_name,
      p.role::text  as m_role,
      p.theme_key   as m_theme_key,
      p.avatar_url  as m_avatar_url,
      (p.pin_hash is not null) as m_has_pin
    from public.profiles p
   where p.family_id = v_family_id
   order by p.role desc, p.display_name;
end;
$$;

grant execute on function public.get_family_members() to authenticated;
