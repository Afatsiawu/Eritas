# AdminPowerPanel: Full Application Code & Pseudocode

This document contains the complete source code for the AdminPowerPanel application, consolidated into a single file for review purposes. The application is built with Next.js, React, and Tailwind CSS, and uses a mock API for data persistence in the browser's local storage.

---
## 1. Pseudocode Overview
---

This section outlines the high-level structure and logic of the application.

### 1.1. Application Entry Point & Core Layout (`/src/app/layout.tsx`)

```
PROCEDURE initialize_application_layout
  INPUT: page_content

  // Set up the main HTML structure for all pages.
  CREATE HTML document with language "en" and custom fonts.
  
  // Wrap the entire app in the AuthProvider to manage user sessions.
  RENDER AuthProvider
    // Place the content of the currently active page.
    DISPLAY page_content
  END RENDER

  // Add a global notification system (Toaster) at the root level.
  RENDER Toaster

END PROCEDURE
```

### 1.2. Main Application Structure

#### 1.2.1. Home Page (`/src/app/home/page.tsx`)

```
PAGE HomePage
  RENDER Header component.
  RENDER main content area.
    DISPLAY a welcome title and description.
    DISPLAY info cards for "Admin Portal", "User Management", and "Driver Operations".
    DISPLAY a "Getting Started" guide with steps for using the app.
END PAGE
```

#### 1.2.2. User Avatar & Account Deletion (`/src/components/auth/user-avatar.tsx`)

```
COMPONENT UserAvatar
  STATE: isDeleteDialogOpen, isDeleting

  GET user and deleteAccount function from AuthProvider.
  IF no user is logged in THEN
    DISPLAY "Sign In" button.
    RETURN
  END IF

  // When the user is logged in, display an avatar dropdown menu.
  RENDER DropdownMenu with user's initial as the trigger.
    DISPLAY user's email.
    MENU_ITEM "Home" (links to /home).
    IF user is admin THEN
      MENU_ITEM "Admin Dashboard" (links to /admin).
    END IF
    MENU_ITEM "Delete Account" (styled in red).
      ON CLICK: SET isDeleteDialogOpen = true.
    MENU_ITEM "Log out".
  
  // Confirmation dialog for account deletion.
  RENDER AlertDialog (visible when isDeleteDialogOpen is true).
    DISPLAY title "Are you absolutely sure?".
    DISPLAY description about permanent deletion.
    BUTTON "Cancel".
    BUTTON "Delete Account".
      ON CLICK:
        SET isDeleting = true.
        CALL deleteAccount function.
        // On success, user is logged out automatically.
        // On failure, show an error toast.
END COMPONENT
```

### 1.3. Admin Section

#### 1.3.1. Admin Layout & Sidebar (`/src/app/admin/layout.tsx` & `.../admin-sidebar.tsx`)

```
LAYOUT AdminLayout
  // This layout protects all pages under the /admin route.
  ON LOAD:
    GET user and loading state from AuthProvider.
    IF NOT loading AND (user is not logged in OR user is not an admin) THEN
      REDIRECT to '/admin/access-denied'.
    END IF
  
  // Show a loading screen while validating the user's role.
  IF loading OR user is not an admin THEN
    DISPLAY full-screen loading spinner.
  ELSE
    // If validation passes, render the admin interface.
    DISPLAY AdminSidebar on the left.
    DISPLAY the specific admin page content on the right.
  END IF

COMPONENT AdminSidebar
  // This is the navigation menu for the admin section.
  RENDER a collapsible sidebar.
    RENDER SidebarHeader with the app name and a home link.
    RENDER SidebarMenu.
      MENU_ITEM "Dashboard" (links to /admin).
      MENU_ITEM "Make Admin" (links to /admin/make-admin).
    RENDER SidebarFooter containing the UserAvatar component and a "Log Out" button.
END COMPONENT
```

#### 1.3.2. Admin Dashboard Page (`/src/app/admin/page.tsx`)

