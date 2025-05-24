
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage platform users and content
          </p>
        </header>

        {/* Welcome Card */}
        <Card className="mb-6 bg-gradient-to-r from-eventura-800 to-eventura-950 text-white">
          <CardHeader>
            <CardTitle>Welcome, {user?.firstName}!</CardTitle>
            <CardDescription className="text-eventura-100">
              Platform administration and monitoring hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-eventura-100">
                  You have pending verification requests and reports to review.
                </p>
              </div>
              <Button variant="secondary" className="whitespace-nowrap">
                View Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Verifications</CardTitle>
              <CardDescription>Pending verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                      JD
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Jane Doe</h3>
                      <p className="text-sm text-gray-500">Photography Services</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">Review</Button>
                    <Button variant="destructive" size="sm" className="flex-1">Reject</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                      MS
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Mike Smith</h3>
                      <p className="text-sm text-gray-500">Catering Services</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">Review</Button>
                    <Button variant="destructive" size="sm" className="flex-1">Reject</Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">View All Verifications</Button>
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>Recent request activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Corporate Event</h3>
                      <p className="text-sm text-gray-500">Created by: John Doe</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>4 pitches received</p>
                    <p className="mt-1">Posted: May 2, 2025</p>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Wedding Planning</h3>
                      <p className="text-sm text-gray-500">Created by: Sarah Johnson</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Reported
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>1 report flagged</p>
                    <p className="mt-1">Posted: April 25, 2025</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">View All Requests</Button>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>Current platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="text-2xl font-bold text-eventura-700">158</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                  </div>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="text-2xl font-bold text-eventura-700">42</div>
                    <div className="text-sm text-gray-500">New Users (30d)</div>
                  </div>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="text-2xl font-bold text-eventura-700">86</div>
                    <div className="text-sm text-gray-500">Open Requests</div>
                  </div>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="text-2xl font-bold text-eventura-700">23</div>
                    <div className="text-sm text-gray-500">Completed Events</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">View Full Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
