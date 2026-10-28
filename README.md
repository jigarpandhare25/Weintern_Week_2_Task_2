# 🚀 StaffFlow Pro - Full CRUD Employee Management System

A full-featured, enterprise-grade Employee Management Web Application designed for HR administrators. Built with a clean, responsive interface powered by **Vanilla HTML5/CSS3/JavaScript**, backed by a robust **Node.js/Express REST API**, and persisted using **MongoDB** (with Mongoose and an automated persistent JSON storage fallback).

---

## 🌟 Key Features

- **Full CRUD Functionality**:
  - **Create**: Add new employees with real-time input validation (Name, Department, Role, Salary, Join Date, Email, Status).
  - **Read**: Live searchable & sortable data table with instant search and department filters.
  - **Update**: Edit existing employee records in a pre-populated modal dialog.
  - **Delete**: Remove employee records with a custom warning confirmation dialog.
- **Real-Time HR Analytics**:
  - KPI Stat Cards: Total Workforce, Annual Payroll Outflow, Average Salary, and Department breakdown.
- **Search, Filter & Sort**:
  - Live instant search across employee name, role, department, and email.
  - Dropdown filter by department.
  - Multi-column sort by Name, Salary, Join Date, and Department (ascending & descending).
- **Interactive Modals & Notifications**:
  - Animated Add / Edit modal with field validation and error messaging.
  - Employee Profile view card modal with avatar initials and badges.
  - Floating toast notification system for instant user feedback.
  - Custom delete confirmation modal preventing accidental deletions.
- **Dual-Mode Persistence**:
  - Seamlessly connects to **MongoDB** (Local or MongoDB Atlas).
  - Gracefully falls back to persistent JSON storage (`data/employees.json`) if MongoDB is not running locally, guaranteeing 100% functionality out of the box.
- **Theme & Export**:
  - Sleek Dark / Light theme toggle with `localStorage` persistence.
  - One-click **Export to CSV** feature for HR records.
  - One-click **Reset Demo Data** action.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Glassmorphism, Responsive Grid/Flexbox), JavaScript (ES6+ Fetch API) |
| **Backend** | Node.js, Express.js, CORS, Dotenv |
| **Database** | MongoDB, Mongoose ODM (with persistent fallback storage) |
| **API Testing** | Postman, Thunder Client, Curl |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB** *(Optional)*: Local MongoDB or MongoDB Atlas connection string.

### 2. Installation & Setup

1. Open your terminal in the project directory:
   ```bash
   cd "c:\Users\Jigar\Downloads\Weintern Week-2 Task-2"
   ```

2. Dependencies are already installed (`express`, `cors`, `dotenv`, `mongoose`). If needed, run:
   ```bash
   npm install
   ```

3. (Optional) Configure your MongoDB connection string in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/employee_management
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

---

## 📡 REST API Endpoints Reference

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| **GET** | `/api/departments` | Get all available departments | `200 OK` |
| **POST** | `/api/departments` | Add a new custom department | `201 Created` / `400 Bad Request` |
| **GET** | `/api/employees` | Get all employees (supports `?search=`, `?department=`, `?sortBy=`, `?order=`) | `200 OK` |
| **GET** | `/api/employees/:id` | Get employee by ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/employees` | Create a new employee with INR salary validation | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/employees/:id` | Update an existing employee record | `200 OK` / `400 Bad Request` / `404` |
| **DELETE** | `/api/employees/:id` | Delete an employee record | `200 OK` / `404 Not Found` |
| **GET** | `/api/employees/stats/summary` | Get HR analytics & aggregate metrics in INR (₹) | `200 OK` |
| **POST** | `/api/employees/seed` | Reset and seed sample employee data (INR) | `200 OK` |
| **GET** | `/api/health` | Health check route | `200 OK` |

---

## 🧪 Postman API Testing Guide (Step-by-Step)

You can test all endpoints in Postman using either the **One-Click Automated Collection** or **Manual Step-by-Step Testing**.

---

### Option A: One-Click Automated Collection Import (Recommended)

A complete, pre-configured Postman Collection is included directly in this repository:
👉 `postman_collection.json`

#### Steps to Import:
1. Open **Postman**.
2. Click the **Import** button (top-left corner).
3. Drag & drop or browse to select `postman_collection.json` located in your workspace:
   `c:\Users\Jigar\Downloads\Weintern Week-2 Task-2\postman_collection.json`
4. Click **Import**.
5. You will see the **"StaffFlow Pro - Employee Management API"** collection with all 10 pre-configured requests, environment variables, and automated assertion test scripts!
6. Click **Run Collection** to automatically execute all 10 test requests in sequence and see all green passing tests.

---

### Option B: Manual Step-by-Step Testing Guide in Postman

Ensure the server is running on `http://localhost:5000` before beginning.

---

#### 🔹 Step 1: Create a New Employee (POST)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/employees`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** -> Select **raw** -> Select **JSON**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex.rivera@techcorp.io",
    "department": "Engineering",
    "role": "Senior DevOps Engineer",
    "salary": 115000,
    "joinDate": "2024-03-01",
    "status": "Active"
  }
  ```
- Click **Send**.
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Employee created successfully",
    "data": {
      "_id": "6add9d...",
      "name": "Alex Rivera",
      "email": "alex.rivera@techcorp.io",
      "department": "Engineering",
      "role": "Senior DevOps Engineer",
      "salary": 115000,
      "joinDate": "2024-03-01T00:00:00.000Z",
      "status": "Active"
    }
  }
  ```
