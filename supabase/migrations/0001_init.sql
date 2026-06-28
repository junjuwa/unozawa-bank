-- ============================================================
-- 0001_init.sql
-- おこづかいアプリ 初期スキーマ
-- 依存順: テーブル → ヘルパー関数 → RLS → RPC(+REVOKE/GRANT)
--         → プロビジョニングトリガ → Storage
-- 詳細設計の正典: docs/design.md
-- ============================================================

-- ------------------------------------------------------------
-- 1. テーブル定義
-- ------------------------------------------------------------

-- 家族
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- プロフィール（auth.users と 1:1）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id),
  role text not null check (role in ('parent','child')),
  display_name text not null,                       -- れい / じゅん / おとうさん
  theme_key text not null default 'parent_dark'
    check (theme_key in ('rei_blue','jun_red','parent_dark')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3つの口座（子供ごとに spend/save/grow の3行）
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('spend','save','grow')), -- つかう/ためる/ふやす
  balance integer not null default 0 check (balance >= 0),    -- 円（整数）
  updated_at timestamptz not null default now(),
  unique (profile_id, kind)
);

-- 台帳（全お金移動の記録）
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('salary','job_reward','transfer','interest')),
  amount integer not null,
  from_kind text check (from_kind in ('spend','save','grow')),
  to_kind   text check (to_kind   in ('spend','save','grow')),
  memo text,
  created_at timestamptz not null default now()
);

-- 投資ロット（ふやすへ移動した金額ごとの30日タイマー）
create table public.investment_lots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  principal integer not null check (principal > 0),  -- 元本
  interest_rate numeric(5,4) not null,               -- 0.1000 = 10%（作成時にスナップショット）
  interest_amount integer not null,                  -- 満期に付与する利息（作成時に確定）
  started_at timestamptz not null default now(),
  matures_at timestamptz not null,                   -- started_at + maturity_days
  status text not null default 'active' check (status in ('active','matured')),
  matured_at timestamptz
);

-- お仕事マスタ（親が単価設定）
create table public.job_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,                  -- へやのかたづけ / せんたくもののかたづけ
  reward integer not null check (reward >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- お仕事申請（子→親承認）
create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade, -- 申請した子
  task_id uuid not null references public.job_tasks(id),
  reward_snapshot integer not null,    -- 申請時点の単価を固定
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id)
);

-- 家族ごとのパラメータ＆約束
create table public.family_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  base_salary integer not null default 0,        -- 基本給（円）
  salary_weekday integer not null default 1,     -- 0=日 .. 6=土（基本給の支給曜日）
  investment_rate numeric(5,4) not null default 0.1000,  -- 投資金利
  maturity_days integer not null default 30,     -- 満期日数
  promises jsonb not null default '[]'::jsonb,   -- ぜったいのやくそく（ひらがな配列）
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. ヘルパー関数（RLS 再帰回避のため SECURITY DEFINER）
-- ------------------------------------------------------------

create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent'
  );
$$;

create or replace function public.my_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 3. RLS
-- ------------------------------------------------------------

alter table public.families         enable row level security;
alter table public.profiles         enable row level security;
alter table public.accounts         enable row level security;
alter table public.transactions     enable row level security;
alter table public.investment_lots  enable row level security;
alter table public.job_tasks        enable row level security;
alter table public.job_requests     enable row level security;
alter table public.family_settings  enable row level security;

-- profiles：自分 or 同じ家族の親
create policy "profiles_select" on public.profiles for select
  using ( id = auth.uid() or (is_parent() and family_id = my_family_id()) );
create policy "profiles_update" on public.profiles for update
  using ( id = auth.uid() or (is_parent() and family_id = my_family_id()) );

-- accounts：参照のみ開放。書込は RPC / service role 経由のみ（INSERT/UPDATE ポリシーを作らない）
create policy "accounts_select" on public.accounts for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- transactions：参照のみ
create policy "tx_select" on public.transactions for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- investment_lots：参照のみ
create policy "lots_select" on public.investment_lots for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- job_tasks：家族内は閲覧、変更は親のみ
create policy "tasks_select" on public.job_tasks for select
  using ( family_id = my_family_id() );
create policy "tasks_write_parent" on public.job_tasks for all
  using      ( is_parent() and family_id = my_family_id() )
  with check ( is_parent() and family_id = my_family_id() );

-- job_requests：参照=自分/親、申請=子(自分)、承認=親（RPC経由）
create policy "req_select" on public.job_requests for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );
create policy "req_insert_child" on public.job_requests for insert
  with check ( profile_id = auth.uid() and status = 'pending' );

-- family_settings：家族内閲覧、変更は親のみ
create policy "settings_select" on public.family_settings for select
  using ( family_id = my_family_id() );
create policy "settings_update_parent" on public.family_settings for update
  using ( is_parent() and family_id = my_family_id() );

-- ポイント：accounts / transactions / investment_lots に書込ポリシーをあえて作らない
-- ことで、クライアントからの直接改ざんを禁止する。お金が動くのは下記 RPC か、
-- cron の service role からのみ。

-- ------------------------------------------------------------
-- 4. RPC（お金の移動）
-- ------------------------------------------------------------

