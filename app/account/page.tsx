export const dynamic = "force-dynamic";

import AccountPage from "../../components/auth/AccountPage";
import AccountSessionView from "../../components/account/AccountSessionView";
import { getServerSessionUser } from "../../lib/getServerSessionUser";

export default async function Page() {
  const user = await getServerSessionUser();

  if (!user) {
    return <AccountPage />;
  }

  return <AccountSessionView user={user} />;
}