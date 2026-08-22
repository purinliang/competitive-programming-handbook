import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function CheckboxField({
  children,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
}) {
  const classes = ["checkbox-field", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}

export function TextAreaField({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = ["text-area-field", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...props} />;
}
