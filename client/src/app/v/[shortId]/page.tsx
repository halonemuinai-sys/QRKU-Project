import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';
import ProfileClient from './ProfileClient';

async function logScan(linkId: string, scanCount: number) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';

    await fetch(`${BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, scanCount, userAgent }),
    });
  } catch (e) {
    console.error('Scan log failed:', e);
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params;

  const { data, error } = await supabaseServer
    .from('dynamic_links')
    .select('*')
    .eq('short_id', shortId)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#fffbef] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border-[4px] border-black rounded-[2rem] shadow-[8px_8px_0px_0px_#000] p-10 text-center max-w-md">
          <h1 className="text-2xl font-black uppercase">Kontak Tidak Ditemukan</h1>
          <p className="font-bold text-gray-400 mt-2">QR Code ini tidak valid atau sudah dihapus.</p>
        </div>
      </div>
    );
  }

  // Log the scan asynchronously
  logScan(data.id, data.scan_count || 0);

  // Redirect based on type
  if (data.type === 'whatsapp') {
    const num = data.raw_data?.waNumber?.replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(data.raw_data?.waMessage || '');
    redirect(`https://wa.me/${num}?text=${msg}`);
  } else if (data.type === 'instagram') {
    redirect(`https://instagram.com/${data.raw_data?.igUsername?.replace('@', '')}`);
  } else if (data.type === 'tiktok') {
    redirect(`https://tiktok.com/@${data.raw_data?.ttUsername?.replace('@', '')}`);
  } else if (data.type === 'maps') {
    redirect(`https://www.google.com/maps/search/?api=1&query=${data.raw_data?.lat},${data.raw_data?.lon}`);
  } else if (data.type === 'link') {
    redirect(data.raw_data?.content || data.raw_data?.url || '/');
  }

  // For vcard type, show the profile page
  return <ProfileClient contact={data} />;
}
