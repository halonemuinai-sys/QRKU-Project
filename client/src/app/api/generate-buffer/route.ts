import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      data: qrData,
      dotsColor, backgroundColor
    } = body;

    if (!qrData) {
      return NextResponse.json({ error: "Missing QR data string" }, { status: 400 });
    }

    // Generate Ultra HD (2048x2048) resolution buffer without database insertion
    const buffer = await QRCode.toBuffer(qrData, {
      width: 2048,
      margin: 2,
      color: { dark: dotsColor || '#000000', light: backgroundColor || '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'Content-Type': 'image/png' }
    });
  } catch (error: any) {
    console.error('Generate-buffer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