-- ① 口座間振替（子が自分のお金を動かす）
create or replace function public.transfer_money(p_from text, p_to text, p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_profile uuid := auth.uid();
  v_rate numeric; v_days integer;
begin
  if p_amount <= 0     then raise exception 'amount must be positive'; end if;
  if p_from = p_to     then raise exception 'same account';           end if;
  -- ふやす は満期までロック（早期引き出しを許すならこの行を外す。要相談）
  if p_from = 'grow'   then raise exception 'grow is locked';         end if;

  -- 出金（残高不足ならここで弾く）
  update public.accounts set balance = balance - p_amount, updated_at = now()
   where profile_id = v_profile and kind = p_from and balance >= p_amount;
  if not found then raise exception 'insufficient balance'; end if;

  -- 入金
  update public.accounts set balance = balance + p_amount, updated_at = now()
   where profile_id = v_profile and kind = p_to;

  insert into public.transactions(profile_id, type, amount, from_kind, to_kind)
  values (v_profile, 'transfer', p_amount, p_from, p_to);

  -- つかう→ふやす なら30日タイマー（ロット）を作成
  if p_to = 'grow' then
    select s.investment_rate, s.maturity_days into v_rate, v_days
      from public.family_settings s
      join public.profiles pr on pr.family_id = s.family_id
     where pr.id = v_profile;

    insert into public.investment_lots(profile_id, principal, interest_rate, interest_amount, matures_at)
    values (v_profile, p_amount, v_rate, floor(p_amount * v_rate),
            now() + (v_days || ' days')::interval);
  end if;
end;
$$;
grant execute on function public.transfer_money(text,text,integer) to authenticated;

-- ② お仕事承認（親）→「つかう」へ入金
create or replace function public.approve_job_request(p_request_id uuid)
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
     set status='approved', decided_at=now(), decided_by=auth.uid()
   where id = p_request_id;

  update public.accounts set balance = balance + r.reward_snapshot, updated_at = now()
   where profile_id = r.profile_id and kind = 'spend';   -- 入金はすべて「つかう」へ

  insert into public.transactions(profile_id, type, amount, to_kind, memo)
  values (r.profile_id, 'job_reward', r.reward_snapshot, 'spend', 'おしごと しょうにん');
end;
$$;
grant execute on function public.approve_job_request(uuid) to authenticated;

-- ③ 満期処理（cron が service role で呼ぶ）→ 元本+利息を「ためる」へ
create or replace function public.process_matured_investments()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; lot record;
begin
  for lot in
    select * from public.investment_lots
     where status = 'active' and matures_at <= now()
     for update
  loop
    update public.accounts set balance = balance - lot.principal, updated_at = now()
     where profile_id = lot.profile_id and kind = 'grow';
    update public.accounts set balance = balance + lot.principal + lot.interest_amount, updated_at = now()
     where profile_id = lot.profile_id and kind = 'save';

    update public.investment_lots set status='matured', matured_at=now() where id = lot.id;

    insert into public.transactions(profile_id, type, amount, from_kind, to_kind, memo)
    values (lot.profile_id, 'interest', lot.principal + lot.interest_amount, 'grow', 'save', 'まんき！りそく');
    cnt := cnt + 1;
  end loop;
  return cnt;     -- 0件でもこの SELECT 自体が pause 回避の活動になる
end;
$$;

-- ④ 基本給支給（cron が支給曜日に呼ぶ）
create or replace function public.pay_base_salary()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; rec record;
begin
  for rec in
    select p.id as profile_id, s.base_salary
      from public.profiles p
      join public.family_settings s on s.family_id = p.family_id
     where p.role = 'child' and s.base_salary > 0
       and extract(dow from (now() at time zone 'Asia/Tokyo')) = s.salary_weekday
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

-- ③④はクライアント（PUBLIC/anon/authenticated）には絶対に開放しない。
-- Postgres は関数作成時にデフォルトで PUBLIC に EXECUTE を付与するため、
-- 明示的に revoke してから service_role にのみ grant する。
-- cron の Route Handler が service role キーで呼ぶことを前提にする。
revoke all on function public.process_matured_investments() from public, anon, authenticated;
revoke all on function public.pay_base_salary()           from public, anon, authenticated;
grant execute on function public.process_matured_investments() to service_role;
grant execute on function public.pay_base_salary()             to service_role;

-- ------------------------------------------------------------
-- 5. 自動プロビジョニング（口座3行・家族設定1行）
-- ------------------------------------------------------------

-- profiles に role='child' で1行 insert されたら、
-- spend/save/grow の3口座を自動で作成する。
create or replace function public.provision_child_accounts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'child' then
    insert into public.accounts (profile_id, kind)
    values (new.id,'spend'), (new.id,'save'), (new.id,'grow');
  end if;
  return new;
end;
$$;
create trigger trg_provision_child_accounts
  after insert on public.profiles for each row
  execute function public.provision_child_accounts();

-- families に1行 insert されたら、family_settings を既定値で自動作成する。
create or replace function public.provision_family_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.family_settings (family_id) values (new.id)
  on conflict (family_id) do nothing;
  return new;
end;
$$;
create trigger trg_provision_family_settings
  after insert on public.families for each row
  execute function public.provision_family_settings();

-- ------------------------------------------------------------
-- 6. Storage（avatars バケット）
-- ------------------------------------------------------------

-- バケット名：avatars
-- パス規約：{family_id}/{profile_id}.png
-- 注意：storage.objects.name はバケット名を含まないため、
-- アップロード時のパスは "avatars/" を含めず "{family_id}/{profile_id}.png" とすること。
-- （storage.foldername(name))[1] が family_id と一致する前提でポリシーを書いている）
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- 読取：認証済みかつ自分の家族のフォルダのみ（署名URL or createSignedUrl で表示）
create policy "avatars_read" on storage.objects for select
  using ( bucket_id = 'avatars'
          and (storage.foldername(name))[1] = my_family_id()::text );

-- 書込/更新：親のみ
create policy "avatars_write_parent" on storage.objects for insert
  with check ( bucket_id = 'avatars' and public.is_parent()
               and (storage.foldername(name))[1] = my_family_id()::text );
create policy "avatars_update_parent" on storage.objects for update
  using ( bucket_id = 'avatars' and public.is_parent()
          and (storage.foldername(name))[1] = my_family_id()::text );
