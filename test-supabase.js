const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔌 Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // Test basic connection by querying tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Project URL:', supabaseUrl);
    
    // Try to get basic project info
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tables) {
      console.log('📊 Found tables:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
