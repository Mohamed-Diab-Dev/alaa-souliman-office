import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCitizenSession } from "@/lib/auth/citizen";
import { Emblem } from "@/components/emblem";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const citizen = await getCitizenSession();
  if (citizen) redirect("/requests");

  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/requests";

  return (
    <main className="pattern-grid flex-1">
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="rounded-[2rem] bg-white p-8 card-shadow">
          <Emblem className="mx-auto h-16 w-16" />
          <h1 className="mt-4 text-center text-3xl font-black text-forest">دخول المواطن</h1>
          <p className="mt-2 text-center leading-8 text-muted">
            الدخول بالرقم القومي ورقم التليفون المسجّلين في المكتب.
          </p>
          <div className="mt-8">
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
