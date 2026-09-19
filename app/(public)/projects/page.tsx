import { redirect } from "next/navigation";

/** `/projects` has no index of its own — the initiatives page is the project listing. */
export default function ProjectsIndexPage() {
  redirect("/initiatives");
}
