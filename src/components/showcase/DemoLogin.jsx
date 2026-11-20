"use client";

import { useLogin } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DEMO = {
  user: { email: "user@mathlearn.local", password: "User@12345", role: "USER", destination: "/learn" },
  admin: { email: "admin@mathlearn.local", password: "Admin@12345", role: "ADMIN", destination: "/admin" },
};

export default function DemoLogin({ role }) {
  const router = useRouter();
  const login = useLogin();
  const account = DEMO[role];
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    login.mutateAsync({ email: account.email, password: account.password }).then(() => {
      if (active) { router.replace(account.destination); router.refresh(); }
    }).catch((caught) => { if (active) setError(apiErrorMessage(caught, "Demo login failed.")); });
    return () => { active = false; };
  // The route fixes role for the lifetime of this page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <main className="auth-shell"><section className="auth-card"><span className="auth-kicker">$ demo login --role={account.role.toLowerCase()}</span><h1>{login.isPending ? "Signing you in…" : "Demo sign in"}</h1><p className="auth-muted">{login.isPending ? "Connecting to the configured demo account." : error || "The demo account could not be reached. Check that the API is running and demo users are seeded."}</p>{error ? <button type="button" className="auth-submit" onClick={()=>{setError(""); login.mutate({email:account.email,password:account.password},{onSuccess:()=>{router.replace(account.destination);router.refresh();},onError:(caught)=>setError(apiErrorMessage(caught,"Demo login failed."))});}}>Try again</button> : null}</section></main>;
}
