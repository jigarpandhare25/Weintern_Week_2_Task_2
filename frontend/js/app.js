/**
 * StaffFlow Pro - Frontend Application Logic
 * Integrates with Node.js/Express REST API & MongoDB
 * Features: INR (₹) Currency, Dynamic Department Management, Full CRUD, Search, Filter, Sort
 */

// API Endpoints
const API_BASE = '/api/employees';
const DEPT_API = '/api/departments';

// Application State
const state = {
  employees: [],
  departments: [],
  searchQuery: '',
  selectedDepartment: 'All',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  editingEmployeeId: null,
  deletingEmployeeId: null,
  viewingEmployeeId: null,
  isLoading: false
};

// DOM Elements
const DOM = {
  // Theme & DB
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIconSun: document.getElementById('themeIconSun'),
  themeIconMoon: document.getElementById('themeIconMoon'),
  dbStatusBadge: document.getElementById('dbStatusBadge'),
  dbStatusText: document.getElementById('dbStatusText'),

  // KPIs
  kpiTotalEmployees: document.getElementById('kpiTotalEmployees'),
  kpiActiveCount: document.getElementById('kpiActiveCount'),
  kpiTotalPayroll: document.getElementById('kpiTotalPayroll'),
  kpiAvgSalary: document.getElementById('kpiAvgSalary'),
  kpiDeptCount: document.getElementById('kpiDeptCount'),
  kpiTopDept: document.getElementById('kpiTopDept'),

  // Filters & Search
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  departmentFilter: document.getElementById('departmentFilter'),
  sortBySelect: document.getElementById('sortBySelect'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  seedDataBtn: document.getElementById('seedDataBtn'),
  refreshTableBtn: document.getElementById('refreshTableBtn'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  // Table
  employeeTableBody: document.getElementById('employeeTableBody'),
  recordsCountBadge: document.getElementById('recordsCountBadge'),
  tableSkeleton: document.getElementById('tableSkeleton'),
  emptyState: document.getElementById('emptyState'),
  emptyStateDesc: document.getElementById('emptyStateDesc'),
  sortableHeaders: document.querySelectorAll('.sortable-th'),

  // Add / Edit Employee Modal
  openAddModalBtn: document.getElementById('openAddModalBtn'),
  employeeModal: document.getElementById('employeeModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelFormBtn: document.getElementById('cancelFormBtn'),
  employeeForm: document.getElementById('employeeForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  saveBtnText: document.getElementById('saveBtnText'),
  saveSpinner: document.getElementById('saveSpinner'),

  // Form Fields
  employeeIdInput: document.getElementById('employeeId'),
  empNameInput: document.getElementById('empName'),
  empEmailInput: document.getElementById('empEmail'),
  empDepartmentSelect: document.getElementById('empDepartment'),
  empRoleInput: document.getElementById('empRole'),
  empSalaryInput: document.getElementById('empSalary'),
  empJoinDateInput: document.getElementById('empJoinDate'),
  empStatusSelect: document.getElementById('empStatus'),

  // Form Field Errors
  nameError: document.getElementById('nameError'),
  emailError: document.getElementById('emailError'),
  departmentError: document.getElementById('departmentError'),
  roleError: document.getElementById('roleError'),
  salaryError: document.getElementById('salaryError'),
  joinDateError: document.getElementById('joinDateError'),

  // Department Modal Elements
  openAddDeptModalBtn: document.getElementById('openAddDeptModalBtn'),
  quickAddDeptBtn: document.getElementById('quickAddDeptBtn'),
  departmentModal: document.getElementById('departmentModal'),
  closeDeptModalBtn: document.getElementById('closeDeptModalBtn'),
  cancelDeptBtn: document.getElementById('cancelDeptBtn'),
  departmentForm: document.getElementById('departmentForm'),
  deptNameInput: document.getElementById('deptName'),
  deptNameError: document.getElementById('deptNameError'),
  saveDeptBtn: document.getElementById('saveDeptBtn'),
  saveDeptBtnText: document.getElementById('saveDeptBtnText'),
  saveDeptSpinner: document.getElementById('saveDeptSpinner'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteEmpName: document.getElementById('deleteEmpName'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  deleteBtnText: document.getElementById('deleteBtnText'),
  deleteSpinner: document.getElementById('deleteSpinner'),

  // View Profile Modal
  viewModal: document.getElementById('viewModal'),
  closeViewModalBtn: document.getElementById('closeViewModalBtn'),
  closeViewBtn: document.getElementById('closeViewBtn'),
  editFromViewBtn: document.getElementById('editFromViewBtn'),
  viewAvatar: document.getElementById('viewAvatar'),
  viewName: document.getElementById('viewName'),
  viewRole: document.getElementById('viewRole'),
  viewDeptBadge: document.getElementById('viewDeptBadge'),
  viewEmail: document.getElementById('viewEmail'),
  viewSalary: document.getElementById('viewSalary'),
  viewJoinDate: document.getElementById('viewJoinDate'),
  viewStatus: document.getElementById('viewStatus'),
  viewId: document.getElementById('viewId'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  fetchDepartments();
  fetchStats();
  fetchEmployees();
});

// ==========================================
// Theme Management
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('staffflow_theme') || 'dark';
  applyTheme(savedTheme);

  DOM.themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('staffflow_theme', theme);
  if (theme === 'dark') {
    DOM.themeIconSun.classList.remove('hidden');
    DOM.themeIconMoon.classList.add('hidden');
  } else {
    DOM.themeIconSun.classList.add('hidden');
    DOM.themeIconMoon.classList.remove('hidden');
  }
}

// ==========================================
// Event Listeners
// ==========================================
function setupEventListeners() {
  // Live Search
  let debounceTimeout = null;
  DOM.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val.length > 0) {
      DOM.clearSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearSearchBtn.classList.add('hidden');
    }
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.searchQuery = val;
      fetchEmployees();
    }, 280);
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    fetchEmployees();
  });

  // Department Filter
  DOM.departmentFilter.addEventListener('change', (e) => {
    state.selectedDepartment = e.target.value;
    fetchEmployees();
  });

  // Sort Selector Dropdown
  DOM.sortBySelect.addEventListener('change', (e) => {
    const [field, order] = e.target.value.split('_');
    state.sortBy = field;
    state.sortOrder = order;
    updateHeaderSortIndicators();
    fetchEmployees();
  });

  // Clickable Table Headers Sorting
  DOM.sortableHeaders.forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (state.sortBy === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = field;
        state.sortOrder = 'asc';
      }
      const matchingVal = `${state.sortBy}_${state.sortOrder}`;
      for (let opt of DOM.sortBySelect.options) {
        if (opt.value === matchingVal) {
          DOM.sortBySelect.value = matchingVal;
          break;
        }
      }
      updateHeaderSortIndicators();
      fetchEmployees();
    });
  });

  // Refresh Table Button
  DOM.refreshTableBtn.addEventListener('click', () => {
    fetchDepartments();
    fetchStats();
    fetchEmployees();
    showToast('Refreshed employee list', 'info');
  });

  // Reset Filters Button
  DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);

  // Seed Data Button
  DOM.seedDataBtn.addEventListener('click', handleSeedData);

  // Export to CSV
  DOM.exportCsvBtn.addEventListener('click', exportToCsv);

  // Add / Edit Employee Modal
  DOM.openAddModalBtn.addEventListener('click', openAddModal);
  DOM.closeModalBtn.addEventListener('click', closeEmployeeModal);
  DOM.cancelFormBtn.addEventListener('click', closeEmployeeModal);
  DOM.employeeForm.addEventListener('submit', handleFormSubmit);

  // Department Modals & Quick Action
  if (DOM.openAddDeptModalBtn) {
    DOM.openAddDeptModalBtn.addEventListener('click', openDeptModal);
  }
  if (DOM.quickAddDeptBtn) {
    DOM.quickAddDeptBtn.addEventListener('click', openDeptModal);
  }
  if (DOM.closeDeptModalBtn) {
    DOM.closeDeptModalBtn.addEventListener('click', closeDeptModal);
  }
  if (DOM.cancelDeptBtn) {
    DOM.cancelDeptBtn.addEventListener('click', closeDeptModal);
  }
  if (DOM.departmentForm) {
    DOM.departmentForm.addEventListener('submit', handleDepartmentSubmit);
    DOM.deptNameInput.addEventListener('input', () => {
      DOM.deptNameInput.classList.remove('input-error');
      DOM.deptNameError.textContent = '';
    });
  }

  // Detect when user selects "+ Add New Department..." in dropdown
  DOM.empDepartmentSelect.addEventListener('change', (e) => {
    if (e.target.value === '__ADD_NEW__') {
      e.target.value = '';
      openDeptModal();
    }
  });

  // Clear validation error on employee input
  [DOM.empNameInput, DOM.empEmailInput, DOM.empDepartmentSelect, DOM.empRoleInput, DOM.empSalaryInput, DOM.empJoinDateInput].forEach((input) => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const errorSpan = document.getElementById(`${input.name}Error`);
      if (errorSpan) errorSpan.textContent = '';
    });
  });

  // Delete Modal
  DOM.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  DOM.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // View Details Modal
  DOM.closeViewModalBtn.addEventListener('click', closeViewModal);
  DOM.closeViewBtn.addEventListener('click', closeViewModal);
  DOM.editFromViewBtn.addEventListener('click', () => {
    const empId = state.viewingEmployeeId;
    closeViewModal();
    const emp = state.employees.find((e) => (e._id || e.id) === empId);
    if (emp) openEditModal(emp);
  });

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEmployeeModal();
      closeDeleteModal();
      closeViewModal();
      closeDeptModal();
    }
  });

  [DOM.employeeModal, DOM.deleteModal, DOM.viewModal, DOM.departmentModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeEmployeeModal();
          closeDeleteModal();
          closeViewModal();
          closeDeptModal();
        }
      });
    }
  });
}

