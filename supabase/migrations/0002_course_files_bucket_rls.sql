-- 0002_course_files_bucket_rls.sql
-- Make the `course_files` storage bucket PRIVATE and scope access by user id.
-- Files are stored under `{userId}/{courseId}/{folder}/{fileName}`, so the
-- first path segment (storage.foldername(name))[1] must equal the caller's uid.
-- Access to private objects must go through signed URLs (handled in the app).
-- Safe to re-run (idempotent).

-- Ensure the bucket exists and is private.
insert into storage.buckets (id, name, public)
values ('course_files', 'course_files', false)
on conflict (id) do update set public = false;

-- SELECT (list/download) only objects under your own uid prefix
drop policy if exists "course_files_select_own" on storage.objects;
create policy "course_files_select_own" on storage.objects
  for select
  using (
    bucket_id = 'course_files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT only under your own uid prefix
drop policy if exists "course_files_insert_own" on storage.objects;
create policy "course_files_insert_own" on storage.objects
  for insert
  with check (
    bucket_id = 'course_files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE (upsert) only your own objects
drop policy if exists "course_files_update_own" on storage.objects;
create policy "course_files_update_own" on storage.objects
  for update
  using (
    bucket_id = 'course_files'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'course_files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE only your own objects
drop policy if exists "course_files_delete_own" on storage.objects;
create policy "course_files_delete_own" on storage.objects
  for delete
  using (
    bucket_id = 'course_files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
