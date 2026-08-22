export function SidebarHeader({
  label,
  title,
}: {
  label?: string;
  title: string;
}) {
  return (
    <div className={`sidebar-heading${label ? "" : " sidebar-heading-single"}`}>
      {label ? <span>{label}</span> : null}
      <h2>{title}</h2>
    </div>
  );
}
