# Master Prompt for "ExitPass" Application (Supabase Version)

This document contains the master prompt for generating the "ExitPass" student clearance application using Supabase as the backend. It is structured into logical phases to guide an AI model (like v0) through a seamless development process.

## Phase 1: Initial Project Scaffolding & Core App Structure

### 1.1. Application Concept & Technology Stack
- **Application Name:** ExitPass
- **Core Functionality:** A web application for students at African Leadership Academy to manage their campus exit clearance process. It involves different user roles (Student, Admin, Finance, Security) with distinct permissions and workflows.
- **Technology Stack:**
  - **Framework:** Next.js (App Router)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS with ShadCN UI components.
  - **Backend:** **Supabase** (PostgreSQL, Auth, and Storage)
  - **AI:** Genkit (for future AI-powered features, establish initial setup)

### 1.2. Supabase Backend and Data Modeling
- **Setup:** Initialize the Supabase client. Create a utility file (`src/lib/supabase/client.ts`) to export a singleton Supabase client instance for use throughout the application.
- **Database Tables:**
  - **`profiles`:** Stores user data.
    - `id` (uuid, primary key, references `auth.users.id`)
    - `full_name` (text)
    - `email` (text, unique)
    - `student_id` (text, unique)
    - `hall_of_residence` (text)
    - `gender` (text)
    - `role` (text, e.g., 'Student', 'Admin', 'Finance', 'Security')
  - **`clearance_items`:** Represents an item a student needs to clear.
    - `id` (uuid, primary key, default `gen_random_uuid()`)
    - `user_id` (uuid, foreign key to `profiles.id`)
    - `name` (text)
    - `department` (text, enum: "Academics", "Library", "Sports", "Dormitory", "IT", "Finance")
    - `status` (text, enum: 'Pending', 'Approved', 'Rejected', default 'Pending')
    - `notes` (text, nullable)
    - `rejection_reason` (text, nullable)
    - `price` (numeric, nullable)
    - `payment_status` (text, enum: 'Outstanding', 'Paid', nullable)
    - `created_at` (timestamp with time zone, default `now()`)

### 1.3. Core App Layout and Navigation
- **Root Layout (`src/app/layout.tsx`):**
  - Set up a Supabase provider/context if needed to pass the client down. Include a `Toaster` for notifications.
  - Import Google Fonts: `Inter` for body and `Playfair Display` for headlines.
- **Dashboard Layout (`src/app/dashboard/layout.tsx`):**
  - A two-column layout featuring a persistent `Sidebar` component on the left and a main content area on the right.
  - The main content area should have a `Header` component.
  - The sidebar should be collapsible and responsive for mobile, using a drawer.
- **Sidebar Component (`src/components/app/sidebar.tsx`):**
  - Displays the ALA logo and application name.
  - Navigation links should be dynamically rendered based on the user's `role`, which is fetched from their profile in the `profiles` table.
    - **Student:** Dashboard, My Clearance, My Profile.
    - **Admin:** Dashboard, Admin Console, My Profile.
    - **Finance:** Dashboard, Finance Console, My Profile.
    - **Security:** Dashboard, Security Console, My Profile.
  - Displays the current user's email and role.
  - Includes a "Log Out" button that calls `supabase.auth.signOut()` and redirects to the login page.

---

## Phase 2: Authentication and User Profile

### 2.1. Login Page (`src/app/page.tsx` -> `src/components/auth/login-page.tsx`)
- **UI:** A visually appealing, full-screen page with a background image of the ALA campus.
- **Role Selection:** Users must first select their role (Student, Admin, Finance, Security).
- **Authentication Logic (`handleLogin` function):**
  - Use the Supabase client (`supabase.auth`).
  - First, attempt `signInWithPassword`.
  - If the error indicates the user does not exist, then attempt `signUp`.
  - When signing up a new user, create a corresponding entry in the `profiles` table with their selected `role`. A Supabase Function (or trigger) is the ideal way to do this automatically upon user creation.
  - For staff roles (Admin, Finance, Security), enforce that the email must end with `@africanleadershipacademy.org`.
  - Upon successful authentication, redirect to the appropriate dashboard, passing the role in the URL (`/dashboard?role=...`).

### 2.2. Profile Page (`src/app/dashboard/profile/page.tsx`)
- A form allowing users to view and update their profile information in the `profiles` table. Email and Student ID should be read-only.

---

## Phase 3: Student Clearance Form

### 3.1. Clearance Page UI (`src/app/dashboard/clearance/page.tsx`)
- A dashboard for students to manage their clearance items.
- **Add Item Form:** Fields for `Item Name` and `Department` (select dropdown).
- **Items List:**
  - Fetch and display all `clearance_items` for the currently logged-in user.
  - Each item card should show its name, department, and status.
  - If status is `Rejected`, display the `rejection_reason`, `price`, and `payment_status`.
  - Provide a `Textarea` for students to add `notes` to pending items.
  - Provide a "Remove" button for pending items.

---

## Phase 4: Staff Dashboards & Row Level Security (RLS)

### 4.1. Supabase Row Level Security (RLS) Policies
- **CRITICAL:** Enable RLS on both `profiles` and `clearance_items` tables.
- Create a helper function in SQL: `CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$ LANGUAGE sql SECURITY DEFINER;`

- **`profiles` table policies:**
  - `allow SELECT`: for users to read their own profile (`id = auth.uid()`) OR if the user is a staff member (`get_my_role() IN ('Admin', 'Security', 'Finance')`).
  - `allow UPDATE`: for users to update their own profile (`id = auth.uid()`).
  
- **`clearance_items` table policies:**
  - `allow SELECT`: for users to see their own items (`user_id = auth.uid()`) OR if the user is a staff member.
  - `allow INSERT`: for users to add items for themselves (`user_id = auth.uid()`).
  - `allow DELETE`: for users to delete their own items when status is 'Pending'.
  - `allow UPDATE`:
    - for owners if the item status is 'Pending'.
    - for 'Admin' role if they are only changing `status`, `rejection_reason`, `price`, or `paymentStatus`.
    - for 'Finance' role if they are only changing `paymentStatus`.

### 4.2. Admin Dashboard (`src/app/dashboard/admin/page.tsx`)
- **Query:** Fetch all `clearance_items` from all users. RLS policies will ensure only admins can do this.
- **UI:** A data table with columns: Student (Name/Email), Department, Item Name, Notes, Status.
- **Actions:**
  - For `Pending` items, provide "Approve" and "Reject" buttons.
  - Clicking "Reject" must open a dialog forcing the admin to enter a `rejectionReason` and a `price`.

### 4.3. Finance Dashboard (`src/app/dashboard/finance/page.tsx`)
- **Query:** Fetch all `clearance_items` where `status = 'Rejected'` and `paymentStatus = 'Outstanding'`.
- **UI:** A data table with columns: Student, Item Name, Reason for Rejection, Amount Due, Payment Status.
- **Actions:** Provide a "Mark as Paid" button.

### 4.4. Security Dashboard (`src/app/dashboard/security/page.tsx`)
- **Query:** Fetch all `clearance_items` from all users.
- **UI:** A read-only data table with columns: Student, Department, Item Name, Status, and Finance Status.
