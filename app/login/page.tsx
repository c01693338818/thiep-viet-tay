import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Đăng nhập admin", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl p-6 ring-1 ring-foreground/10">
        <h1 className="mb-6 text-xl font-semibold">Đăng nhập admin</h1>
        <Suspense fallback={<LoginForm next="" />}>
          <LoginWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginWithNext({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const next = (await searchParams).next;
  return <LoginForm next={typeof next === "string" ? next : ""} />;
}
