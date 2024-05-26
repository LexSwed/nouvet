export function startViewTransition(
  handler: Parameters<Document['startViewTransition']>[0],
): ReturnType<Document['startViewTransition']> {
  if (typeof document.startViewTransition === 'function') {
    return document.startViewTransition(handler);
  } else {
    if (typeof handler === 'function') {
      handler();
    } else {
      handler.update();
    }
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      skipTransition: () => {},
      updateCallbackDone: Promise.resolve(),
    };
  }
}
