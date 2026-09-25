"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { applyCatalogOverrides, applyPackageOverrides, OVERRIDES_KEY, readOverrides, type Overrides } from "@/services/admin-overrides";
import { subscribeStorage } from "@/services/storage";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";

interface Value {
  catalog: Catalog;
  packages: TourPackage[];
}
const CatalogContext = createContext<Value | null>(null);

/**
 * Receives the catalogue from the server (service layer) and, in the browser, layers on any demo admin edits.
 * Every client component reads the catalogue from here — nothing imports static data directly.
 */
export function CatalogProvider({ catalog, packages, children }: { catalog: Catalog; packages: TourPackage[]; children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides | null>(null);
  useEffect(() => {
    setOverrides(readOverrides());
    return subscribeStorage(OVERRIDES_KEY, () => setOverrides(readOverrides()));
  }, []);
  const value = useMemo<Value>(
    () => (overrides ? { catalog: applyCatalogOverrides(catalog, overrides), packages: applyPackageOverrides(packages, overrides) } : { catalog, packages }),
    [catalog, packages, overrides]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

function useValue() {
  const v = useContext(CatalogContext);
  if (!v) throw new Error("CatalogProvider is missing");
  return v;
}
export const useCatalog = () => useValue().catalog;
export const usePackages = () => useValue().packages;
