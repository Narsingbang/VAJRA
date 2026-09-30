-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

alter table public.profiles            enable row level security;
alter table public.farms               enable row level security;
alter table public.advisories          enable row level security;
alter table public.advisory_followups  enable row level security;
alter table public.advisory_feedback   enable row level security;
alter table public.ai_usage_log        enable row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- FARMS
create policy "farms_select_own" on public.farms
  for select using (auth.uid() = user_id);
create policy "farms_insert_own" on public.farms
  for insert with check (auth.uid() = user_id);
create policy "farms_update_own" on public.farms
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "farms_delete_own" on public.farms
  for delete using (auth.uid() = user_id);

-- ADVISORIES (read/delete own; inserts done by backend service role)
create policy "advisories_select_own" on public.advisories
  for select using (auth.uid() = user_id);
create policy "advisories_delete_own" on public.advisories
  for delete using (auth.uid() = user_id);

-- FOLLOW-UPS
create policy "followups_select_own" on public.advisory_followups
  for select using (auth.uid() = user_id);

-- FEEDBACK
create policy "feedback_select_own" on public.advisory_feedback
  for select using (auth.uid() = user_id);
create policy "feedback_insert_own" on public.advisory_feedback
  for insert with check (
    auth.uid() = user_id and
    exists (select 1 from public.advisories a where a.id = advisory_id and a.user_id = auth.uid())
  );
create policy "feedback_update_own" on public.advisory_feedback
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- USAGE LOG (user can only see own; only backend inserts)
create policy "usage_select_own" on public.ai_usage_log
  for select using (auth.uid() = user_id);

-- STORAGE: users can read only their own folder "<user_id>/..."
create policy "crop_images_select_own" on storage.objects
  for select using (
    bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "crop_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
