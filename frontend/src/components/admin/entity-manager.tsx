"use client";

import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/states";
import { deleteEntity, resetOverrides, upsertEntity, type EntityKind } from "@/services/admin-overrides";

export interface FieldDef {
  key: string;
  label: string;
  kind: "text" | "number" | "textarea" | "select" | "lines" | "multi";
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
  min?: number;
  max?: number;
  /** Custom conversion between the stored value and its editable text. */
  format?: (v: unknown) => string;
  parse?: (s: string) => unknown;
}

export interface ColumnDef<T> {
  header: string;
  cell: (item: T) => ReactNode;
}

type FormValue = string | string[];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function toForm(fields: FieldDef[], item: Record<string, unknown>): Record<string, FormValue> {
  const out: Record<string, FormValue> = {};
  for (const f of fields) {
    const v = item[f.key];
    if (f.format) out[f.key] = f.format(v);
    else if (f.kind === "lines") out[f.key] = Array.isArray(v) ? v.join("\n") : "";
    else if (f.kind === "multi") out[f.key] = Array.isArray(v) ? (v as string[]) : [];
    else out[f.key] = v == null ? "" : String(v);
  }
  return out;
}

export function EntityManager<T extends { id: string }>({ kind, title, description, items, columns, fields, blank, nameKey = "name", singular }: { kind: EntityKind; title: string; description: string; items: T[]; columns: ColumnDef<T>[]; fields: FieldDef[]; blank: () => T; nameKey?: string; singular: string }) {
  const [editing, setEditing] = useState<{ item: T; isNew: boolean } | null>(null);
  const [form, setForm] = useState<Record<string, FormValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => JSON.stringify(i).toLowerCase().includes(t)) : items;
  }, [items, q]);

  const open = (item: T, isNew: boolean) => {
    setEditing({ item, isNew });
    setForm(toForm(fields, item as unknown as Record<string, unknown>));
    setErrors({});
  };

  const save = () => {
    if (!editing) return;
    const errs: Record<string, string> = {};
    const next: Record<string, unknown> = { ...(editing.item as unknown as Record<string, unknown>) };
    for (const f of fields) {
      const raw = form[f.key];
      if (f.required && (raw === "" || (Array.isArray(raw) && raw.length === 0))) {
        errs[f.key] = `${f.label} is required`;
        continue;
      }
      if (f.parse) next[f.key] = f.parse(String(raw));
      else if (f.kind === "number") {
        const n = Number(raw);
        if (raw === "" || Number.isNaN(n)) errs[f.key] = `${f.label} must be a number`;
        else if (f.min != null && n < f.min) errs[f.key] = `${f.label} must be at least ${f.min}`;
        else if (f.max != null && n > f.max) errs[f.key] = `${f.label} must be at most ${f.max}`;
        else next[f.key] = n;
      } else if (f.kind === "lines") next[f.key] = String(raw).split("\n").map((l) => l.trim()).filter(Boolean);
      else if (f.kind === "multi") next[f.key] = raw;
      else next[f.key] = String(raw).trim();
    }
    if (Object.keys(errs).length) return setErrors(errs);
    if (editing.isNew) {
      const id = slug(String(next[nameKey] ?? "")) || `item-${Date.now()}`;
      if (items.some((i) => i.id === id)) return setErrors({ [nameKey]: "An item with this name already exists" });
      next.id = id;
      if ("slug" in next) next.slug = id;
    }
    upsertEntity(kind, next as { id: string });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        description={description}
        actions={<><Button variant="outline" size="sm" onClick={() => { if (window.confirm("Reset all demo edits to the original catalogue?")) resetOverrides(); }}><RotateCcw className="h-4 w-4" aria-hidden /> Reset demo edits</Button><Button size="sm" onClick={() => open(blank(), true)}><Plus className="h-4 w-4" aria-hidden /> Add {singular}</Button></>}
      />
      <p className="border border-brass/40 bg-brass/[0.07] px-4 py-2.5 text-[13px] text-[#6b4f1b]">Demo CRUD: changes are saved in this browser and applied to the planner and package pages that read the catalogue on the client. Static SEO pages keep the original data until a real backend is connected.</p>
      <div className="max-w-sm"><label htmlFor="em-q" className="sr-only">Search {title}</label><Input id="em-q" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {shown.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} found`} description="Adjust the search or add a new item." action={<Button onClick={() => open(blank(), true)}>Add {singular}</Button>} />
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-parchment/50"><tr>{columns.map((c) => <th key={c.header} scope="col" className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">{c.header}</th>)}<th scope="col" className="p-3 text-right text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">Actions</th></tr></thead>
            <tbody>
              {shown.map((item) => (
                <tr key={item.id} className="border-t border-line align-top hover:bg-parchment/25">
                  {columns.map((c) => <td key={c.header} className="p-3">{c.cell(item)}</td>)}
                  <td className="whitespace-nowrap p-3 text-right">
                    <button type="button" onClick={() => open(item, false)} className="inline-flex h-9 items-center gap-1.5 px-2 text-forest hover:bg-forest/5" aria-label={`Edit ${(item as unknown as Record<string, string>)[nameKey]}`}><Pencil className="h-4 w-4" /> Edit</button>
                    <button type="button" onClick={() => setToDelete(item)} className="inline-flex h-9 w-9 items-center justify-center text-burgundy hover:bg-burgundy/5" aria-label={`Delete ${(item as unknown as Record<string, string>)[nameKey]}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.isNew ? `Add ${singular}` : `Edit ${singular}`} side="right" className="!w-[min(96vw,600px)]">
        <form onSubmit={(e) => { e.preventDefault(); save(); }} noValidate className="space-y-5 p-5">
          {fields.map((f) => {
            const id = `ef-${f.key}`;
            const val = form[f.key] ?? "";
            const set = (v: FormValue) => setForm((p) => ({ ...p, [f.key]: v }));
            return (
              <Field key={f.key} label={f.label} htmlFor={id} error={errors[f.key]} hint={f.help} required={f.required}>
                {f.kind === "textarea" || f.kind === "lines" ? (
                  <Textarea id={id} rows={f.kind === "lines" ? 5 : 4} value={String(val)} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.key]} />
                ) : f.kind === "select" ? (
                  <Select id={id} value={String(val)} onChange={(e) => set(e.target.value)}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                ) : f.kind === "multi" ? (
                  <div id={id} className="grid max-h-52 gap-1 overflow-y-auto border border-line bg-paper p-3 sm:grid-cols-2" role="group" aria-label={f.label}>
                    {f.options?.map((o) => {
                      const arr = Array.isArray(val) ? val : [];
                      return (
                        <label key={o.value} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[13.5px]">
                          <input type="checkbox" className="h-4 w-4 accent-[#1d3a2f]" checked={arr.includes(o.value)} onChange={(e) => set(e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value))} />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <Input id={id} type={f.kind === "number" ? "number" : "text"} inputMode={f.kind === "number" ? "numeric" : undefined} value={String(val)} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.key]} />
                )}
              </Field>
            );
          })}
          <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-line bg-ivory px-5 py-4">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Sheet>

      <Sheet open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title={`Delete ${singular}?`} description={toDelete ? String((toDelete as unknown as Record<string, unknown>)[nameKey]) : undefined} side="center">
        <div className="flex justify-end gap-3 p-5">
          <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="burgundy" onClick={() => { if (toDelete) deleteEntity(kind, toDelete.id); setToDelete(null); }}>Delete</Button>
        </div>
      </Sheet>
    </div>
  );
}
