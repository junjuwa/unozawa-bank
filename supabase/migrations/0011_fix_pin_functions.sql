-- 0010のset_pin/verify_pinを完全修飾名で書き直す。
-- extensions.crypt / extensions.gen_salt を直接参照することで
-- search_path依存をなくす（Supabaseの pgcrypto は extensions スキーマにある）。

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
    null;
  elsif v_caller_role = 'parent' then
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
    set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf', 8))
    where id = p_profile_id;
end;
$$;

grant execute on function public.set_pin(uuid, text) to authenticated;

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
  return v_hash = extensions.crypt(p_pin, v_hash);
end;
$$;

grant execute on function public.verify_pin(text) to authenticated;
