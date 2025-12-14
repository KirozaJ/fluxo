alter table transactions 
add column if not exists is_recurring boolean default false,
add column if not exists recurring_day integer check (recurring_day >= 1 and recurring_day <= 31);
