-- Drop the handle_new_user trigger if it exists
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Also drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Check remaining triggers
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%handle_new_user%';