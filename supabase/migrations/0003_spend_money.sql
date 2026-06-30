-- ============================================================
-- 0003_spend_money.sql
-- 親が実際の支出を記録し「つかう」残高から差し引くRPCを追加する。
-- design.md §1.5の方針どおり、accounts/transactionsへの直接書込は
-- クライアントに開放せずRPC経由のみとする。
-- ============================================================

alter table public.transactions drop constraint transactions_type_check;
alter table public.transactions add constraint transactions_type_check
  check (type in ('salary','job_reward','transfer','interest','spend'));

create or replace function public.spend_money(p_profile_id uuid, p_amount integer, p_memo text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_parent() then raise exception 'forbidden'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not exists (select 1 from public.profiles
                 where id = p_profile_id and family_id = my_family_id())
    then raise exception 'forbidden'; end if;

  update public.accounts set balance = balance - p_amount, updated_at = now()
   where profile_id = p_profile_id and kind = 'spend' and balance >= p_amount;
  if not found then raise exception 'insufficient balance'; end if;

  insert into public.transactions(profile_id, type, amount, from_kind, memo)
  values (p_profile_id, 'spend', p_amount, 'spend', p_memo);
end;
$$;
grant execute on function public.spend_money(uuid, integer, text) to authenticated;
