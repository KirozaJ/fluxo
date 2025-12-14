-- Enable necessary extensions
-- (None strictly required for this basic setup, but 'pgcrypto' is useful if not enabled by default)

-- 1. PROFILES TABLE
-- Create a table for public profiles using Supabase's auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Trigger to creating a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CATEGORIES TABLE
create table public.categories (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using ( auth.uid() = user_id );

-- Allow users to insert their own categories
create policy "Users can insert own categories"
  on public.categories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own categories"
  on public.categories for update
  using ( auth.uid() = user_id );

create policy "Users can delete own categories"
  on public.categories for delete
  using ( auth.uid() = user_id );


-- 3. TRANSACTIONS TABLE
create table public.transactions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  amount numeric not null,
  description text,
  date date not null default current_date,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own transactions"
  on public.transactions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own transactions"
  on public.transactions for delete
  using ( auth.uid() = user_id );
