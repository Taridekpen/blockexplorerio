import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            B
          </div>
          <span className="text-base font-semibold text-zinc-900 sm:text-lg">
            BlockExplorer
          </span>
        </Link>
        <div className="min-w-0 flex-1 sm:max-w-xl">
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}
