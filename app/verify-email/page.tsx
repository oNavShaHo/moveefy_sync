import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic"; // 🔥 IMPORTANT

export default function Page() {
  return (
    <Suspense fallback={<p className="text-white">Loading...</p>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
