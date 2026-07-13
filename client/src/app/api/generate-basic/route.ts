import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      previewOnly,
      editingId,
      data: qrData, type = 'link', rawData, smartTitle,
      dotsColor, dotsType, gradientColor2, cornersSquareType, cornersSquareColor,
      cornersDotType, cornersDotColor, backgroundColor, logoUrl, hideBackgroundDots
    } = body;

    const userId = req.headers.get('x-user-id');

    if (previewOnly) {
      let previewData = qrData;
      if (editingId) {
        const { data: existing } = await supabaseServer.from('dynamic_links').select('short_id').eq('id', editingId).single();
        if (existing?.short_id) {
          previewData = `${req.nextUrl.origin}/v/${existing.short_id}`;
        }
      }
      const buffer = await QRCode.toBuffer(previewData, {
        width: 2048, margin: 2,
        color: { dark: dotsColor || '#000000', light: backgroundColor || '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'image/png' } });
    }

    let shortId = nanoid(6);

    const payload: any = {
      type,
      first_name: smartTitle || null,
      user_id: userId || null,
      raw_data: rawData || { content: qrData },
      dots_color: dotsColor,
      gradient_color: gradientColor2,
      dots_type: dotsType,
      corners_square_type: cornersSquareType,
      corners_square_color: cornersSquareColor,
      corners_dot_type: cornersDotType,
      corners_dot_color: cornersDotColor,
      background_color: backgroundColor,
      logo_url: logoUrl,
      hide_background_dots: hideBackgroundDots
    };

    if (editingId) {
      const { data: existing } = await supabaseServer.from('dynamic_links').select('short_id, user_id').eq('id', editingId).single();
      if (existing && (!existing.user_id || !userId || existing.user_id === userId)) {
        shortId = existing.short_id;
        const { error } = await supabaseServer.from('dynamic_links').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        throw new Error("Tidak memiliki izin untuk mengedit QR ini");
      }
    } else {
      payload.short_id = shortId;
      const { error } = await supabaseServer.from('dynamic_links').insert([payload]);
      if (error) throw error;
    }

    const dynamicUrl = `${req.nextUrl.origin}/v/${shortId}`;
    const buffer = await QRCode.toBuffer(dynamicUrl, {
      width: 2048,
      margin: 2,
      color: { dark: dotsColor || '#000000', light: backgroundColor || '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'Content-Type': 'image/png' }
    });
  } catch (error: any) {
    console.error('Generate-basic error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
