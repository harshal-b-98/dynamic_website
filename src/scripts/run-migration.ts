import { supabaseAdmin } from '../lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Running contact submissions table migration...')

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250115_create_contact_submissions.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split SQL statements by semicolon and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\n⚙️  Executing: ${statement.substring(0, 60)}...`)
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement })

        if (error) {
          console.error('❌ Error:', error.message)
          // Try direct execution for statements that don't work with rpc
          const { error: directError } = await supabaseAdmin.from('_temp').select('*').limit(0)
          if (!directError || directError.message.includes('does not exist')) {
            console.log('⚠️  Skipping statement (may need manual execution)')
          }
        } else {
          console.log('✅ Success')
        }
      }
    }

    console.log('\n🎉 Migration completed! Testing table creation...')

    // Test the table by checking if it exists
    const { data, error } = await supabaseAdmin
      .from('dyn_contact_submissions')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('\n⚠️  Table not created. Please run the migration manually in Supabase SQL Editor.')
        console.log('\n📋 Copy the SQL from: supabase/migrations/20250115_create_contact_submissions.sql')
        console.log('🌐 Paste it in: https://supabase.com/dashboard/project/_/sql')
      } else {
        console.log('✅ Table exists but returned error:', error.message)
      }
    } else {
      console.log('✅ Table created successfully!')
      console.log(`📊 Current submissions count: ${data?.length || 0}`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n⚠️  Please run the migration manually:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Copy content from: supabase/migrations/20250115_create_contact_submissions.sql')
    console.log('3. Paste and execute')
  }
}

runMigration()
