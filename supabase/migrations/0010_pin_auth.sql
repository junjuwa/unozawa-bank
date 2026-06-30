-- profiles に pin_hash カラムを追加（未設定=nullはPINなし扱い）
alter table public.profiles add column if not exists pin_hash text;

-- pgcrypto が必要（Supabaseはデフォルトで有効）
create extension if not exists pgcrypto;

-- set_pin: 親は自分・同family子供のPINを設定可。子は自分のみ。
create or replace function public.set_pin(p_profile_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_caller_family uuid;
  v_target_family uuid;
begin
  if length(p_pin) < 4 then
    raise exception 'pin must be at least 4 digits';
  end if;

  select role, family_id into v_caller_role, v_caller_family
    from public.profiles where id = auth.uid();

  if p_profile_id = auth.uid() then
    -- 自分自身のPINを設定: 常に許可
    null;
  elsif v_caller_role = 'parent' then
    -- 親が子供のPINを設定: 同family・child roleのみ
    select family_id into v_target_family
      from public.profiles
      where id = p_profile_id and role = 'child';
    if v_target_family is distinct from v_caller_family then
      raise exception 'forbidden';
    end if;
  else
    raise exception 'forbidden';
  end if;

  update public.profiles
    set pin_hash = crypt(p_pin, gen_salt('bf', 8))
    where id = p_profile_id;
end;
$$;

grant execute on function public.set_pin(uuid, text) to authenticated;

-- verify_pin: 自分のPINを検証する。pin未設定ならtrueを返す（ゲートをスキップ）
create or replace function public.verify_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash from public.profiles where id = auth.uid();
  if v_hash is null then
    return true;
  end if;
  return v_hash = crypt(p_pin, v_hash);
end;
$$;

grant execute on function public.verify_pin(text) to authenticated;
