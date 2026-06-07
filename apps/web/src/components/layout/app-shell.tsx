import { type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { AppSidebar } from "./app-sidebar";

type Props = {
  section: "dashboard" | "admin";
  children: ReactNode;
};

export function AppShell({ section, children }: Props) {
  return (
    <Container className="py-6 lg:py-8">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar section={section} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
