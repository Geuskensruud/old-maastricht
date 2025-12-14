import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
// Als je auth wilt afdwingen, kun je hier getServerSession importeren:
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Eventueel: admin-check via NextAuth
    // const session = await getServerSession(authOptions as any);
    // const userAny = session?.user as any;
    // if (!session || !userAny?.isAdmin) {
    //   return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
    // }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Geen bestand ontvangen.' },
        { status: 400 }
      );
    }

    const mime = file.type || '';
    if (!mime.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingsbestanden zijn toegestaan.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || 'upload.png';
    const ext = (originalName.split('.').pop() || 'png').toLowerCase();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[admin/upload-image] error:', err);
    return NextResponse.json(
      { error: 'Uploaden van afbeelding mislukt.' },
      { status: 500 }
    );
  }
}
