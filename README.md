# Procurement System

## 1. Introduction & Reason
The Procurement System is a comprehensive web-based application designed to streamline the procurement lifecycle within an organization. 
The primary reason for developing this project is to eliminate the inefficiencies, lack of transparency, and manual bottlenecks associated with traditional, paper-based or disjointed digital procurement methods. Organizations often struggle with tracking requests, managing budgets, and coordinating with suppliers effectively. This system centralizes the entire workflow, bringing employees, administrators, and suppliers onto a single, unified platform.

## 2. Problem Statement
**What is the problem?**
In many organizations, the procurement process is fragmented and heavily reliant on manual approvals, email chains, and disconnected systems. This leads to several critical issues:
- **Lack of Transparency**: Employees have no visibility into the status of their purchase requests.
- **Approval Bottlenecks**: Administrators are overwhelmed by manual verification of budgets, justifications, and supplier communications, leading to delayed approvals.
- **Supplier Miscommunication**: Purchase orders and delivery updates are often lost in email threads, causing delays in fulfillment and inventory shortages.
- **Inefficient Payment Tracking**: Finance teams struggle to track pending payments and total spend against authorized purchase orders.

## 3. Proposed Solution
To resolve these issues, we propose a centralized **Role-Based Procurement System**. The solution automates the request-to-delivery lifecycle by offering tailored portals for three distinct roles: Employees, Admins, and Suppliers. 
- **Centralized Tracking**: Every request is tracked from initiation to final delivery and feedback.
- **Automated Workflows**: Approvals, purchase order generation, and payment tracking are digitized, reducing manual overhead.
- **Supplier Integration**: Suppliers have direct access to their orders, allowing them to update fulfillment statuses in real-time.

## 4. Implementation Details (How and Why)

**How we implemented the project:**
The project was implemented using a modern decoupled architecture, separating the frontend presentation layer from the backend RESTful API services.
- We used **Spring Boot (Java)** for the backend to ensure robust security, role-based access control, and scalable business logic.
- We used **React (with Vite and Tailwind CSS)** for the frontend to deliver a highly responsive, dynamic, and modern user interface.
- Database management is handled via **MySQL** in production and **H2** for testing environments, accessed via **Spring Data JPA**.
- JWT (JSON Web Tokens) are used for stateless, secure authentication across all roles.

**Why this approach? (Reasons for these choices)**
- **Spring Boot** was chosen because it provides out-of-the-box features for enterprise applications, such as Spring Security, dependency injection, and easy REST API creation. It ensures that complex role-based authorization rules are enforced securely on the server side.
- **React** was chosen for its component-based architecture, which allows us to build reusable UI elements (like Data Tables, Modals, and Dashboard Widgets). **Vite** was chosen over Create React App for significantly faster build times and a better developer experience. **Tailwind CSS** ensures we can quickly style the application while maintaining a consistent design language without writing custom CSS files.
- **JWT Authentication** is used because it allows our backend to remain stateless, making it easier to scale the application horizontally in the future without worrying about session management.

## 5. Detailed Architecture & Tech Stack

The architecture follows a classic Client-Server model with a clear separation of concerns.

### Frontend Architecture
- **Framework**: React 19 (via Vite)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Architecture Pattern**: Component-Based UI. The frontend is divided into distinct portals for the Admin, Employee, and Supplier, with shared generic UI components (Buttons, Inputs, Cards). API calls are abstracted into service modules to keep components clean.

### Backend Architecture
- **Framework**: Spring Boot (Java 21)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA / Hibernate
- **Database**: MySQL (Production), H2 (In-Memory for Tests)
- **Build Tool**: Maven
- **Architecture Pattern**: N-Tier Architecture (Controller -> Service -> Repository).
  - **Controllers**: Expose REST endpoints and handle HTTP requests/responses.
  - **Services**: Contain the core business logic (e.g., verifying if a request can be approved, processing payments).
  - **Repositories**: Interface with the database to perform CRUD operations.

### Languages Used
- **Java 21**: For all backend logic, taking advantage of modern Java features for performance and readability.
- **JavaScript (ES6+)**: For the frontend React application.
- **SQL**: Handled mostly via JPA/Hibernate, but used fundamentally for database schema management.

## 6. Role-Based Architecture

The system enforces strict role-based access control (RBAC):
1. **Employee**: 
   - Can browse available products and create purchase requests with justifications.
   - Can track the real-time status of their requests.
   - Can provide feedback and ratings upon receiving the product.
2. **Admin**:
   - Reviews employee requests.
   - Has the authority to approve or reject requests based on budget and justification.
   - Manages payments to suppliers for approved requests.
   - Overviews total spend and pending payments via an interactive Dashboard.
3. **Supplier**:
   - Receives and reviews incoming purchase orders generated by the Admin.
   - Manages logistics and updates fulfillment/delivery status.
   - Completes the delivery process on the platform.

## 7. Workflow Execution

The core flow of the project follows this lifecycle:
1. **Employee Requests**: An employee identifies a need and submits a formal request for a product through the Employee Portal.
2. **Admin Approves**: The Admin reviews the request on the Admin Dashboard and approves it if the justification and budget align.
3. **Admin Pays**: Following approval, the Admin processes the payment for the required items.
4. **Procurement**: A Purchase Order is generated automatically and the procurement process is officially initiated.
5. **Supplier Receives Request**: The assigned Supplier logs into their portal and sees the new purchase order.
6. **Supplier Delivers Fulfillment**: The Supplier prepares the items and updates the status to "In Transit" or "Fulfillment".
7. **Supplier Delivers the Project**: The items reach the destination, and the Supplier marks the order as "Delivered".
8. **Employee Gives Feedback**: The Employee receives the item and closes the loop by providing feedback and rating the product/delivery experience in the system.