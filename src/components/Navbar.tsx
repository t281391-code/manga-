import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-lg font-black text-emerald-800">
          InkGate
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-emerald-50">
            Dashboard
          </Link>
          <Link href="/mangas" className="rounded px-3 py-2 hover:bg-emerald-50">
            Mangas
          </Link>
          <Link href="/admin" className="rounded px-3 py-2 hover:bg-emerald-50">
            Admin
          </Link>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
