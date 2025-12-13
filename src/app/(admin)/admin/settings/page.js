import { getStoreSettings } from "@/features/admin/settings/actions";
import SettingsLayout from "@/features/admin/settings/components/SettingsLayout";

export const metadata = {
  title: "Store Settings | Admin",
};

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-6xl mx-auto p-6">
       <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Store Configuration</h1>
          <p className="text-sm text-gray-500">Manage payments, shipping, and store preferences.</p>
       </div>
       
       <SettingsLayout initialSettings={settings} />
    </div>
  );
}