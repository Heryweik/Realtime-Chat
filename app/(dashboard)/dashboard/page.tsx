import Button from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

interface DashboardPageProps {

}

export default async function DashboardPage({}: DashboardPageProps) {

  // get the session of google
  const session = await getServerSession(authOptions);

  console.log(session);

  return (
    <pre>Dashboard</pre>
  )
}
