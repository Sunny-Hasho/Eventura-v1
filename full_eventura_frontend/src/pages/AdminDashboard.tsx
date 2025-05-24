import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { userService, PageableUserResponse, UserResponse } from "@/services/userService";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [users, setUsers] = useState<PageableUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(currentPage, pageSize);
      setUsers(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "PROVIDER":
        return "bg-blue-100 text-blue-800";
      case "CLIENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          {/* User Management Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : users && users.content.length > 0 ? (
                <div className="space-y-4">
                  {users.content.map((user: UserResponse) => (
                    <div key={user.id} className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.mobileNumber}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusBadgeColor(user.accountStatus)}>
                            {user.accountStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        {user.accountStatus === "ACTIVE" ? (
                          <Button variant="destructive" size="sm">Suspend</Button>
                        ) : (
                          <Button variant="default" size="sm">Activate</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {currentPage + 1} of {users.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage >= users.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>

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
