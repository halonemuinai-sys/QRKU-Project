require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { db: { schema: 'barcode' } }
);

async function test() {
    try {
        const { data, error } = await supabase
            .from('dynamic_links')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Success! Data:', data);
        }
    } catch (e) {
        console.error('🔥 Crash:', e);
    }
}

test();