- 💡 *Copy the generated `_id` value to use in the GET, PUT, and DELETE steps below.*

---

#### 🔹 Step 2: Retrieve All Employees (GET)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "count": 9,
    "data": [ ... ]
  }
  ```

---

#### 🔹 Step 3: Retrieve Employee by ID (GET)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees/<COPIED_EMPLOYEE_ID>`
  *(Replace `<COPIED_EMPLOYEE_ID>` with the actual ID from Step 1, e.g. `6add9d...`)*
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "<COPIED_EMPLOYEE_ID>",
      "name": "Alex Rivera",
      "role": "Senior DevOps Engineer"
    }
  }
  ```

---

#### 🔹 Step 4: Search Employees (GET with Query Param)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees?search=Alex`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**: Returns only employees whose name, role, department, or email matches "Alex".

---

#### 🔹 Step 5: Filter Employees by Department (GET)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees?department=Engineering`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**: Returns only employees whose department is `Engineering`.

---

#### 🔹 Step 6: Sort Employees by Salary (GET)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees?sortBy=salary&order=desc`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**: Returns all employees ordered from highest salary to lowest salary.

---

#### 🔹 Step 7: Update Employee Record (PUT)
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/employees/<COPIED_EMPLOYEE_ID>`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** -> Select **raw** -> Select **JSON**:
  ```json
  {
    "role": "Principal Lead DevOps Architect",
    "salary": 140000,
    "status": "Active"
  }
  ```
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Employee updated successfully",
    "data": {
      "_id": "<COPIED_EMPLOYEE_ID>",
      "name": "Alex Rivera",
      "role": "Principal Lead DevOps Architect",
      "salary": 140000
    }
  }
  ```

---

#### 🔹 Step 8: Get HR Dashboard Analytics (GET)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/employees/stats/summary`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalEmployees": 9,
      "totalPayroll": 922000,
      "averageSalary": 102444,
      "departmentCounts": {
        "Engineering": 3,
        "Design": 1,
        "Product": 1,
        "Marketing": 1,
        "Sales": 1,
        "Human Resources": 1,
        "Finance": 1
      },
      "storageMode": "MongoDB (Live)"
    }
  }
  ```

---

#### 🔹 Step 9: Test Input Validation & Bad Request Error (POST)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/employees`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** -> Select **raw** -> Select **JSON**:
  ```json
  {
    "name": "",
    "department": "InvalidDept",
    "salary": -500
  }
  ```
- Click **Send**.
- **Expected Status**: `400 Bad Request`
- **Expected Response**:
  ```json
  {
    "success": false,
    "errors": [
      "Employee name is required and must be at least 2 characters.",
      "Department is required and must be one of: Engineering, Design, Product, Marketing, Sales, Human Resources, Finance, Operations.",
      "Role/Designation is required and must be at least 2 characters.",
      "Salary must be a positive number greater than 0.",
      "A valid join date is required."
    ]
  }
  ```

---

#### 🔹 Step 10: Delete Employee (DELETE)
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/employees/<COPIED_EMPLOYEE_ID>`
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Employee deleted successfully",
    "data": {
      "_id": "<COPIED_EMPLOYEE_ID>",
      "name": "Alex Rivera"
    }
  }
  ```
- *To verify deletion, perform Step 3 again on the same ID. It will return `404 Not Found`.*

---

## 🧪 Postman Automated Test Scripts

To add automated assertion tests in Postman, open the **Scripts** -> **Post-response** tab in each request:

### For POST (Create Employee):
```javascript
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Employee created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property("_id");
});
```

### For GET (List Employees):
```javascript
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Data is an array of employees", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

### For DELETE (Delete Employee):
```javascript
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message confirmed", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.message).to.eql("Employee deleted successfully");
});
```

---

## 📂 Project Architecture

```
Weintern Week-2 Task-2/
├── config/
│   └── db.js                 # Database connection & graceful fallback detection
├── controllers/
│   └── employeeController.js # CRUD controller with validation & statistics
├── data/
│   └── employees.json        # Persistent JSON backup storage
├── models/
│   └── Employee.js           # Mongoose schema with field validation & indexes
├── public/                   # Frontend assets
│   ├── index.html            # HR Dashboard single-page application
│   ├── css/
│   │   └── style.css         # Glassmorphism design system & dark/light theme
│   └── js/
│       └── app.js            # Frontend logic, fetch API, modals, sorting & validation
├── routes/
│   └── employeeRoutes.js     # Express REST API routes
├── services/
│   └── storageService.js     # Storage abstraction (MongoDB + JSON fallback)
├── .env                      # Environment variables
├── .env.example              # Template environment configuration
├── package.json              # Project dependencies and npm scripts
├── postman_collection.json   # Ready-to-import Postman Collection
├── server.js                 # Express server entry point
└── README.md                 # Complete documentation & testing guide
```

---

## 📄 License
MIT License &copy; 2026 StaffFlow Pro
