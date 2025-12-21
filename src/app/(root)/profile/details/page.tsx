import { getCurrentUser } from "@/lib/auth/actions";
import { ProfileLayout } from "@/components/ProfileLayout";

export default async function DetailsPage() {
  const user = await getCurrentUser();

  return (
    <ProfileLayout user={user}>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Details</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600">
            TODO: Implement user details form (name, email, password change, etc.)
          </p>
        </div>
      </div>
    </ProfileLayout>
  );
}

