-- ============================================================
-- 0002_monthly_salary.sql
-- 基本給の支給を「週次（salary_weekday）」から「月1回・毎月1日固定」に変更する。
-- ============================================================

-- pay_base_salary() を月初(1日)判定に変更。
-- family_settings.salary_weekday は今後使用しない（列はDROPせず残す。
-- 支給日は1日固定で運用上の選択肢ではないため、設定UIからも編集項目を削除する）。
create or replace function public.pay_base_salary()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; rec record;
begin
  for rec in
    select p.id as profile_id, s.base_salary
      from public.profiles p
      join public.family_settings s on s.family_id = p.family_id
     where p.role = 'child' and s.base_salary > 0
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

comment on column public.family_settings.salary_weekday is
  '非推奨・未使用。基本給の支給日は毎月1日に固定（0002_monthly_salary.sql参照）。';
