import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Gallery",
  description: "Discover and share vibe-coded projects.",
};

async function signOut() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-black">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm font-medium">
                Vibe Gallery &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-black bg-[#f2f0ea] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="text-xl font-black tracking-tight">
            Vibe Gallery
          </a>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <a
                  href="/submit"
                  className="text-sm font-bold uppercase tracking-wide hover:underline"
                >
                  + Submit
                </a>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm font-bold border border-black px-4 py-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <a
                href="/login"
                className="text-sm font-bold border border-black px-4 py-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors"
              >
                Sign In
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
