import { redirect } from "next/navigation";

export default function StudentAccessPage() {
  redirect("/admin/students/manage?view=access");
}
