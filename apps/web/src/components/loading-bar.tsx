interface LoadingBarProps {
  active: boolean;
}

export function LoadingBar({ active }: LoadingBarProps) {
  if (!active) return null;

  return (
    <span
      className="navigation-progress"
      role="progressbar"
      aria-label="正在载入页面"
    >
      <span />
    </span>
  );
}
