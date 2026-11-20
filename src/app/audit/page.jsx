import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ShowcasePage, ShowcaseSection, ShowcaseCards } from "@/components/showcase/ShowcasePage";
export const metadata = { title: "Global audit report" };
export default async function AuditPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  let user = null;
  try {
    const response = await fetch(`${process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"}/auth/me`, { cache: "no-store", headers: { cookie: cookieHeader } });
    if (response.ok) {
      const payload = await response.json();
      user = payload?.data ?? payload?.user ?? null;
    }
  } catch {
    user = null;
  }
  if (!user || user.role !== "ADMIN") redirect("/login?next=/audit");
  return <ShowcasePage kicker="ADMIN ONLY · REVIEW DATE 20 NOV 2026" title="Platform audit snapshot" intro="A transparent snapshot of the controls represented in the current application. Deployment and policy evidence should be reviewed alongside this report."><ShowcaseCards items={[["Security", "Session-based authentication and role checks exist. Admin routes are protected. Infrastructure hardening and independent penetration testing are outside this code review."],["Privacy", "Account and learning activity are handled by the API. Review the deployed privacy notice, retention practices and processor agreements before production use."],["Governance", "Admin and moderator workflows exist for user and community management. Keep operational access limited and review account changes."],["Responsible AI", "AI responses support learning and may require human review. Verify content quality and age-appropriate handling in the deployed provider configuration."],["Data sovereignty", "Data location depends on the configured database, hosting and AI providers. Confirm deployment region and cross-border processing with operators."],["Risk", "Public demo credentials are convenient for judging but grant a demo admin account. Use a non-sensitive environment and rotate/disable after evaluation."]]}/><ShowcaseSection title="Evidence and follow-up"><p>This snapshot is based on the app routes, role guards and declared architecture. It is not a compliance certification. Before production rollout, document deployed infrastructure, retention and deletion procedures, provider locations, incident contacts and test evidence.</p><p><a href="/admin">Open administrator console →</a></p></ShowcaseSection></ShowcasePage>;
}
