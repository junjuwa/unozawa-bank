-- 家族メンバー一覧を返す RPC（pin_hash は除外・SECURITY DEFINER で RLS をバイパス）
-- 子どもからも呼べるよう authenticated role に grant する。
-- pin_hash はサーバ側の verify_pin_for RPC 経由でのみ検証するため、ここでは返さない。

create or replace function public.get_family_members()
returns table (
  id          uuid,
  display_name text,
  role        text,
  theme_key   text,
  avatar_url  text,
  has_pin     boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select family_id into v_family_id
    from public.profiles
   where id = auth.uid();

  if v_family_id is null then
    return;
  end if;

  return query
    select
      p.id,
      p.display_name,
      p.role::text,
      p.theme_key,
      p.avatar_url,
      (p.pin_hash is not null) as has_pin
    from public.profiles p
   where p.family_id = v_family_id
   order by p.role desc, p.display_name; -- parent が先
end;
$$;

grant execute on function public.get_family_members() to authenticated;
