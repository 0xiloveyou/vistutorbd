"use client";

import { useGetMe } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AccessDenied from "./AccessDenied";
import AuthLoading from "./AuthLoading";

export default function RoleGuard({ children, roles }) {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const user = data?.data;
  const isAuthorized = Boolean(user) && roles.includes(user.role);

  useEffect(() => {
    if (isPending) return;
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) return <AuthLoading />;
  if (isError || !user) return <AuthLoading label="Redirecting to login..." />;
  if (!isAuthorized) return <AccessDenied />;

  return children;
}
