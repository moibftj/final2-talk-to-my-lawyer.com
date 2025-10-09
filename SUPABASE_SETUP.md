# Supabase Setup Instructions

## Database Setup

### 1. Run the Database Migration

Copy and paste the following SQL into your Supabase SQL editor:

```sql
-- Enable Row Level Security
alter default privileges revoke execute on functions from public;

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text check (role in ('user', 'employee', 'admin')) not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create letters table
create table if not exists public.letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type text not null,
  content text,
  ai_draft text,
  status text check (status in ('draft', 'completed', 'sent')) not null default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.letters enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create RLS policies for letters
create policy "Users can view own letters" on public.letters
  for select using (auth.uid() = user_id);

create policy "Users can insert own letters" on public.letters
  for insert with check (auth.uid() = user_id);

create policy "Users can update own letters" on public.letters
  for update using (auth.uid() = user_id);

create policy "Users can delete own letters" on public.letters
  for delete using (auth.uid() = user_id);

create policy "Admins can view all letters" on public.letters
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger letters_updated_at
  before update on public.letters
  for each row execute procedure public.handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
```

### 2. Deploy Edge Functions

If the Edge Functions are not working, you need to deploy them:

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref hevnbcyuqxirqwhekwse

# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy generate-draft
```

### 3. Set Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add:

- `OPENAI_API_KEY`: Your OpenAI Codex API key

### 4. Update Authentication Settings

In your Supabase dashboard, go to Authentication > Settings:

- Set Site URL to: `http://localhost:5174`
- Add redirect URL: `http://localhost:5174`

## Common Issues

### Error: "Could not find the table 'public.letters'"
- Run the SQL migration script above in your Supabase SQL editor

### Error: "Error fetching user profile"
- Ensure the profiles table exists and the trigger is created
- Check if RLS policies are properly configured

### CORS Error on Edge Functions
- Ensure Edge Functions are deployed
- Check that the OPENAI_API_KEY is set in Supabase secrets
- Verify the function is accessible via the correct URL

### Authentication Issues
- Check that the site URL and redirect URLs are correctly configured
- Ensure auth.users table has proper triggers for profile creation

## Testing

After setup:
1. Register a new user
2. Check that a profile is automatically created
3. Try creating a letter
4. Test the AI draft generation feature