import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, User, Car } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">Welcome to AdminPowerPanel</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your central hub for managing drivers and users.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin Portal
            </CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Access the admin dashboard via your profile menu if you have privileges.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Management
            </CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Admins can view, manage, and assign roles to users.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Driver Operations
            </CardTitle>
            <Car className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Create and manage driver profiles and unique codes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to get your system running.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
              <div>
                <h3 className="font-semibold">Sign Up & First Admin</h3>
                <p className="text-muted-foreground">The first user to sign up is automatically promoted to an administrator.</p>
              </div>
           </div>
           <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
              <div>
                <h3 className="font-semibold">Access Admin Dashboard</h3>
                <p className="text-muted-foreground">If you are an admin, find the 'Admin Dashboard' link in the user menu at the top-right.</p>
              </div>
           </div>
           <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
              <div>
                <h3 className="font-semibold">Manage Your Team</h3>
                <p className="text-muted-foreground">Use the dashboard to create drivers, manage users, and grant admin rights to others.</p>
              </div>
           </div>
        </CardContent>
      </Card>

    </div>
  );
}
