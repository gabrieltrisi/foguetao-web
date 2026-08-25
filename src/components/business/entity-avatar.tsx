import { Building2 } from "lucide-react";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar de entidade (pessoa ou organização), com iniciais derivadas do nome. */
export function EntityAvatar({
  name,
  type = "person",
  src,
  size = "md",
  className,
}: {
  name: string;
  type?: "person" | "company";
  src?: string;
  size?: AvatarProps["size"];
  className?: string;
}) {
  if (type === "company") {
    const sizeClass = size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
    return (
      <span
        aria-label={name}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2",
          sizeClass,
          className,
        )}
      >
        <Building2 className="size-1/2" aria-hidden />
      </span>
    );
  }
  return <Avatar initials={initialsFrom(name)} src={src} alt={name} size={size} className={className} />;
}
