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
        <CasesTable />
      </main>
    </div>
  );
}
