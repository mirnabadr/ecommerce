import { getCurrentUser } from "@/lib/auth/actions";
import { getOrders } from "@/lib/actions/orders";
import { ProfileLayout } from "@/components/ProfileLayout";
import { OrderCard } from "@/components/OrderCard";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = await getOrders();

  return (
    <ProfileLayout user={user}>
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </ProfileLayout>
  );
}