// ==========================================
// Department Operations
// ==========================================
async function fetchDepartments() {
  try {
    const response = await fetch(DEPT_API);
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      state.departments = result.data;
      populateDepartmentDropdowns(result.data);
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
  }
}

function populateDepartmentDropdowns(departments, autoSelectDept = null) {
  // 1. Populate Filter Dropdown
  const currentFilterVal = DOM.departmentFilter.value || 'All';
  DOM.departmentFilter.innerHTML = '<option value="All">All Departments</option>';
  departments.forEach((dept) => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    DOM.departmentFilter.appendChild(opt);
  });
  if (departments.includes(currentFilterVal)) {
    DOM.departmentFilter.value = currentFilterVal;
  } else {
    DOM.departmentFilter.value = 'All';
  }

  // 2. Populate Employee Form Select
  const currentFormVal = autoSelectDept || DOM.empDepartmentSelect.value;
  DOM.empDepartmentSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
  departments.forEach((dept) => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    DOM.empDepartmentSelect.appendChild(opt);
  });

  // Add the quick "+ Add New Department..." option at the bottom
  const addNewOpt = document.createElement('option');
  addNewOpt.value = '__ADD_NEW__';
  addNewOpt.textContent = '+ Add New Department...';
  DOM.empDepartmentSelect.appendChild(addNewOpt);

  if (autoSelectDept && departments.includes(autoSelectDept)) {
    DOM.empDepartmentSelect.value = autoSelectDept;
  } else if (currentFormVal && departments.includes(currentFormVal)) {
    DOM.empDepartmentSelect.value = currentFormVal;
  }
}

