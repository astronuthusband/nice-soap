/* Nice Soap: database connection.

   1. Create a Supabase project and run supabase/schema.sql in its SQL editor.
   2. Paste the Project URL and the "anon" (public) key from the project's API settings below.

   Only ever use the anon key here. Never paste the service_role key into this file,
   because everything in it is visible to anyone who opens your website.

   While these are empty the site runs in demo mode: checkout works, but no order is saved. */
window.NICE_SOAP_CONFIG = {
  SUPABASE_URL: 'https://ibzegcbonyinceeuhgfp.supabase.co',       // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVnY2JvbnlpbmNlZXVoZ2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODA2NjUsImV4cCI6MjEwNTU1NjY2NX0.Y1jw1VrPidwOb--GDjDcnor-FnKInrah5ABDYidOn9g'   // the long key labelled "anon" / "public"
};
