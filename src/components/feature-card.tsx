import type { ReactNode } from "react";

export function FeatureCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  index?: number;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 text-left shadow-[0_1px_0_var(--border),0_8px_24px_-12px_rgb(0_0_0/0.15)] transition-transform duration-200 hover:-translate-y-1 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-xl bg-secondary p-2.5">{icon}</div>
        {index !== undefined && (
          <span className="font-heading text-sm text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <h3 className="mb-2 font-heading text-xl font-semibold">{title}</h3>

      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}
