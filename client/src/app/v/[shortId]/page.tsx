import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';
import ProfileClient from './ProfileClient';

async function logScan(linkId: string, scanCount: number) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMac = /Macintosh/i.test(userAgent);
    const isWindows = /Windows/i.test(userAgent);
    const isLinux = /Linux/i.test(userAgent) && !isAndroid;
    const os = isIOS ? 'iOS' : isAndroid ? 'Android' : isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : 'Unknown';

    const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);
    const browser = isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown';

    let ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '8.8.8.8';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (ip === '::1' || ip === '127.0.0.1') ip = '8.8.8.8';

    let geoData = { city: 'Unknown', country: 'Unknown', lat: 0, lon: 0 };
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) });
      const geo = await geoRes.json();
      if (geo.status === 'success') {
        geoData = { city: geo.city, country: geo.country, lat: geo.lat, lon: geo.lon };
      }
    } catch (e) { /* ignore geo error */ }

    await supabaseServer.from('scan_logs').insert([{
      link_id: linkId, user_agent: userAgent, ip_address: ip,
      city: geoData.city, country: geoData.country, lat: geoData.lat, lon: geoData.lon,
      os, browser
    }]);

    await supabaseServer.from('dynamic_links').update({ scan_count: (scanCount || 0) + 1 }).eq('id', linkId);
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
