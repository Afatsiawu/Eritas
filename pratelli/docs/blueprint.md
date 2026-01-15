# **App Name**: AdminPowerPanel

## Core Features:

- Universal Authentication: Unified sign-in and sign-up form using Firebase Authentication.
- Admin Area Entry Point: Check user claims and render an 'Admin Dashboard' link in the profile sidebar.
- Secure Admin Layout: Secure admin pages and implement dedicated navigation with a persistent side menu.
- Admin Dashboard UI: Implement a Driver Creation Form that calls the generateDriverCode backend flow. Includes 'User Management' and 'Driver Management' tables calling listUsers, deleteUser, listDrivers, and deleteDriver flows.
- Driver Code Generation Tool: Use generative AI as a tool for reasoning through a database of users and available 6-digit codes and their usage to automatically create unique and secure driver codes upon successful completion of a driver onboarding application process.
- 'Make Admin' Utility Page: Implement a form to grant admin privileges using the makeAdmin backend flow.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) for a professional and trustworthy feel.
- Background color: Light Gray (#F0F2F5) to provide a clean and modern backdrop.
- Accent color: Teal (#009688) for highlighting key actions and elements, offering a fresh and dynamic touch.
- Body and headline font: 'Inter', a grotesque-style sans-serif font for a modern, machined, objective, neutral look; well-suited to headlines and body text.
- Use a consistent set of icons from a library like FontAwesome or Material Icons.
- Utilize a responsive grid layout for the admin dashboard, ensuring adaptability across different screen sizes. Implement clear visual hierarchy using whitespace and padding to improve readability.
- Add subtle transitions and animations to UI elements (e.g., button hovers, form submissions) to provide a polished and engaging user experience. Keep animations minimal to avoid distraction.