function openDeptModal() {
  DOM.departmentForm.reset();
  DOM.deptNameInput.classList.remove('input-error');
  DOM.deptNameError.textContent = '';
  DOM.saveDeptSpinner.classList.add('hidden');
  DOM.saveDeptBtnText.textContent = 'Add Department';
  DOM.saveDeptBtn.disabled = false;
  DOM.departmentModal.classList.remove('hidden');
  DOM.deptNameInput.focus();
}

function closeDeptModal() {
  DOM.departmentModal.classList.add('hidden');
  DOM.deptNameInput.classList.remove('input-error');
  DOM.deptNameError.textContent = '';
}

async function handleDepartmentSubmit(e) {
  e.preventDefault();

  const nameVal = DOM.deptNameInput.value.trim();
  if (!nameVal || nameVal.length < 2) {
    DOM.deptNameInput.classList.add('input-error');
    DOM.deptNameError.textContent = 'Department name must be at least 2 characters.';
    return;
  }

  DOM.saveDeptSpinner.classList.remove('hidden');
  DOM.saveDeptBtnText.textContent = 'Adding...';
  DOM.saveDeptBtn.disabled = true;

  try {
    const response = await fetch(DEPT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`Department '${result.data}' added successfully!`, 'success');
      closeDeptModal();
      await fetchDepartments();
      // Auto-select in employee modal if open
      DOM.empDepartmentSelect.value = result.data;
      fetchStats();
    } else {
      DOM.deptNameInput.classList.add('input-error');
      DOM.deptNameError.textContent = result.error || 'Failed to create department';
    }
  } catch (error) {
    console.error('Error adding department:', error);
    DOM.deptNameError.textContent = 'Network error while adding department';
  } finally {
    DOM.saveDeptSpinner.classList.add('hidden');
    DOM.saveDeptBtnText.textContent = 'Add Department';
    DOM.saveDeptBtn.disabled = false;
  }
}

