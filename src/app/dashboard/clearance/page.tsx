import AdminClearanceView from "@/components/app/admin-clearance-view";
import ClearanceForm from "@/components/app/clearance-form";
import FinanceClearanceView from "@/components/app/finance-clearance-view";
import SecurityClearanceView from "@/components/app/security-clearance-view";

export default function ClearancePage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const role = searchParams?.role || 'Student';

  if (role === 'Admin') {
    return <AdminClearanceView />;
  }

  if (role === 'Finance') {
    return <FinanceClearanceView />;
  }

  if (role === 'Security') {
    return <SecurityClearanceView />;
  }
  
  // Default to student view
  return <ClearanceForm />;
}
