-- avatars バケットの RLS ポリシー
-- 親は自家族の子供のファイルをアップロード・更新・削除できる
-- 全員（anon含む）がパブリック読み取り可能（バケットがPublicのため不要だが明示）

-- アップロード（INSERT）: 認証済み親のみ
create policy "avatars_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (select is_parent())
  );

-- 上書き（UPDATE）: 認証済み親のみ
create policy "avatars_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select is_parent())
  );

-- 削除（DELETE）: 認証済み親のみ
create policy "avatars_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select is_parent())
  );

-- 読み取り（SELECT）: 全員
create policy "avatars_select"
  on storage.objects for select
  to public
  using ( bucket_id = 'avatars' );
