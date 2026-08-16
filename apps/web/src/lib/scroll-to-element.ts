const DEFAULT_SCROLL_DURATION_MS = 300;

type ScrollBlock = "center" | "start";

interface ScrollToElementOptions {
  block?: ScrollBlock;
  duration?: number;
}

let cancelActiveScroll: (() => void) | undefined;

function destinationFor(target: HTMLElement, block: ScrollBlock): number {
  const root = document.documentElement;
  const rectangle = target.getBoundingClientRect();
  const current = window.scrollY;
  const scrollPadding = Number.parseFloat(
    window.getComputedStyle(root).scrollPaddingTop,
  ) || 0;
  const desired = block === "center"
    ? current + rectangle.top - scrollPadding
      - (window.innerHeight - scrollPadding - rectangle.height) / 2
    : current + rectangle.top - scrollPadding;
  return Math.min(
    Math.max(0, root.scrollHeight - window.innerHeight),
    Math.max(0, desired),
  );
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2;
}

export function scrollToElement(
  target: HTMLElement,
  {
    block = "start",
    duration = DEFAULT_SCROLL_DURATION_MS,
  }: ScrollToElementOptions = {},
): () => void {
  cancelActiveScroll?.();

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const start = window.scrollY;
  const destination = destinationFor(target, block);
  const distance = destination - start;
  root.style.scrollBehavior = "auto";

  if (
    Math.abs(distance) < 2
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    window.scrollTo(0, destination);
    root.style.scrollBehavior = previousScrollBehavior;
    cancelActiveScroll = undefined;
    return () => {};
  }

  let frame = 0;
  let finished = false;
  const startedAt = performance.now();
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    root.style.scrollBehavior = previousScrollBehavior;
    if (cancelActiveScroll === cancel) cancelActiveScroll = undefined;
  };
  const cancel = () => finish();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      finish();
    }
  };

  cancelActiveScroll = cancel;
  frame = requestAnimationFrame(step);
  return cancel;
}
