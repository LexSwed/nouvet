import {
  createMemo,
  splitProps,
  type ComponentProps,
  type JSX,
} from 'solid-js';
import { getRequestEvent, isServer } from 'solid-js/web';

import { tw } from './tw';
import { mergeDefaultProps, type Merge } from './utils';

type ImageProps = Merge<
  ComponentProps<'img'>,
  {
    aspectRatio: string;
    src: string;
    alt: string;
    /**
     * @default 'webp'
     */
    format?: string;
    style?: JSX.CSSProperties;
  } & (
    | {
        width: number;
      }
    | { height: number }
  )
>;

/**
 * Constructs image URL
 */
function Image(ownProps: ImageProps) {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps, {
      get sizes() {
        return ownProps.width
          ? `(min-width: ${ownProps.width}px) ${ownProps.width}px, 100vw`
          : 'auto';
      },
      format: 'webp',
      alt: '',
    }),
    ['aspectRatio', 'src', 'format', 'class', 'style'],
  );
  const dynamicSrc = createMemo(() => {
    // TODO: Add Cloudflare Image Resizing
    if (local.src.startsWith('https://')) return local.src;
    // local image (from file, use vite-imagetools)
    const url = new URL(
      local.src,
      isServer
        ? import.meta.env.PROD
          ? getRequestEvent()!.request.headers.get('Origin')!
          : 'http://localhost:3000'
        : location.origin,
    );
    if (props.width) {
      url.searchParams.set('w', `${props.width}`);
    }
    if (props.height) {
      url.searchParams.set('h', `${props.height}`);
    }
    if (local.format) {
      url.searchParams.set('format', `${local.format}`);
    }
    url.searchParams.set('imagetools', '');

    return url.toString();
  });
  const style = (): JSX.CSSProperties => ({
    ...local.style,
    'aspect-ratio': local.aspectRatio,
  });
  return (
    <img
      {...props}
      src={dynamicSrc()}
      class={tw(`max-w-full object-cover`, local.class)}
      style={style()}
    />
  );
}

export { Image };
