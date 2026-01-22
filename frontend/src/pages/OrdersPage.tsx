import { useSelector } from 'react-redux';
import { RootState } from '../store';

const OrdersPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Track and manage your orders.</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
            <p className="text-sm text-gray-400 mt-2">Your order history will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
