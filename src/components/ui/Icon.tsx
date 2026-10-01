import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

type IconProps = LucideProps & {
  icon: ComponentType<LucideProps>;
};

export function Icon({
  icon: IconComponent,
  strokeWidth = 1.6,
  ...props
}: IconProps) {
  return (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
