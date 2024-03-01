export function startViewTransition(
  callback: Parameters<typeof document.startViewTransition>[0],
) {
  if ('startViewTransition' in document) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}