```
PAGE AdminDashboardPage
  DISPLAY a main title "Admin Dashboard" and a descriptive subtitle.

  // Arrange the primary actions in a responsive grid.
  CREATE a grid layout (1 column on mobile, 3 on desktop).

  GRID_COLUMN 1:
    RENDER DriverCreationForm component.
    // This form allows admins to input new driver details.

  GRID_COLUMN 2 (spans 2 columns on desktop):
    // Use Suspense to show a loader while data is being fetched.
    SUSPENSE (fallback: Skeleton loader):
      RENDER UserManagementTable component.
      // This table fetches and displays all registered users.

  // Display the driver management table below the grid.
  CREATE a new section.
    SUSPENSE (fallback: Skeleton loader):
      RENDER DriverManagementTable component.
      // This table fetches and displays all created drivers.
END PAGE
```

#### 1.3.3. Make Admin Page (`/src/app/admin/make-admin/page.tsx`)

```
PAGE MakeAdminPage
  DISPLAY a main title "Make Admin" and a descriptive subtitle.
  RENDER MakeAdminForm component in a container.

COMPONENT MakeAdminForm
  STATE: loading
  FORM_FIELDS: email

  FUNCTION grantAdminPrivileges:
    SET loading = true.
    GET the email from the form input.
    
    CALL mock API to 'makeAdmin(email)'.
    
    ON SUCCESS:
      SHOW success toast message.
      CLEAR the email input field.
    ON FAILURE:
      SHOW error toast message.
    
    SET loading = false.
  
  // Render the component UI.
  RENDER Card component with a form to enter a user's email and a "Grant Privileges" button.
END COMPONENT
```

#### 1.3.4. Data Management Components

```
COMPONENT UserManagementTable
  STATE: users, loading, error, userToDelete
  
  ON_LOAD:
    FETCH all users from the mock API and populate the 'users' state.
    
  FUNCTION handleDeleteClick(user):
    SET userToDelete = user.
    SHOW deletion confirmation dialog.
    
  FUNCTION handleDeleteConfirm:
    CALL mock API to delete 'userToDelete'.
    IF deleted user is the current admin THEN
      LOG out.
    ELSE
      REFRESH user list.
    END IF
    SHOW success or error toast.

  // Render a table displaying each user's Full Name, Email, Wallet Balance, and Role.
  // Each row includes an actions menu with a "Delete" option.

COMPONENT DriverManagementTable
  STATE: drivers, loading, error, driverToDelete

  ON_LOAD:
    FETCH all drivers from the mock API.
  
  FUNCTION handleDeleteClick(driver):
    SET driverToDelete = driver.
    SHOW deletion confirmation dialog.
  
  FUNCTION handleDeleteConfirm:
    CALL mock API to delete 'driverToDelete'.
    REFRESH driver list.
    SHOW success or error toast.

  // Render a table displaying driver details: Full Name, Email, License Number, Ghana Card, Bus Plate, and Registration Code.
  // Each row includes an actions menu with a "Delete" option.

COMPONENT DriverCreationForm
  STATE: isLoading, generatedCode
  FORM_FIELDS: fullName, email, licenseNumber, ghanaCardNumber, busPlateNumber

  ON SUBMIT:
    SET isLoading = true.
    CALL mock API to 'generateDriverCode' with form values.
    ON SUCCESS:
      SET generatedCode state with the new code.
      SHOW success toast.
      RESET form.
    ON FAILURE:
      SHOW error toast.
    SET isLoading = false.
  
  // Render a form for creating a new driver.
  // After successful submission, display the generated one-time registration code.
```

---
## 2. Full Application Code
---

### File: `/next.config.ts`
```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

### File: `/package.json`
```json
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/google-genai": "^1.1.2",
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^10.12.3",
    "firebase-admin": "^12.2.0",
    "genkit": "^1.1.2",
    "lucide-react": "^0.475.0",
    "next": "15.5.9",
    "patch-package": "^8.0.0",
    "react": "^19.2.1",
    "react-day-picker": "^9.11.3",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.52.1",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

### File: `/tailwind.config.ts`
```typescript
import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
       fontFamily: {
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
          accent: {
            DEFAULT: 'hsl(var(--sidebar-accent))',
            foreground: 'hsl(var(--sidebar-accent-foreground))',
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### File: `/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### File: `/src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 13% 96%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 231 48% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 174 100% 29%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 231 48% 48%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 231 48% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 174 100% 29%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 231 48% 48%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

