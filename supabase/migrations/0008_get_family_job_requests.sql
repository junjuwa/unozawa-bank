-- RLSのis_parent()判定に依存しない、親専用のjob_requests取得関数。
-- auth.uid()→profilesで直接role/family_idを確認するためRLS設定に関わらず動作する。
create or replace function public.get_family_job_requests()
returns table(
  id            uuid,
  task_id       uuid,
  profile_id    uuid,
  reward_snapshot integer,
  status        text,
  requested_at  timestamptz,
  decided_at    timestamptz,
  job_task_name text,
  profile_display_name text
)
language plpgsql security definer set search_path = public as $$
declare
  v_family_id uuid;
  v_role      text;
begin
  select family_id, role into v_family_id, v_role
    from public.profiles where id = auth.uid();

  if v_role is distinct from 'parent' then
    raise exception 'forbidden';
  end if;

  return query
    select
      jr.id,
      jr.task_id,
      jr.profile_id,
      jr.reward_snapshot,
      jr.status::text,
      jr.requested_at,
      jr.decided_at,
      jt.name  as job_task_name,
      p.display_name as profile_display_name
    from public.job_requests jr
    left join public.job_tasks jt on jt.id = jr.task_id
    left join public.profiles  p  on p.id  = jr.profile_id
    where p.family_id = v_family_id
    order by jr.requested_at desc;
end;
$$;

grant execute on function public.get_family_job_requests() to authenticated;
