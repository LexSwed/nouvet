import { type JSX } from 'solid-js';
import { tw } from '@nou/ui';

export function HeroImage(props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      class={tw(
        'bg-primary/5 aspect-[9/12] h-full w-full object-cover',
        props.class,
      )}
    />
  );
}