body {
  font-family: 'Inter', sans-serif;
}
```

### File: `/src/app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata: Metadata = {
  title: 'AdminPowerPanel',
  description: 'Generated by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

### File: `/src/app/page.tsx`
```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/home');
}
```

### File: `/src/app/(auth)/login/page.tsx`
```typescript
'use client';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleAuthSuccess = () => {
    router.push('/home');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### File: `/src/app/admin/access-denied/page.tsx`
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You do not have the required permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please contact an administrator if you believe this is a mistake.
          </p>
          <Button asChild className="mt-6">
            <Link href="/home">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### File: `/src/app/admin/layout.tsx`
```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace('/admin/access-denied');
    }
  }, [user, loading, router]);

  if (loading || !user || !user.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
```

### File: `/src/app/admin/page.tsx`
```typescript
import { Suspense } from 'react';
import { UserManagementTable, UserManagementTableSkeleton } from '@/components/admin/user-management-table';
import { DriverCreationForm } from '@/components/admin/driver-creation-form';
import { DriverManagementTable, DriverManagementTableSkeleton } from '@/components/admin/driver-management-table';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, drivers, and system settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DriverCreationForm />
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<UserManagementTableSkeleton />}>
            <UserManagementTable />
          </Suspense>
        </div>
      </div>

      <div>
        <Suspense fallback={<DriverManagementTableSkeleton />}>
            <DriverManagementTable />
        </Suspense>
      </div>
    </div>
  );
}
```

### File: `/src/app/admin/make-admin/page.tsx`
```typescript
import { MakeAdminForm } from "@/components/admin/make-admin-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MakeAdminPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Make Admin</h1>
                <p className="text-muted-foreground">Grant administrative privileges to a user.</p>
            </div>
            <div className="max-w-xl">
                 <MakeAdminForm />
            </div>
        </div>
    )
}
```

### File: `/src/app/home/layout.tsx`
```typescript
import { Header } from '@/components/layout/header';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
```

### File: `/src/app/home/page.tsx`
```typescript
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
```

### File: `/src/lib/definitions.ts`
```typescript
'use server';
import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    isAdmin: z.boolean(),
    walletBalance: z.number(),
});
export type User = z.infer<typeof UserSchema>;


export const DriverSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    licenseNumber: z.string(),
    ghanaCardNumber: z.string(),
    busPlateNumber: z.string(),
    registrationCode: z.string(),
});
export type Driver = z.infer<typeof DriverSchema>;


// Types for generateDriverCode action
export const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

export const GenerateDriverCodeOutputSchema = z.object({
  registrationCode: z.string(),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;

// Types for listUsers action
export const ListUsersOutputSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    walletBalance: z.number().optional(),
  })),
});
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;

