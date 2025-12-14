-- Enable pgcrypto for encryption
create extension if not exists pgcrypto;

-- Create table for storing API keys
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  provider text not null check (provider in ('binance')),
  -- We will store keys encrypted. 
  -- The application (Edge Function) will be responsible for encrypting/decrypting 
  -- using a secret key, OR we can use pypcrypto functions here if we pass the secret.
  -- For this setup, we will store them as text and rely on the Edge Function to 
  -- allow the user to input them, and then only the Edge Function (Service Role) 
  -- effectively uses them. 
  -- OR better: The client sends keys, Edge Function encrypts them and inserts. 
  encrypted_api_key text not null,
  encrypted_api_secret text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one integration per provider per user
  unique(user_id, provider)
);

-- Enable RLS
alter table user_integrations enable row level security;

-- Policy: Users can see their own integrations (status only, or masked keys if needed)
-- We might NOT want users to easily select their own secrets back to the frontend.
-- Let's restrict SELECT to 'true' but maybe at the app layer we don't select the secret.
create policy "Users can view own integrations"
  on user_integrations for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own integrations
-- (In reality, we might want the Edge Function to do the insertion to ensure encryption,
-- but allowing direct insert of ENCRYPTED data is okay if frontend does it, 
-- but frontend shouldn't hold the encryption key. 
-- SO: Best path -> Internal API (Edge Function) handles the save.)
-- BUT for simplicity in Phase 3 start, we grant insert/update/delete to user 
-- assuming the CLIENT sends the data. 
-- WAIT. User said "EXTREME SECURITY". 
-- Recommended Flow: Client sends Plain Keys to Edge Function -> Edge Function Encrypts with env.SECRET -> Saves to DB.
-- DB never sees plain text. Frontend never sees encryption key.
-- So, strict RLS: 
create policy "Users can delete own integrations"
  on user_integrations for delete
  using (auth.uid() = user_id);

-- We might allow SELECT if the user wants to check "Is Connected?", 
-- but we should ensure the API does not expose the raw columns `encrypted_api_key`.
-- We can solve this by not granting SELECT on those columns to the 'authenticated' role, 
-- or just being careful in `select`.
