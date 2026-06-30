-- ============================================================
-- 0005_goals.sql
-- design.mdに無かった「目標（ほしいもの）」をテーブル化する。
-- お金は動かさないテーブルのため、子が自分の行を直接書き込めるRLSにする。
-- ============================================================

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target integer not null check (target > 0),
  active boolean not null default false,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals_select" on public.goals for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

create policy "goals_write_child" on public.goals for all
  using      ( profile_id = auth.uid() )
  with check ( profile_id = auth.uid() );
