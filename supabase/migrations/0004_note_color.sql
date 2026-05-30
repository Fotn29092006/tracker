-- Note mood colour: one of 'plain' | 'accent' | 'positive' | 'warning'.
alter table public.notes
  add column if not exists color text not null default 'plain';
