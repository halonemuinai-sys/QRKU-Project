import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, organization, phone, email, title, url,
      dotsColor, dotsType, gradientColor2, cornersSquareType, cornersSquareColor,
      cornersDotType, cornersDotColor, backgroundColor, logoUrl, hideBackgroundDots
    } = body;

    const userId = req.headers.get('x-user-id');
    const shortId = nanoid(6);

    const { error } = await supabaseServer
      .from('dynamic_links')
      .insert([{
        short_id: shortId,
        type: 'vcard',
        user_id: userId || null,
        first_name: firstName,
        last_name: lastName,
        organization,
        position: title,
        phone,
        email,
        website: url,
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
      }]);

    if (error) throw error;

    const dynamicUrl = `${BASE_URL}/v/${shortId}`;
    const buffer = await QRCode.toBuffer(dynamicUrl, {
      width: 1000,
      margin: 2,
      color: { dark: dotsColor || '#000000', light: backgroundColor || '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'image/png' }
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
