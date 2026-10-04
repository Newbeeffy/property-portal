import { EstimatorSubNav } from "@/components/estimator/sub-nav";

export default function EstimatorLayout({
  children,
}: LayoutProps<"/estimator">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b bg-muted/50 px-6">
        <h1 className="text-lg font-semibold">Property Value Estimator</h1>
      </header>
      <EstimatorSubNav />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
