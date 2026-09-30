import Link from "next/link";
import { Brand } from "@/components/ui";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line bg-card px-5">
        <div className="mx-auto flex h-16 max-w-xl items-center">
          <Link href="/" aria-label="CustomerHub">
            <Brand />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
