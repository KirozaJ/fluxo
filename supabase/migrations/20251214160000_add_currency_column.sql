alter table transactions 
add column if not exists currency text default 'USD';
