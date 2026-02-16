import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UpdateUserRequest } from "@/types/auth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BackButton from "@/components/BackButton";

const Profile = () => {
  const { authState, updateProfile, deleteAccount } = useAuth();
  const { isAuthenticated, user, loading } = authState;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
  });
  const [password, setPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    document.title = "My Profile | Eventura";

    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: UpdateUserRequest = {
        ...formData,
        ...(password ? { password } : {})
      };
      
      await updateProfile(updateData);
      setIsEditing(false);
      setPassword("");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      });
    }
    setPassword("");
    setIsEditing(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-br from-[#849fe3] to-[#4a6eb0]';
      case 'CLIENT':
        return 'bg-gradient-to-br from-[#8184b3] to-[#4a6eb0]';
      case 'PROVIDER':
        return 'bg-gradient-to-br from-[#849fe3] to-[#8184b3]';
      default:
        return 'bg-gradient-to-br from-[#849fe3] to-[#4a6eb0]';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-[#849fe3] border-[#849fe3]';
      case 'CLIENT':
        return 'text-[#8184b3] border-[#8184b3]';
      case 'PROVIDER':
        return 'text-[#4a6eb0] border-[#4a6eb0]';
      default:
        return 'text-[#849fe3] border-[#849fe3]';
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center">
              <BackButton />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
            </div>
          </div>
          <div className="rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className={cn("h-64 relative", getRoleGradient(user?.role || 'ADMIN'))}>
              <div className="absolute right-16 top-8">
                <div className="w-40 h-40 rounded-full bg-white/20 border-4 border-white/20 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-12 relative">
              <div className={cn(
                "absolute -top-4 right-10 bg-white rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg",
                getRoleBadgeColor(user?.role || 'ADMIN')
              )}>
                {user?.role}
              </div>


              <div className="mb-10">
                <h2 className="text-3xl font-medium text-[#2c2c2c] mb-1.5">
                  Hello, {user?.firstName}
                </h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Active Now</span>
                  </div>
                  <span className="text-sm">•</span>
                  <div className="text-sm">
                    Member since {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
                <p className="text-lg text-gray-600 font-normal mt-2">Welcome to your profile.</p>
                
                {user?.role === 'PROVIDER' && (
                  <div className="mt-4">
                    <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Link to="/provider/profile">Manage Provider Profile</Link>
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-gray-500">First Name</Label>
                    <Input
                      name="firstName"
                      value={formData.firstName} 
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={cn(
                        "bg-transparent border-gray-200 text-base h-10",
                        !isEditing && "border-none"
                      )}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-gray-500">Last Name</Label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={cn(
                        "bg-transparent border-gray-200 text-base h-10",
                        !isEditing && "border-none"
                      )}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-gray-500">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly={true}
                      className="bg-transparent border-gray-200 text-base h-10 border-none text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-gray-500">Mobile Number</Label>
                    <Input
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={cn(
                        "bg-transparent border-gray-200 text-base h-10",
                        !isEditing && "border-none"
                      )}
                    />
                  </div>
                </div>

                {/* Password Change Removed from here - moved to specialized modal */}

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  {user?.authProvider !== 'GOOGLE' ? (
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Signed in with Google
                    </div>
                  )}

                  <div className="flex space-x-3">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="gap-2 h-9"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-9"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="h-9">
                        Save Changes
                      </Button>
                    </>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2 h-9">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </form>

              <div className="absolute bottom-6 left-12 text-xs text-gray-500 tracking-wider">
                Copyright © Eventura. ALL RIGHTS RESERVED
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        email={user?.email || ""}
      />
    </div>
  );
};

// -- Internal Component for Change Password Modal --
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/services/authService";

const ChangePasswordModal = ({ isOpen, onClose, email }: { isOpen: boolean; onClose: () => void; email: string }) => {
  const [step, setStep] = useState<"INIT" | "OTP">("INIT");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { authState } = useAuth();
  const token = localStorage.getItem("token"); // Or however we get token, assuming useAuth doesn't expose it directly yet, but usually it's in localStorage or cookie.
  // Actually useAuth might need to expose token or we get it from storage.
  // Let's assume localStorage "token" for now as per common patterns, or modifying useAuth if needed.

  const handleInitiate = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) throw new Error("Not authenticated");
      
      await authService.initiateChangePassword(email, storedToken);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
      setStep("OTP");
    } catch (error) {
       toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (newPassword !== confirmPassword) {
      toast({
         title: "Error",
         description: "Passwords do not match",
         variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) throw new Error("Not authenticated");

      await authService.changePassword(email, otp, newPassword, storedToken);
      toast({
        title: "Success",
        description: "Password changed successfully. Please login again.",
      });
      onClose();
      // Optional: Logout user
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        setStep("INIT");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            {step === "INIT" 
              ? "We will send a One-Time Password (OTP) to your email to verify your identity."
              : "Enter the OTP sent to your email and your new password."}
          </DialogDescription>
        </DialogHeader>

        {step === "INIT" ? (
             <div className="py-4">
                 <p className="text-sm text-gray-500 mb-4">Email: {email}</p>
                 <Button onClick={handleInitiate} disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send OTP"}
                 </Button>
             </div>
        ) : (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>OTP Code</Label>
                    <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" />
                </div>
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                </div>
                <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
                <Button onClick={handleConfirm} disabled={isLoading} className="w-full">
                    {isLoading ? "Updating..." : "Update Password"}
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
