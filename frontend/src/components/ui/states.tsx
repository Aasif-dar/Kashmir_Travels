import { AlertTriangle, Compass, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TripIssue } from "@/types/trip";

export function EmptyState({ title, description, action, icon, className }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center border border-dashed border-stone px-6 py-14 text-center", className)}>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-parchment text-forest">{icon ?? <Compass className="h-5 w-5" aria-hidden />}</div>
      <h3 className="font-display text-2xl text-charcoal">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, action, className }: { title?: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center border border-burgundy/30 bg-burgundy/[0.04] px-6 py-12 text-center", className)}>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-burgundy/10 text-burgundy">
        <OctagonAlert className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="font-display text-2xl text-charcoal">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-[3px] bg-sand/70", className)} />;
}

export function LoadingBlock({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("space-y-3", className)}>
      <span className="sr-only">{label}</span>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

const issueStyles = {
  error: { wrap: "border-burgundy/40 bg-burgundy/[0.05] text-burgundy", icon: OctagonAlert, label: "Needs attention" },
  warning: { wrap: "border-brass/50 bg-brass/[0.08] text-[#6b4f1b]", icon: AlertTriangle, label: "Heads-up" },
  info: { wrap: "border-himalaya/40 bg-himalaya/[0.08] text-[#3f5a70]", icon: Info, label: "Good to know" },
} as const;

export function IssueList({ issues, className, compact }: { issues: TripIssue[]; className?: string; compact?: boolean }) {
  if (!issues.length) return null;
  const order = { error: 0, warning: 1, info: 2 } as const;
  const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
  return (
    <ul className={cn("space-y-2", className)}>
      {sorted.map((i) => {
        const s = issueStyles[i.severity];
        const Icon = s.icon;
        return (
          <li key={i.code} role={i.severity === "error" ? "alert" : undefined} className={cn("flex gap-3 border px-3.5 py-3 text-[13.5px] leading-snug", s.wrap)}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              {!compact && <strong className="mr-1 font-semibold">{s.label}:</strong>}
              {i.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
