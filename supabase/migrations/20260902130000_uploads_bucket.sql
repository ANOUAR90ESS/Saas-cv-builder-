-- Storage for the two files the app accepts: a profile photo, and a profile
-- export to be parsed into a CV.
--
-- The bucket is public to read, because a photo has to load inside a rendered
-- CV and inside a generated PDF, neither of which carries a session. Writing is
-- open to signed-out visitors too — the app works without an account, and
-- requiring one to attach a photo would be the account requirement coming back
-- through a side door.
--
-- What keeps that from being free file hosting for strangers is the bucket's
-- own limits rather than a policy: 8 MB, and only the types the app can
-- actually use. Someone can still upload a picture; they cannot park a video
-- library here.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  8388608,                                    -- 8 MB
  array[
    'image/jpeg', 'image/png', 'image/webp',  -- profile photos
    'application/pdf', 'text/html', 'text/plain'  -- profile exports
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Read: anyone, so an <img> and the PDF renderer can fetch without a session.
drop policy if exists "uploads are publicly readable" on storage.objects;
create policy "uploads are publicly readable"
  on storage.objects for select
  using (bucket_id = 'uploads');

-- Write: anyone, bounded by the bucket limits above. Deliberately not scoped to
-- a user folder — there are no users.
drop policy if exists "anyone may upload" on storage.objects;
create policy "anyone may upload"
  on storage.objects for insert
  with check (bucket_id = 'uploads');

-- No update or delete policy: an uploaded file is immutable and nobody can
-- remove someone else's. Clearing out orphans is an operator job, not a
-- capability the app hands to the internet.
