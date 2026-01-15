# Application Pseudocode

This document outlines the high-level structure and logic of the AdminPowerPanel application.

## 1. Application Entry Point & Core Layout (`/src/app/layout.tsx`)

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

---

## 2. Main Application Structure

### 2.1. Home Page (`/src/app/home/page.tsx`)

```
PAGE HomePage
  RENDER Header component.
  RENDER main content area.
    DISPLAY a welcome title and description.
    DISPLAY info cards for "Admin Portal", "User Management", and "Driver Operations".
    DISPLAY a "Getting Started" guide with steps for using the app.
END PAGE
```

### 2.2. User Avatar & Account Deletion (`/src/components/auth/user-avatar.tsx`)

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

---

## 3. Admin Section

### 3.1. Admin Layout & Sidebar (`/src/app/admin/layout.tsx` & `.../admin-sidebar.tsx`)

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

### 3.2. Admin Dashboard Page (`/src/app/admin/page.tsx`)

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

### 3.3. Make Admin Page (`/src/app/admin/make-admin/page.tsx`)

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
    
    // MOCK: Placeholder for a real backend API call.
    AWAIT mock API call to 'makeAdmin(email)'.
    
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

### 3.4. Data Management Components

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
      LOG aout.
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