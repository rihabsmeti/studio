import AdminClearanceView from "@/components/app/admin-clearance-view";
import ClearanceForm from "@/components/app/clearance-form";

export default function ClearancePage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const role = searchParams?.role || 'Student';

  if (role === 'Admin') {
    return <AdminClearanceView />;
  }
  
  // Default to student view
  return <ClearanceForm />;
}