// Types for deleteUser action
export const DeleteUserInputSchema = z.object({
  userId: z.string(),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export const DeleteUserOutputSchema = z.object({
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


// Types for listDrivers action
export const ListDriversOutputSchema = z.array(DriverSchema);
export type ListDriversOutput = z.infer<typeof ListDriversOutputSchema>;


// Types for deleteDriver action
export const DeleteDriverInputSchema = z.object({
  driverId: z.string(),
});
export type DeleteDriverInput = z.infer<typeof DeleteDriverInputSchema>;

export const DeleteDriverOutputSchema = z.object({
  message: z.string(),
});
export type DeleteDriverOutput = z.infer<typeof DeleteDriverOutputSchema>;


// Types for makeAdmin action
export const MakeAdminInputSchema = z.object({
    email: z.string().email(),
});
export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;

export const MakeAdminOutputSchema = z.object({
    message: z.string(),
});
export type MakeAdminOutput = z.infer<typeof MakeAdminOutputSchema>;
```

### File: `/src/lib/mock-api.ts`
```typescript
// This file mocks a backend API for demonstration purposes.
// In a real application, these functions would make network requests to a server.

import { User, Driver } from './definitions';

const mockApi = (delay = 500) => new Promise(resolve => setTimeout(resolve, delay));

// --- User Management ---

export async function listUsers(): Promise<User[]> {
  await mockApi();
  const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
  // Ensure each user object has an 'id' property matching its key (email) and default walletBalance
  return Object.keys(allUsers).map(email => ({
    id: email,
    walletBalance: 0, // Default wallet balance if not present
    ...allUsers[email]
  }));
}

export async function makeAdmin(email: string): Promise<{ message: string }> {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (!allUsers[email]) {
        throw new Error(`User with email ${email} not found.`);
    }
    if (allUsers[email].isAdmin) {
        return { message: `${email} is already an admin.` };
    }
    allUsers[email].isAdmin = true;
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // also update current user if they are the one being made admin
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if(currentUser && currentUser.email === email) {
        currentUser.isAdmin = true;
        localStorage.setItem('user', JSON.stringify(currentUser));
    }

    return { message: `Successfully made ${email} an admin.` };
}

export async function deleteUser({ userId }: { userId: string }): Promise<{ success: boolean }> {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (allUsers[userId]) {
        delete allUsers[userId];
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    return { success: true };
}


// --- Driver Management ---

export async function generateDriverCode(driverDetails: Omit<Driver, 'id' | 'registrationCode'>): Promise<{ registrationCode: string }> {
    await mockApi();
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const registrationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newDriver: Driver = {
        ...driverDetails,
        id: driverDetails.email, // using email as ID for simplicity
        registrationCode,
    };
    drivers.push(newDriver);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return { registrationCode };
}


export async function listDrivers(): Promise<Driver[]> {
    await mockApi();
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    return drivers;
}

export async function deleteDriver({ driverId }: { driverId: string }): Promise<{ success: boolean }> {
    await mockApi();
    let drivers: Driver[] = JSON.parse(localStorage.getItem('drivers') || '[]');
    drivers = drivers.filter(driver => driver.id !== driverId);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return { success: true };
}
```

### File: `/src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### File: `/src/components/auth/auth-provider.tsx`
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { deleteUser as deleteUserAction } from '@/lib/mock-api';

const mockApi = (delay = 500) => new Promise(resolve => setTimeout(resolve, delay));

interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  walletBalance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, fullName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (!allUsers[email]) {
      throw new Error("User not found. Please sign up first.");
    }
    const userData = { id: email, ...allUsers[email] };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  };
  
  const signup = async (email: string, fullName: string) => {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (allUsers[email]) {
      throw new Error("An account with this email already exists.");
    }
    const isFirstUser = Object.keys(allUsers).length === 0;
    allUsers[email] = { email, fullName, isAdmin: isFirstUser, walletBalance: 0 };
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteUserAction({ userId: user.email });
    logout();
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### File: `/src/components/auth/auth-form.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const signUpSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.'}),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '' },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const handleSignIn = async (data: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email);
      toast({ title: 'Signed in successfully!' });
      onAuthSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.fullName);
      await login(data.email); // Auto-login after signup
      toast({ title: 'Account created successfully!' });
      onAuthSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 pt-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="signup">
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 pt-4">
            <FormField
              control={signUpForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
```

### File: `/src/components/auth/user-avatar.tsx`
```typescript
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Shield, Trash2, User as UserIcon } from 'lucide-react';

export function UserAvatar() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out successfully.' });
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({ title: 'Account deleted successfully.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
      });
      setIsDeleting(false);
    }
  };


  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/home">
              <UserIcon className="mr-2" />
              Home
            </Link>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem asChild>
                <Link href="/admin">
                    <Shield className="mr-2" />
                    Admin Dashboard
                </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 focus:text-red-500">
            <Trash2 className="mr-2" />
            Delete Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### File: `/src/components/admin/admin-sidebar.tsx`
```typescript
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Home, Shield, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserAvatar } from '../auth/user-avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '../auth/auth-provider';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';


export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out successfully.' });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/home" className="flex items-center gap-2">
             <Car className="h-6 w-6 text-primary" />
             <span className="font-semibold text-lg">AdminPowerPanel</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" isActive={isActive('/admin')}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/make-admin" isActive={isActive('/admin/make-admin')}>
                <Shield />
                Make Admin
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
            <UserAvatar />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
```

### File: `/src/components/admin/driver-creation-form.tsx`
```typescript
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ClipboardCopy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { generateDriverCode } from '@/lib/mock-api';
import type { GenerateDriverCodeInput } from '@/lib/definitions';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function DriverCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      licenseNumber: '',
      ghanaCardNumber: '',
      busPlateNumber: '',
    },
  });

  const onSubmit = async (values: GenerateDriverCodeInput) => {
    setIsLoading(true);
    setGeneratedCode(null);
    try {
      const result = await generateDriverCode(values);
      if (result.registrationCode) {
        setGeneratedCode(result.registrationCode);
        toast({
          title: 'Registration Code Generated',
          description: `The code for ${values.fullName} is ${result.registrationCode}.`,
        });
        form.reset();
      } else {
        throw new Error("Failed to get registration code from backend.");
      }
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: error.message || 'Failed to generate driver registration code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Driver</CardTitle>
        <CardDescription>Generate a one-time registration code for a new driver.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="driver@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="B123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ghanaCardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghana Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GHA-123456789-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="busPlateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GT-1234-22" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Code
            </Button>
            {generatedCode && (
              <div className="flex w-full items-center gap-2 rounded-md border bg-muted p-3">
                <span className="flex-1 font-mono text-center text-lg tracking-widest">{generatedCode}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  aria-label="Copy code"
                >
                  <ClipboardCopy className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
```

### File: `/src/components/admin/driver-management-table.tsx`
```typescript
'use client';
import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Driver } from '@/lib/definitions';
import { listDrivers, deleteDriver as deleteDriverAction } from '@/lib/mock-api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';

export function DriverManagementTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const { toast } = useToast();

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const result = await listDrivers();
      setDrivers(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drivers.');
      toast({
        variant: 'destructive',
        title: 'Error fetching drivers',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;
    try {
      await deleteDriverAction({ driverId: driverToDelete.id });
      toast({
        title: 'Driver Deleted',
        description: `Driver ${driverToDelete.fullName} has been successfully deleted.`,
      });
      await fetchDrivers(); // Refresh the driver list
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting driver',
        description: err.message || 'An unknown error occurred.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  if (loading) {
    return <DriverManagementTableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Driver Management</CardTitle>
        <CardDescription>View and manage all registered drivers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Ghana Card</TableHead>
              <TableHead>Bus Plate</TableHead>
              <TableHead>Registration Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.fullName}</TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>{driver.licenseNumber}</TableCell>
                <TableCell>{driver.ghanaCardNumber}</TableCell>
                <TableCell>{driver.busPlateNumber}</TableCell>
                <TableCell className='font-mono'>{driver.registrationCode}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteClick(driver)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Driver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {drivers.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No drivers found.
            </div>
        )}
      </CardContent>
    </Card>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the driver <span className='font-bold'>{driverToDelete?.fullName}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DriverManagementTableSkeleton() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
          <CardDescription>View and manage all registered drivers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Ghana Card</TableHead>
                <TableHead>Bus Plate</TableHead>
                <TableHead>Registration Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
```

### File: `/src/components/admin/make-admin-form.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { makeAdmin } from '@/lib/mock-api';
import type { MakeAdminInput } from '@/lib/definitions';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function MakeAdminForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: MakeAdminInput) => {
    setLoading(true);
    try {
        const response = await makeAdmin(data.email);
        toast({
            title: 'Success',
            description: response.message,
        });
        form.reset();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: error.message || 'Failed to grant admin privileges.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Grant Admin Rights</CardTitle>
            <CardDescription>Enter the email of the user you want to promote to an administrator.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grant Privileges
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
```

### File: `/src/components/admin/user-management-table.tsx`
```typescript
'use client';
import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { User } from '@/lib/definitions';
import { listUsers, deleteUser as deleteUserAction } from '@/lib/mock-api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import { useAuth } from '../auth/auth-provider';

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const { user: currentUser, logout } = useAuth();


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await listUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserAction({ userId: userToDelete.id });
      toast({
        title: 'User Deleted',
        description: `User ${userToDelete.email} has been successfully deleted.`,
      });
      
      if (currentUser?.email === userToDelete.id) {
        logout();
      } else {
        await fetchUsers(); // Refresh the user list
      }

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting user',
        description: err.message || 'An unknown error occurred.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return <UserManagementTableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wallet Balance</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>GH₵{(user.walletBalance || 0).toFixed(2)}</TableCell>
                <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No users found.
            </div>
        )}
      </CardContent>
    </Card>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user <span className='font-bold'>{userToDelete?.email}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function UserManagementTableSkeleton() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
```

### File: `/src/components/layout/header.tsx`
```typescript
import Link from 'next/link';
import { Car } from 'lucide-react';
import { UserAvatar } from '../auth/user-avatar';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/home" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold">AdminPowerPanel</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
```

### File: `/src/components/ui/sidebar.tsx`
```typescript
'use client';

import * as React from 'react';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import {
  ChevronRight,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

const SidebarProvider = ({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  React.useEffect(() => {
    const cookieValue =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split('=')[1] ?? 'expanded';
    setOpen(cookieValue === 'expanded');
  }, []);

  const setOpenAndPersist = (newOpenState: boolean) => {
    setOpen(newOpenState);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${
      newOpenState ? 'expanded' : 'collapsed'
    }; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  const toggleSidebar = React.useCallback(() => {
    isMobile
      ? setOpenMobile((prev) => !prev)
      : setOpenAndPersist(!open);
  }, [isMobile, open]);

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen: setOpenAndPersist,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, isMobile, openMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};


const sidebarVariants = cva(
  'hidden lg:flex flex-col border-r bg-background transition-all duration-300 ease-in-out',
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-14',
      },
    },
    defaultVariants: {
      state: 'expanded',
    },
  }
);

const Sidebar = ({ className, ...props }: React.ComponentProps<'aside'>) => {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-64 p-0">
          <aside className={cn('flex flex-col h-full w-full', className)} {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(sidebarVariants({ state }), className)}
      {...props}
    />
  );
};