// ==========================================
// API Operations
// ==========================================

// Fetch Employees with Search, Filter & Sort
async function fetchEmployees() {
  setLoadingState(true);

  try {
    const params = new URLSearchParams({
      search: state.searchQuery,
      department: state.selectedDepartment,
      sortBy: state.sortBy,
      order: state.sortOrder
    });

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      state.employees = result.data;
      renderTable(result.data);
      DOM.recordsCountBadge.textContent = `${result.data.length} records`;
    } else {
      showToast('Failed to load employee list', 'error');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Network error connecting to API server', 'error');
  } finally {
    setLoadingState(false);
  }
}

// Fetch HR Summary Stats
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/stats/summary`);
    const result = await response.json();

    if (result.success) {
      const stats = result.data;
      DOM.kpiTotalEmployees.textContent = stats.totalEmployees || 0;
      DOM.kpiActiveCount.textContent = `${stats.totalEmployees || 0} Team Members`;
      DOM.kpiTotalPayroll.textContent = formatCurrency(stats.totalPayroll || 0);
      DOM.kpiAvgSalary.textContent = formatCurrency(stats.averageSalary || 0);

      const deptKeys = Object.keys(stats.departmentCounts || {});
      DOM.kpiDeptCount.textContent = deptKeys.length;
      if (deptKeys.length > 0) {
        const topDept = deptKeys.reduce((a, b) => (stats.departmentCounts[a] > stats.departmentCounts[b] ? a : b));
        DOM.kpiTopDept.textContent = `Largest: ${topDept}`;
      } else {
        DOM.kpiTopDept.textContent = 'Active Divisions';
      }

      if (stats.storageMode && stats.storageMode.includes('MongoDB')) {
        DOM.dbStatusBadge.className = 'db-status-badge';
        DOM.dbStatusText.textContent = 'MongoDB Connected';
      } else {
        DOM.dbStatusBadge.className = 'db-status-badge fallback';
        DOM.dbStatusText.textContent = 'Persistent Storage Active';
      }
    }
  } catch (error) {
    console.error('Stats error:', error);
    DOM.dbStatusBadge.className = 'db-status-badge fallback';
    DOM.dbStatusText.textContent = 'Server Offline';
  }
}

// Reset & Seed Sample Data
async function handleSeedData() {
  if (!confirm('This will reset and seed the database with sample employee records (INR ₹). Continue?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/seed`, { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      showToast('Database reset with 8 sample employees (INR)!', 'success');
      resetAllFilters();
      await fetchDepartments();
      fetchStats();
      fetchEmployees();
    } else {
      showToast('Failed to seed records', 'error');
    }
  } catch (error) {
    console.error('Seed error:', error);
    showToast('Failed to connect to backend', 'error');
  }
}

