-- Create categories table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

-- Enable RLS on categories
alter table categories enable row level security;

-- Create policies for categories
create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Create transactions table
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  description text,
  date timestamptz not null,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

-- Enable RLS on transactions
alter table transactions enable row level security;

-- Create policies for transactions
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);