const SidebarHeader = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const { state, isMobile } = useSidebar();
  
  return (
    <div
      className={cn(
        'flex items-center p-3',
        (state === 'collapsed' && !isMobile) ? 'justify-center' : '',
        className
      )}
      {...props}
    />
  );
};

const SidebarContent = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'flex-1 overflow-y-auto overflow-x-hidden p-2',
      className
    )}
    {...props}
  />
);

const SidebarFooter = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const { state, isMobile } = useSidebar();
  return (
    <div
      className={cn(
        'p-3 border-t',
        (state === 'collapsed' && !isMobile) ? 'flex flex-col items-center gap-2' : '',
        className
      )}
      {...props}
    />
  );
};

const SidebarMenu = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav className={cn('flex flex-col gap-1', className)} {...props} />
);

const SidebarMenuItem = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div className={cn('relative', className)} {...props} />
);

const sidebarMenuButtonVariants = cva(
  'flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full',
  {
    variants: {
      isActive: {
        true: 'bg-primary text-primary-foreground',
        false: 'bg-transparent hover:bg-muted',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

const SidebarMenuButton = ({
  className,
  isActive,
  children,
  href,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean; href?: string }) => {
  const { state, isMobile } = useSidebar();

  const buttonContent = (
    <div className={cn("flex items-center", (state === 'expanded' || isMobile) ? 'gap-3' : 'gap-0')}>
      {React.Children.map(children, (child, index) => {
        // Icon
        if (index === 0 && React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: 'h-4 w-4',
          });
        }
        // Label
        if (index === 1 && (state === 'expanded' || isMobile)) {
           return <span className="truncate">{child}</span>;
        }
        return null;
      })}
    </div>
  );
  
  const renderButton = () => (
    <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
            'w-full',
            (state === 'expanded' || isMobile) ? 'justify-start' : 'justify-center',
            className
        )}
        {...props}
    >
        {buttonContent}
    </Button>
  );

  const renderLink = () => (
     <Link href={href || ''} 
        className={cn(
            sidebarMenuButtonVariants({isActive}),
            (state === 'expanded' || isMobile) ? 'justify-start' : 'justify-center',
            className
        )}
     >
        {buttonContent}
     </Link>
  );

  
  if (state === 'collapsed' && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? renderLink() : renderButton()}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          {React.Children.toArray(children)[1]}
        </TooltipContent>
      </Tooltip>
    );
  }

  return href ? renderLink() : renderButton();
};

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
};
```

### File: `/src/hooks/use-toast.ts`
```typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 10000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

### File: `/src/hooks/use-mobile.tsx`
```typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

### File: `/src/components/ui/toaster.tsx`
```typescript
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```

... and so on for every other file in the project, which is too large to fit in this response.
Due to the sheer size of the entire application's codebase, I cannot provide all the file contents in a single response. The above demonstrates the structure, including the pseudocode, project configuration, and a representative selection of the application's components and utility files.
