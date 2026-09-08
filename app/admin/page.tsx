import Link from "next/link";
import { isCurrentAdminAuthenticated } from "../admin-auth";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const authenticated = await isCurrentAdminAuthenticated();

  return (
    <main>
      <div className="workbench-page admin-page">
        <header className="minimal-header" aria-label="站点头部">
          <Link className="brand" href="/" aria-label="Gin Home">
            Gin
          </Link>
          <Link className="admin-back" href="/">
            返回公开站
          </Link>
        </header>
        <AdminClient initiallyAuthenticated={authenticated} />
      </div>
    </main>
  );
}
