'use server';

import type { PageEvent } from '@solidjs/start/server';
import theme from '@nou/config/theme/theme.json';
import QRCode from 'qrcode';

import { getRequestUser } from '~/server/queries/getUserSession';

export async function GET(event: PageEvent) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const user = await getRequestUser();
  const url = `${new URL(event.request.url).origin}/family/invite/${user.userId}`;
  console.log({ url });
  const qrCodeSVG = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    color: {
      light: `#ffffff00`,
      dark: theme.schemes.light.onBackground,
    },
  });

  // Convert SVG to blob
  const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml' });

  // Create response with the SVG blob
  return new Response(svgBlob, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
