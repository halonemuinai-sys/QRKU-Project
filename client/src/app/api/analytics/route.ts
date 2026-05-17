import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    // Get user's links details for mapping
    let linkIds: string[] = [];
    const linksMap = new Map();
    if (userId) {
      const { data: userLinks } = await supabaseServer
        .from('dynamic_links')
        .select('id, short_id, first_name, last_name, type')
        .eq('user_id', userId);
      
      if (userLinks) {
        linkIds = userLinks.map((l: any) => l.id);
        userLinks.forEach((l: any) => linksMap.set(l.id, l));
      }
    }

    // If user has no links, return empty
    if (userId && linkIds.length === 0) {
      return NextResponse.json({ chartData: [], osDistribution: [], mapMarkers: [], topCards: [], totalScans: 0, regionalDistribution: [], rawLogs: [] });
    }

    let logsQuery = supabaseServer
      .from('scan_logs')
      .select('scanned_at, os, browser, city, country, lat, lon, link_id')
      .order('scanned_at', { ascending: false }); // Latest scans first

    if (userId && linkIds.length > 0) {
      logsQuery = logsQuery.in('link_id', linkIds);
    }

    const { data: logs, error: logError } = await logsQuery;
    if (logError) throw logError;

    // Daily Scans
    const dailyData = (logs || []).reduce((acc: any, log: any) => {
      const date = new Date(log.scanned_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(dailyData).map(([name, scans]) => ({ name, scans })).reverse(); // order ascending for chart

    // OS Distribution
    const osData = (logs || []).reduce((acc: any, log: any) => {
      const name = log.os || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const osDistribution = Object.entries(osData).map(([name, value]) => ({ name, value }));

    // Map Markers
    const mapMarkers = (logs || []).filter((l: any) => l.lat && l.lon).map((l: any) => ({
      position: [l.lat, l.lon],
      city: l.city,
      country: l.country
    }));

    // Regional Demographics List
    const regionalData = (logs || []).reduce((acc: any, log: any) => {
      const city = log.city || 'Unknown';
      const country = log.country || 'Unknown';
      const key = `${city}|${country}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const regionalDistribution = Object.entries(regionalData)
      .map(([key, scans]) => {
        const [city, country] = key.split('|');
        return { city, country, scans: scans as number };
      })
      .sort((a, b) => b.scans - a.scans);

    // Detailed Raw Logs (for CSV download)
    const rawLogs = (logs || []).map((log: any) => {
      const linkInfo = linksMap.get(log.link_id) || {};
      const qrName = linkInfo.type === 'vcard'
        ? `${linkInfo.first_name || ''} ${linkInfo.last_name || ''}`.trim()
        : `${String(linkInfo.type || 'Unknown').toUpperCase()} QR`;
      
      return {
        scanned_at: log.scanned_at,
        qr_name: qrName || 'Unknown Link',
        short_id: linkInfo.short_id || '',
        city: log.city || 'Unknown',
        country: log.country || 'Unknown',
        os: log.os || 'Unknown',
        browser: log.browser || 'Unknown'
      };
    });

    // Top Cards
    let topQuery = supabaseServer
      .from('dynamic_links')
      .select('first_name, last_name, scan_count')
      .order('scan_count', { ascending: false })
      .limit(5);

    if (userId) topQuery = topQuery.eq('user_id', userId);

    const { data: topCards, error: cardError } = await topQuery;
    if (cardError) throw cardError;

    return NextResponse.json({
      chartData,
      osDistribution,
      mapMarkers,
      topCards,
      totalScans: (logs || []).length,
      regionalDistribution,
      rawLogs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
