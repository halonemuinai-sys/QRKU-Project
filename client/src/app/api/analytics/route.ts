import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    // Get user's link IDs
    let linkIds: string[] = [];
    if (userId) {
      const { data: userLinks } = await supabaseServer
        .from('dynamic_links')
        .select('id')
        .eq('user_id', userId);
      linkIds = (userLinks || []).map((l: any) => l.id);
    }

    // If user has no links, return empty
    if (userId && linkIds.length === 0) {
      return NextResponse.json({ chartData: [], osDistribution: [], mapMarkers: [], topCards: [], totalScans: 0 });
    }

    let logsQuery = supabaseServer
      .from('scan_logs')
      .select('scanned_at, os, city, country, lat, lon, link_id')
      .order('scanned_at', { ascending: true });

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
    const chartData = Object.entries(dailyData).map(([name, scans]) => ({ name, scans }));

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
      totalScans: (logs || []).length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
