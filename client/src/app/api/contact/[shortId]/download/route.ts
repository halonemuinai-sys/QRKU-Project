import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;
    const { data, error } = await supabaseServer
      .from('dynamic_links')
      .select('*')
      .eq('short_id', shortId)
      .single();

    if (error || !data) return new NextResponse('Contact not found', { status: 404 });

    // Build vCard manually (vcards-js uses require which can cause issues)
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${data.last_name || ''};${data.first_name || ''};;;`,
      `FN:${data.first_name || ''} ${data.last_name || ''}`.trim(),
      data.organization ? `ORG:${data.organization}` : '',
      data.position ? `TITLE:${data.position}` : '',
      data.phone ? `TEL;TYPE=WORK:${data.phone}` : '',
      data.email ? `EMAIL:${data.email}` : '',
      data.website ? `URL:${data.website}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    const fileName = `${data.first_name || 'contact'}_${data.last_name || ''}.vcf`.replace(/\s+/g, '_');

    return new NextResponse(lines, {
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      }
    });
  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
