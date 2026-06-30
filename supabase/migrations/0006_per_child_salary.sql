-- ============================================================
-- 0006_per_child_salary.sql
-- 基本給を家族共通(family_settings.base_salary)から
-- 子供ごと(profiles.base_salary)に移行する。
-- アバター・マスコットのURL欄も追加。
-- ============================================================

-- 子供ごとの基本給（デフォルト0円、既存family_settingsのbase_salaryとは独立）
alter table public.profiles add column base_salary integer not null default 0;

-- マスコット画像URL（avatar_urlと同様にtext列として保持）
alter table public.profiles add column mascot_url text;

-- pay_base_salary(): profiles.base_salaryを読むよう更新
-- (毎月1日にcronが呼ぶ。service role専用のため revoke/grant は変更なし)
create or replace function public.pay_base_salary()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; rec record;
begin
  for rec in
    select p.id as profile_id, p.base_salary
      from public.profiles p
     where p.role = 'child' and p.base_salary > 0
       and extract(day from (now() at time zone 'Asia/Tokyo')) = 1
  loop
    update public.accounts set balance = balance + rec.base_salary, updated_at = now()
     where profile_id = rec.profile_id and kind = 'spend';
    insert into public.transactions(profile_id, type, amount, to_kind, memo)
    values (rec.profile_id, 'salary', rec.base_salary, 'spend', 'きほんきゅう');
    cnt := cnt + 1;
  end loop;
  return cnt;
end;
$$;

-- pay_salary_now(): 親が任意のタイミングで子供1人分を即時支給する。
-- authenticated(=親)から呼べる。SECURITY DEFINERで is_parent()+家族確認を行う。
create or replace function public.pay_salary_now(p_profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_salary integer;
begin
  if not is_parent() then raise exception 'forbidden'; end if;

  select base_salary into v_salary from public.profiles
   where id = p_profile_id
     and family_id = my_family_id()
     and role = 'child';
  if not found then raise exception 'forbidden'; end if;
  if v_salary <= 0 then raise exception 'base_salary is zero'; end if;

  update public.accounts set balance = balance + v_salary, updated_at = now()
   where profile_id = p_profile_id and kind = 'spend';

  insert into public.transactions(profile_id, type, amount, to_kind, memo)
  values (p_profile_id, 'salary', v_salary, 'spend', 'きほんきゅう（こんすぐ）');
end;
$$;
grant execute on function public.pay_salary_now(uuid) to authenticated;
