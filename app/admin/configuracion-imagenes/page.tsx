import ImageSettingsClient from "../../../components/admin/ImageSettingsClient";
import { getHomeImageSettings } from "../../../lib/site-image-settings";

export const dynamic = "force-dynamic";

export default async function ImageSettingsPage() {
  const initialSettings = await getHomeImageSettings();
  return <ImageSettingsClient initialSettings={initialSettings} />;
}
