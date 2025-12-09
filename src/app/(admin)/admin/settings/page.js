import { getStoreSettings } from "@/features/admin/settingsActions";
import SettingsForm from "@/features/admin/components/SettingsForm";

export const metadata = {
  title: "Payment Settings | Admin",
};

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Configure your WhatsApp ordering and UPI details.</p>
      
      <SettingsForm initialSettings={settings} />
    </div>
  );
}