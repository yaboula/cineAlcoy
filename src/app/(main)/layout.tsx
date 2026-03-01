// ──────────────────────────────────────────────────
// (main) Route Group — Layout with Header + Footer
// ──────────────────────────────────────────────────

import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { ProfileProvider } from "@/components/providers/ProfileProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ProfileProvider>
  );
}
