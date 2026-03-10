import Navbar from "@/components/Navbar";
import TriageWizard from "@/components/TriageWizard";

export const metadata = {
  title: "Start Triage | Business First Aid",
};

export default function TriagePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <TriageWizard />
      </main>
    </div>
  );
}
