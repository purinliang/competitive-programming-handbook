import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";

export type ButtonSize = "compact" | "default" | "large" | "text";
export type ButtonTone = "ghost" | "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  tone?: ButtonTone;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({
    children,
    className,
    size = "default",
    tone = "secondary",
    type = "button",
    ...props
  }, ref) {
    return (
      <button
        className={buttonClassName({ className, size, tone })}
        ref={ref}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  },
);

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  compact?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({
    children,
    className,
    compact = false,
    type = "button",
    ...props
  }, ref) {
    const classes = [
      "ui-icon-button",
      compact ? "is-compact" : "",
      className ?? "",
    ].filter(Boolean).join(" ");

    return (
      <button className={classes} ref={ref} type={type} {...props}>
        {children}
      </button>
    );
  },
);

export function buttonClassName({
  className,
  size = "default",
  tone = "secondary",
}: {
  className?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
}) {
  return [
    "ui-button",
    `is-${tone}`,
    `is-${size}`,
    className ?? "",
  ].filter(Boolean).join(" ");
}
