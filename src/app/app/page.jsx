import { redirect } from "next/navigation";

export const metadata = { title: "Application", description: "Open the VizTutorBD learning application." };
export default function AppRoute() { redirect("/learn"); }
