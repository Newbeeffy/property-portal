import { AnalysisSubNav } from "@/components/analysis/sub-nav";

export default function AnalysisLayout({
  children,
}: LayoutProps<"/analysis">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b bg-muted/50 px-6">
        <h1 className="text-lg font-semibold">Property Market Analysis</h1>
      </header>
      <AnalysisSubNav />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
