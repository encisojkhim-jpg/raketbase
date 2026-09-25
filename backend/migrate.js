const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Starting migration...');

  try {
    // Read the SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001_add_profile_columns.sql'), 'utf8');

    // Supabase JS doesn't have a direct raw SQL execution method on the client,
    // so we will query it using the postgres extension, or we can just call an RPC if it exists.
    // Wait, the easiest way to run raw SQL without an RPC is to use the REST API `POST /rest/v1/rpc/...`
    // Actually, there is no generic `execute_sql` in standard Supabase.
    // Let's create an RPC if needed, or I can just use a pg client.
    
    // Instead of doing it directly from JS, since I don't have the `pg` connection string, 
    // wait, I can just use the `pg` module if the connection string is in `.env`, but it's not.
    console.log("SQL file located at backend/migrations/001_add_profile_columns.sql");
    console.log("Please run this SQL directly in your Supabase SQL Editor.");
    
    // Create bucket
    console.log('Attempting to create "avatars" storage bucket...');
    const { data: bucketData, error: bucketError } = await supabaseAdmin
      .storage
      .createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB
      });
      
    if (bucketError) {
      if (bucketError.message.includes('already exists') || bucketError.message.includes('Duplicate')) {
        console.log('Bucket "avatars" already exists.');
      } else {
        console.error('Error creating bucket:', bucketError.message);
      }
    } else {
      console.log('Bucket "avatars" created successfully!');
    }

  } catch (err) {
    console.error('Migration script failed:', err);
  }
}

runMigration();

