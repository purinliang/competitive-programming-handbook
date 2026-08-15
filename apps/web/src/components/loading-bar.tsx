interface LoadingBarProps {
  active: boolean;
  immediate?: boolean;
}

export function LoadingBar({ active, immediate = false }: LoadingBarProps) {
  if (!active) return null;

  return (
    <span
      className={`navigation-progress${immediate ? " is-immediate" : ""}`}
      role="progressbar"
      aria-label="正在载入页面"
    >
      <span />
    </span>
  );
}
