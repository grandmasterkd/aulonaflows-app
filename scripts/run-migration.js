const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...')

    // Read the migration file
    const migrationPath = path.join(__dirname, '009_user_accounts_and_credits.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)

        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

          if (error) {
            // If rpc doesn't work, try direct query
            const { error: queryError } = await supabase.from('_supabase_migration_temp').select('*').limit(1)

            if (queryError) {
              console.log(`   Statement ${i + 1}: ${statement.substring(0, 100)}...`)
              console.log(`   ⚠️  Could not execute via RPC, you may need to run this manually`)
            }
          }
        } catch (err) {
          console.log(`   Statement ${i + 1}: ${statement.substring(0, 100)}...`)
          console.log(`   ⚠️  Error executing statement: ${err.message}`)
        }
      }
    }

    console.log('✅ Migration script completed!')
    console.log('📋 Note: You may need to run the SQL statements manually in your Supabase dashboard if the automated execution failed.')
    console.log('📁 Migration file: scripts/009_user_accounts_and_credits.sql')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Alternative: Just display the SQL for manual execution
function displayMigrationForManualExecution() {
  const migrationPath = path.join(__dirname, '009_user_accounts_and_credits.sql')

  try {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📄 Migration SQL for manual execution:')
    console.log('=' .repeat(80))
    console.log(migrationSQL)
    console.log('=' .repeat(80))
    console.log('📋 Copy and paste this SQL into your Supabase SQL Editor')
  } catch (error) {
    console.error('❌ Could not read migration file:', error)
  }
}

// Run the migration or display for manual execution
if (process.argv.includes('--manual')) {
  displayMigrationForManualExecution()
} else {
  runMigration()
}