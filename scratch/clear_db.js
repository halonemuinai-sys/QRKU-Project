require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { db: { schema: 'barcode' } }
);

async function clearData() {
    console.log("Menghapus semua data dari scan_logs...");
    await supabase.from('scan_logs').delete().neq('id', 0); // Hapus semua
    
    console.log("Menghapus semua data dari dynamic_links...");
    const { error } = await supabase.from('dynamic_links').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hapus semua
    
    if (error) {
        console.error("Gagal menghapus:", error);
    } else {
        console.log("Semua data berhasil dihapus! Database kembali bersih.");
    }
}

clearData();
