import type { ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-5xl leading-none">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[14.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
