'use server';

import { getRequestEvent } from 'solid-js/web';
import theme from '@nou/config/theme/theme.json';
import QRCode from 'qrcode';

import { getRequestUser } from '~/server/queries/getUserSession';

export async function createFamilyInvite() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const user = await getRequestUser();
  const event = getRequestEvent();
  const url = `${new URL(event!.request.url).origin}/family/invite/${user.userId}`;
  try {
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
    return {
      url,
      // see https://github.com/lxsmnsyc/seroval/blob/main/docs/compatibility.md
      image: new Response(svgBlob, {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }),
    };
  } catch (error) {
    console.error(error);
    return { url, image: null };
  }
}
