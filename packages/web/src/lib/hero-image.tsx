import { type JSX } from 'solid-js';
import { tw } from '@nou/ui';

export function HeroImage(props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/assets/images/alec-favale-Ivzo69e18nk-unsplash.jpg?w=600&format=webp&imagetools"
      class={tw(
        'bg-primary/5 aspect-[9/12] h-full w-full object-cover',
        props.class,
      )}
      {...props}
    />
  );
}
