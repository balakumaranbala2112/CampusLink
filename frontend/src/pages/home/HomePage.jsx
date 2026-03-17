import useAuthStore from "@/store/auth.store";
import Button from "@/components/ui/Button";

const HomePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-campus-surface">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-primary-600">🔗 campusLink</h1>
          <Button variant="secondary" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Welcome card */}
        <div className="bg-white rounded-xl p-6 border border-campus-border">
          <h2 className="text-xl font-semibold text-campus-dark mb-2">
            Welcome to campusLink! 🎓
          </h2>
          <p className="text-campus-muted">You are logged in successfully.</p>
          {user && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-campus-mid">
                User ID:{" "}
                <span className="font-mono text-primary-600">{user._id}</span>
              </p>
            </div>
          )}
          <p className="text-sm text-campus-muted mt-4">
            Feed, profile, and other features coming in Days 13-18.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
