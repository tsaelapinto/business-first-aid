import Navbar from "@/components/Navbar";
import CasesTable from "@/components/CasesTable";

export const metadata = {
  title: "Back Office Dashboard | Business First Aid",
};

export default function BackofficePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[var(--foreground)]">Back Office</h1>
          <p className="text-[var(--muted)] mt-1">
            Review, triage, and route incoming business cases.
          </p>
        </div>
        <CasesTable />
      </main>
    </div>
  );
}
