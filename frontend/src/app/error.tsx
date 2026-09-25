"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-36">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error interrupted this page. Your trip plan is saved — you can try again or head back home."
        action={<><Button onClick={reset}>Try again</Button><ButtonLink href="/" variant="outline">Go home</ButtonLink></>}
      />
    </main>
  );
}