// ==========================================
// Form Validation & Submission (Add / Edit)
// ==========================================
async function handleFormSubmit(e) {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) return;

  const employeeData = {
    name: DOM.empNameInput.value.trim(),
    email: DOM.empEmailInput.value.trim() || undefined,
    department: DOM.empDepartmentSelect.value,
    role: DOM.empRoleInput.value.trim(),
    salary: Number(DOM.empSalaryInput.value),
    joinDate: DOM.empJoinDateInput.value,
    status: DOM.empStatusSelect.value
  };

  const isEditing = !!state.editingEmployeeId;
  const endpoint = isEditing ? `${API_BASE}/${state.editingEmployeeId}` : API_BASE;
  const method = isEditing ? 'PUT' : 'POST';

  setFormSubmitting(true);

  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    const result = await response.json();

    if (result.success) {
      showToast(
        isEditing ? 'Employee details updated successfully!' : 'New employee registered successfully!',
        'success'
      );
      closeEmployeeModal();
      fetchStats();
      fetchEmployees();
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        showToast(result.errors.join(', '), 'error');
      } else {
        showToast(result.error || 'Operation failed', 'error');
      }
    }
  } catch (error) {
    console.error('Submit error:', error);
    showToast('Network error while saving employee', 'error');
  } finally {
    setFormSubmitting(false);
  }
}

function validateForm() {
  let valid = true;
  clearErrors();

  const nameVal = DOM.empNameInput.value.trim();
  if (!nameVal || nameVal.length < 2) {
    showFieldError(DOM.empNameInput, DOM.nameError, 'Name is required (min 2 characters)');
    valid = false;
  }

  const deptVal = DOM.empDepartmentSelect.value;
  if (!deptVal || deptVal === '__ADD_NEW__') {
    showFieldError(DOM.empDepartmentSelect, DOM.departmentError, 'Please select a valid department');
    valid = false;
  }

  const roleVal = DOM.empRoleInput.value.trim();
  if (!roleVal || roleVal.length < 2) {
    showFieldError(DOM.empRoleInput, DOM.roleError, 'Role/Title is required (min 2 characters)');
    valid = false;
  }

  const salaryVal = Number(DOM.empSalaryInput.value);
  if (!salaryVal || isNaN(salaryVal) || salaryVal <= 0) {
    showFieldError(DOM.empSalaryInput, DOM.salaryError, 'Salary must be greater than 0');
    valid = false;
  }

  let joinDateVal = DOM.empJoinDateInput.value;
  if (!joinDateVal) {
    joinDateVal = new Date().toISOString().split('T')[0];
    DOM.empJoinDateInput.value = joinDateVal;
  }

  const emailVal = DOM.empEmailInput.value.trim();
  if (emailVal) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailVal)) {
      showFieldError(DOM.empEmailInput, DOM.emailError, 'Please enter a valid email address');
      valid = false;
    }
  }

  return valid;
}

function showFieldError(inputElement, errorElement, message) {
  inputElement.classList.add('input-error');
  if (errorElement) errorElement.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-input').forEach((el) => el.classList.remove('input-error'));
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
}

// ==========================================
// Delete Operation
// ==========================================
function openDeleteModal(employee) {
  state.deletingEmployeeId = employee._id || employee.id;
  DOM.deleteEmpName.textContent = employee.name;
  DOM.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  DOM.deleteModal.classList.add('hidden');
  state.deletingEmployeeId = null;
}

