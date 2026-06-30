-- ============================================================
-- 0004_job_requests_extras.sql
-- おしごとの完了条件カラムと、却下用RPCを追加する。
-- ============================================================

alter table public.job_tasks add column condition text not null default '';

-- ② 派生: お仕事却下（親）
create or replace function public.reject_job_request(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not is_parent() then raise exception 'forbidden'; end if;

  select * into r from public.job_requests where id = p_request_id and status = 'pending';
  if not found then raise exception 'request not found'; end if;
  if not exists (select 1 from public.profiles
                 where id = r.profile_id and family_id = my_family_id())
    then raise exception 'forbidden'; end if;

  update public.job_requests
     set status='rejected', decided_at=now(), decided_by=auth.uid()
   where id = p_request_id;
end;
$$;
grant execute on function public.reject_job_request(uuid) to authenticated;
