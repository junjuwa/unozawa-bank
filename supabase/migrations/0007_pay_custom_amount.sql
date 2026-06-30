-- ============================================================
-- 0007_pay_custom_amount.sql
-- 親が金額・対象を自由に指定して即時支給するRPC。
-- ============================================================
create or replace function public.pay_custom_amount(p_profile_id uuid, p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_parent() then raise exception 'forbidden'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;

  if not exists (
    select 1 from public.profiles
    where id = p_profile_id and family_id = my_family_id() and role = 'child'
  ) then raise exception 'forbidden'; end if;

  update public.accounts set balance = balance + p_amount, updated_at = now()
   where profile_id = p_profile_id and kind = 'spend';

  insert into public.transactions(profile_id, type, amount, to_kind, memo)
  values (p_profile_id, 'salary', p_amount, 'spend', 'おやからの てあて');
end;
$$;
grant execute on function public.pay_custom_amount(uuid, integer) to authenticated;
