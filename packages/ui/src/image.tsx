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
  } & {
    width: number;
  }
>;

const steps = [640, 800, 1080, 1280, 1600];
/**
 * Constructs image URL
 */
function Image(ownProps: ImageProps) {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps, {
      format: 'webp',
      alt: '',
    }),
    ['aspectRatio', 'src', 'format', 'class', 'style'],
  );
  const imageProps = createMemo((): ComponentProps<'img'> => {
    // TODO: Absolute path, add Cloudflare Image Resizing
    if (local.src.startsWith('https://')) return { src: local.src };
    // local image (from file, use vite-imagetools)
    const url = new URL(
      local.src,
      isServer
        ? import.meta.env.PROD
          ? getRequestEvent()!.request.headers.get('Origin')!
          : 'http://localhost:3000'
        : location.origin,
    );
    const props: ComponentProps<'img'> = {};

    props.srcSet = steps
      .reduce((srcSet, w) => {
        const wurl = new URL(url);
        wurl.searchParams.set('w', `${w}`);
        srcSet.push(`${wurl.toString()} ${w}w`);
        return srcSet;
      }, [] as Array<string>)
      .join(', ');
    if (props.width) {
      props.sizes = `(min-width: ${props.width}px) ${props.width}px, 100vw`;
    }
    if (local.format) {
      url.searchParams.set('format', `${local.format}`);
    }
    url.searchParams.set('imagetools', '');

    return props;
  });
  const style = (): JSX.CSSProperties => ({
    ...local.style,
    'aspect-ratio': local.aspectRatio,
  });
  return (
    <img
      {...props}
      {...imageProps}
      class={tw(`max-w-full object-cover`, local.class)}
      style={style()}
    />
  );
}

export { Image };