async function handleConfirmDelete() {
  if (!state.deletingEmployeeId) return;

  DOM.deleteSpinner.classList.remove('hidden');
  DOM.deleteBtnText.textContent = 'Deleting...';
  DOM.confirmDeleteBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/${state.deletingEmployeeId}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (result.success) {
      showToast('Employee record deleted permanently', 'success');
      closeDeleteModal();
      fetchStats();
      fetchEmployees();
    } else {
      showToast(result.error || 'Failed to delete record', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Network error while deleting employee', 'error');
  } finally {
    DOM.deleteSpinner.classList.add('hidden');
    DOM.deleteBtnText.textContent = 'Yes, Delete Record';
    DOM.confirmDeleteBtn.disabled = false;
  }
}

// ==========================================
// Modal Open / Close Handlers
// ==========================================
function openAddModal() {
  state.editingEmployeeId = null;
  DOM.employeeForm.reset();
  clearErrors();
  DOM.employeeIdInput.value = '';
  DOM.modalTitle.textContent = 'Add New Employee';
  DOM.modalSubtitle.textContent = 'Enter employee professional and compensation details (in ₹ INR)';
  DOM.saveBtnText.textContent = 'Save Record';

  DOM.empJoinDateInput.value = new Date().toISOString().split('T')[0];

  DOM.employeeModal.classList.remove('hidden');
  DOM.empNameInput.focus();
}

function openEditModal(employee) {
  state.editingEmployeeId = employee._id || employee.id;
  clearErrors();

  DOM.employeeIdInput.value = state.editingEmployeeId;
  DOM.empNameInput.value = employee.name || '';
  DOM.empEmailInput.value = employee.email || '';
  DOM.empDepartmentSelect.value = employee.department || '';
  DOM.empRoleInput.value = employee.role || '';
  DOM.empSalaryInput.value = employee.salary || '';

  if (employee.joinDate) {
    DOM.empJoinDateInput.value = new Date(employee.joinDate).toISOString().split('T')[0];
  } else {
    DOM.empJoinDateInput.value = '';
  }

  DOM.empStatusSelect.value = employee.status || 'Active';

  DOM.modalTitle.textContent = 'Edit Employee Record';
  DOM.modalSubtitle.textContent = `Updating information for ${employee.name}`;
  DOM.saveBtnText.textContent = 'Update Record';

  DOM.employeeModal.classList.remove('hidden');
  DOM.empNameInput.focus();
}

function closeEmployeeModal() {
  DOM.employeeModal.classList.add('hidden');
  clearErrors();
  state.editingEmployeeId = null;
}

function openViewModal(employee) {
  state.viewingEmployeeId = employee._id || employee.id;

  DOM.viewAvatar.textContent = getInitials(employee.name);
  DOM.viewName.textContent = employee.name;
  DOM.viewRole.textContent = employee.role;
  DOM.viewEmail.textContent = employee.email || 'N/A';
  DOM.viewSalary.textContent = formatCurrency(employee.salary);
  DOM.viewJoinDate.textContent = formatDate(employee.joinDate);
  DOM.viewStatus.textContent = employee.status || 'Active';
  DOM.viewId.textContent = state.viewingEmployeeId;

  DOM.viewDeptBadge.textContent = employee.department;
  DOM.viewDeptBadge.className = `dept-badge ${getDepartmentBadgeClass(employee.department)}`;

  DOM.viewModal.classList.remove('hidden');
}

function closeViewModal() {
  DOM.viewModal.classList.add('hidden');
  state.viewingEmployeeId = null;
}

// ==========================================
// Rendering Table & UI Helpers
// ==========================================
function renderTable(employees) {
  DOM.employeeTableBody.innerHTML = '';

  if (employees.length === 0) {
    DOM.emptyState.classList.remove('hidden');
    if (state.searchQuery || state.selectedDepartment !== 'All') {
      DOM.emptyStateDesc.textContent = `No employees found matching "${state.searchQuery || state.selectedDepartment}".`;
    } else {
      DOM.emptyStateDesc.textContent = 'No employees currently registered. Click "Add Employee" to create one.';
    }
    return;
  }

  DOM.emptyState.classList.add('hidden');

  employees.forEach((emp) => {
    const tr = document.createElement('tr');
    const empId = emp._id || emp.id;

    tr.innerHTML = `
      <td>
        <div class="employee-cell">
          <div class="employee-avatar">${getInitials(emp.name)}</div>
          <div class="employee-info">
            <span class="emp-name-text">${escapeHtml(emp.name)}</span>
            <span class="emp-email-text">${escapeHtml(emp.email || 'No email')}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="dept-badge ${getDepartmentBadgeClass(emp.department)}">
          ${escapeHtml(emp.department)}
        </span>
      </td>
      <td>
        <strong>${escapeHtml(emp.role)}</strong>
      </td>
      <td>
        <span class="text-emerald" style="font-weight: 700;">${formatCurrency(emp.salary)}</span>
      </td>
      <td>
        ${formatDate(emp.joinDate)}
      </td>
      <td>
        <span class="status-pill ${getStatusBadgeClass(emp.status)}">
          ● ${escapeHtml(emp.status || 'Active')}
        </span>
      </td>
      <td class="text-right">
        <div class="table-actions">
          <button class="row-action-btn btn-view" title="View Profile" data-id="${empId}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button class="row-action-btn btn-edit" title="Edit Employee" data-id="${empId}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="row-action-btn btn-delete" title="Delete Employee" data-id="${empId}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-view').addEventListener('click', () => openViewModal(emp));
    tr.querySelector('.btn-edit').addEventListener('click', () => openEditModal(emp));
    tr.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(emp));

    DOM.employeeTableBody.appendChild(tr);
  });
}

function updateHeaderSortIndicators() {
  DOM.sortableHeaders.forEach((th) => {
    const field = th.dataset.sort;
    const indicator = th.querySelector('.sort-indicator');

    if (state.sortBy === field) {
      th.classList.add('active-sort');
      indicator.textContent = state.sortOrder === 'asc' ? '▲' : '▼';
    } else {
      th.classList.remove('active-sort');
      indicator.textContent = '↕';
    }
  });
}

function setLoadingState(loading) {
  state.isLoading = loading;
  if (loading) {
    DOM.tableSkeleton.classList.remove('hidden');
    DOM.emptyState.classList.add('hidden');
    DOM.recordsCountBadge.textContent = 'Updating...';
  } else {
    DOM.tableSkeleton.classList.add('hidden');
  }
}

function setFormSubmitting(submitting) {
  DOM.saveSpinner.classList.toggle('hidden', !submitting);
  DOM.saveEmployeeBtn.disabled = submitting;
  if (submitting) {
    DOM.saveBtnText.textContent = state.editingEmployeeId ? 'Updating...' : 'Saving...';
  } else {
    DOM.saveBtnText.textContent = state.editingEmployeeId ? 'Update Record' : 'Save Record';
  }
}

function resetAllFilters() {
  state.searchQuery = '';
  state.selectedDepartment = 'All';
  state.sortBy = 'createdAt';
  state.sortOrder = 'desc';

  DOM.searchInput.value = '';
  DOM.clearSearchBtn.classList.add('hidden');
  DOM.departmentFilter.value = 'All';
  DOM.sortBySelect.value = 'createdAt_desc';

  updateHeaderSortIndicators();
  fetchEmployees();
}

// ==========================================
// Export Table View to CSV
// ==========================================
function exportToCsv() {
  if (state.employees.length === 0) {
    showToast('No employee records to export', 'error');
    return;
  }

  const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Salary_INR', 'JoinDate', 'Status'];
  const rows = state.employees.map((emp) => [
    `"${emp._id || emp.id}"`,
    `"${emp.name.replace(/"/g, '""')}"`,
    `"${(emp.email || '').replace(/"/g, '""')}"`,
    `"${emp.department}"`,
    `"${emp.role.replace(/"/g, '""')}"`,
    emp.salary,
    `"${emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : ''}"`,
    `"${emp.status || 'Active'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `employees_inr_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Employees exported to CSV (INR)!', 'success');
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 260);
  }, 3500);
}

// ==========================================
// Helper Formatters
// ==========================================
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getInitials(name) {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getDepartmentBadgeClass(dept) {
  const map = {
    'Engineering': 'badge-engineering',
    'Design': 'badge-design',
    'Product': 'badge-product',
    'Marketing': 'badge-marketing',
    'Sales': 'badge-sales',
    'Human Resources': 'badge-human-resources',
    'Finance': 'badge-finance',
    'Operations': 'badge-operations',
    'Quality Assurance': 'badge-product',
    'Legal': 'badge-sales'
  };
  return map[dept] || 'badge-operations';
}

function getStatusBadgeClass(status) {
  const map = {
    'Active': 'status-active',
    'On Leave': 'status-on-leave',
    'Terminated': 'status-terminated'
  };
  return map[status] || 'status-active';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
