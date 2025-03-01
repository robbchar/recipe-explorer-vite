import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">
            Dashboard
          </h1>
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 