import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar({ showAdmin = false }: { showAdmin?: boolean }) {
  return (
    <nav className="border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" prefetch className="text-lg font-black text-emerald-800">
          InkGate
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
          <Link href="/dashboard" prefetch className="rounded px-3 py-2 hover:bg-emerald-50">
            Dashboard
          </Link>
          <Link href="/mangas" prefetch className="rounded px-3 py-2 hover:bg-emerald-50">
            Mangas
          </Link>
          {showAdmin && (
            <Link href="/admin" prefetch className="rounded px-3 py-2 hover:bg-emerald-50">
              Admin
            </Link>
          )}
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
