import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { linkId, scanCount } = await req.json();

    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Parse UA manually (simple approach for Vercel)
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

    // Get IP
    let ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '8.8.8.8';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (ip === '::1' || ip === '127.0.0.1') ip = '8.8.8.8';

    // Geo lookup
    let geoData = { city: 'Unknown', country: 'Unknown', lat: 0, lon: 0 };
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) });
      const geo = await geoRes.json();
      if (geo.status === 'success') {
        geoData = { city: geo.city, country: geo.country, lat: geo.lat, lon: geo.lon };
      }
    } catch (e) { /* Geo failed, use defaults */ }

    // Insert scan log
    await supabaseServer.from('scan_logs').insert([{
      link_id: linkId,
      user_agent: userAgent,
      ip_address: ip,
      city: geoData.city,
      country: geoData.country,
      lat: geoData.lat,
      lon: geoData.lon,
      os,
      browser
    }]);

    // Update scan count
    await supabaseServer.from('dynamic_links')
      .update({ scan_count: (scanCount || 0) + 1 })
      .eq('id', linkId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Scan log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
