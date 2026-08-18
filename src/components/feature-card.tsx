import { ReactNode } from "react";

export function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
      <div className="mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}