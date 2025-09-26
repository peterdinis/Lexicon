import AuthWrapper from "@/components/auth/AuthWrapper";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <AuthWrapper>
      <SignIn />
    </AuthWrapper>
  );
}
