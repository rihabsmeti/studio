# Master Prompt for "ExitPass" Application

This document contains the master prompt for generating the "ExitPass" student clearance application. It is structured into logical phases to guide the AI model through a seamless development process, incorporating all final features and critical bug fixes derived from a previous iterative development cycle.

## Phase 1: Initial Project Scaffolding & Core App Structure

### 1.1. Application Concept & Technology Stack
- **Application Name:** ExitPass
- **Core Functionality:** A web application for students at African Leadership Academy to manage their campus exit clearance process. It involves different user roles (Student, Admin, Finance, Security) with distinct permissions and workflows.
- **Technology Stack:**
  - **Framework:** Next.js (App Router)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS with ShadCN UI components.
  - **Backend:** Firebase (Authentication and Firestore)
  - **AI:** Genkit (for future AI-powered features, establish initial setup)

### 1.2. Firebase Backend and Data Modeling
- **Entities (`docs/backend.json`):**
  - **`UserProfile`:** Stores user data including `id`, `fullName`, `email`, `studentId`, `hallOfResidence`, `gender`, and `role`.
  - **`ClearanceItem`:** Represents an item a student needs to clear. Includes `id`, `userProfileId`, `name`, `department`, `status` (`Pending`, `Approved`, `Rejected`), `notes`, `rejectionReason`, `price`, and `paymentStatus` (`Outstanding`, `Paid`).
- **Authentication:** Enable Email/Password and Anonymous providers.
- **Firestore Structure (`docs/backend.json`):**
  - `/users/{userId}`: Stores `UserProfile` documents.
  - `/users/{userId}/clearanceItems/{clearanceItemId}`: Stores `ClearanceItem` documents as a subcollection.

### 1.3. Core App Layout and Navigation
- **Root Layout (`src/app/layout.tsx`):**
  - Set up `FirebaseClientProvider` and `Toaster`.
  - Import Google Fonts: `Inter` for body and `Playfair Display` for headlines.
- **Dashboard Layout (`src/app/dashboard/layout.tsx`):**
  - A two-column layout featuring a persistent `Sidebar` component on the left and a main content area on the right.
  - The main content area should have a `Header` component.
  - The sidebar should be collapsible and responsive for mobile, using a drawer.
- **Sidebar Component (`src/components/app/sidebar.tsx`):**
  - Displays the ALA logo and application name.
  - Navigation links should be dynamically rendered based on the user's `role`, which is passed as a prop from the layout (read from URL search params).
    - **Student:** Dashboard, My Clearance, My Profile.
    - **Admin:** Dashboard, Admin Console, My Profile.
    - **Finance:** Dashboard, Finance Console, My Profile.
    - **Security:** Dashboard, Security Console, My Profile.
  - Displays the current user's email and role.
  - Includes a "Log Out" button that signs the user out and redirects to the login page.

---

## Phase 2: Authentication and User Profile

### 2.1. Login Page (`src/app/page.tsx` -> `src/components/auth/login-page.tsx`)
- **UI:** A visually appealing, full-screen page with a background image of the ALA campus.
- **Role Selection:** Users must first select their role (Student, Admin, Finance, Security) from a set of clickable cards.
- **Authentication Logic (`handleLogin` function):**
  - **CRITICAL FIX:** Implement robust sign-in/sign-up logic.
    1. Attempt `signInWithEmailAndPassword`.
    2. If the error code is `auth/user-not-found`, then (and only then) attempt `createUserWithEmailAndPassword`.
    3. If the error code is `auth/invalid-credential` or any other error, display a user-friendly error message (e.g., "The email or password you entered is incorrect.") without attempting to create a new account.
    4. For staff roles (Admin, Finance, Security), enforce that the email must end with `@africanleadershipacademy.org`.
  - Upon successful authentication, create/update a user profile document in Firestore at `/users/{uid}` with their role and default information, then redirect to the appropriate dashboard, passing the role in the URL (`/dashboard?role=...`).

### 2.2. Profile Page (`src/app/dashboard/profile/page.tsx`)
- A form allowing users to view and update their profile information (Full Name, Hall of Residence, Gender). Email and Student ID should be read-only.

---

## Phase 3: Student Clearance Form

### 3.1. Clearance Page UI (`src/app/dashboard/clearance/page.tsx`)
- A dashboard for students to manage their clearance items.
- **Add Item Form:** A card with fields for `Item Name` and `Department` (a select dropdown: "Academics", "Library", "Sports", "Dormitory", "IT", "Finance") and an "Add Item" button.
- **Items List:**
  - Display all of the student's `ClearanceItem` documents from Firestore.
  - Each item card should show its name, department, and status.
  - If status is `Rejected`, display the `rejectionReason`, `price`, and `paymentStatus`.
  - Provide a `Textarea` for students to add `notes` to pending items.
  - Provide a "Remove" button (trash icon) for pending items.

---

## Phase 4: Staff Dashboards & Security Rules (CRITICAL)

### 4.1. Firestore Security Rules (`firestore.rules`)
- **Implement robust, role-based security rules that avoid common pitfalls.**
- **`function isOwner(userId)`:** Returns `request.auth.uid == userId`.
- **`function getRole()`:** Returns the role from the user's own profile document: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
- **`function isAdmin()`:** Returns `getRole() == 'Admin'`.
- **`function isFinance()`:** Returns `getRole() == 'Finance'`.
- **`function isStaff()`:** Returns `getRole() in ['Admin', 'Security', 'Finance']`.
- **`/users/{userId}`:**
  - `allow get`: if `isOwner(userId)` or `isStaff()`.
  - `allow create`: if `isOwner(userId)`. Add a check to prevent users from assigning themselves a staff role unless their email matches the `@africanleadershipacademy.org` domain.
- **`/users/{userId}/clearanceItems/{clearanceItemId}`:**
  - **`allow list`: `if isOwner(userId);`** (This is the most critical rule. It allows any user to list their *own* items, which resolves the permission error for staff viewing their own clearance page).
  - **`allow get`: `if isOwner(userId) || isStaff();`** (This allows staff `collectionGroup` queries to work, as they rely on `get` permissions).
  - **`allow create, delete`: `if isOwner(userId);`**
  - **`allow update`:**
    - if `isOwner(userId)` and the item status is 'Pending'.
    - if `isAdmin()` and only the `status`, `rejectionReason`, `price`, or `paymentStatus` fields are being changed.
    - if `isFinance()` and only the `paymentStatus` field is being changed.

### 4.2. Admin Dashboard (`src/app/dashboard/admin/page.tsx`)
- **Query:** Use a `collectionGroup` query to fetch all `clearanceItems` from all users.
- **UI:** A data table with columns: Student (Name/Email), Department, Item Name, Notes, Status.
- **Actions:**
  - For each `Pending` item, provide "Approve" (Check icon) and "Reject" (X icon) buttons.
  - Clicking "Reject" must open a dialog forcing the admin to enter a `rejectionReason` and a `price`.

### 4.3. Finance Dashboard (`src/app/dashboard/finance/page.tsx`)
- **Query:** Use a `collectionGroup` query to fetch all `clearanceItems` where `status == 'Rejected'` and `paymentStatus == 'Outstanding'`.
- **UI:** A data table with columns: Student, Item Name, Reason for Rejection, Amount Due, Payment Status.
- **Actions:** For each item, provide a "Mark as Paid" button.

### 4.4. Security Dashboard (`src/app/dashboard/security/page.tsx`)
- **Query:** Use a `collectionGroup` query to fetch all `clearanceItems` from all users.
- **UI:** A read-only data table with columns: Student, Department, Item Name, Status, and Finance Status. No actions are available.
