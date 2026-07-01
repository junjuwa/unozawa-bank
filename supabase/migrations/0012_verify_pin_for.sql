-- ユーザ切り替え用: 指定 profile の PIN を service role から検証する。
-- クライアントからは直接呼べない（grant authenticated は付与しない）。
-- /api/auth/switch-user Route Handler が admin client 経由で呼ぶ。

create or replace function public.verify_pin_for(p_profile_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash from public.profiles where id = p_profile_id;
  if v_hash is null then
    return false; -- PINが設定されていない場合は拒否
  end if;
  return v_hash = extensions.crypt(p_pin, v_hash);
end;
$$;

-- service role は RLS をバイパスするため grant 不要。
-- authenticated ユーザには grant しない（クライアントから直接呼ばせない）。
