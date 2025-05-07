// Global variables
let editing = false;
const form = document.getElementById('customer-form');
const formTitle = document.getElementById('form-title');
const resetBtn = document.getElementById('reset-form');
const submitBtn = document.getElementById('submit-form');
const refreshBtn = document.getElementById('refresh-btn');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadCustomers();
  
  // Button event listeners
  refreshBtn.addEventListener('click', loadCustomers);
  resetBtn.addEventListener('click', resetForm);
  submitBtn.addEventListener('click', handleFormSubmit);
  
  // Form submit handler (prevent default submission)
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
});

// Form submission handler
function handleFormSubmit(event) {
  const customerData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value,
    country: document.getElementById('country').value,
    orders: []
  };
  
  // Form validation
  if (!customerData.name || !customerData.email || !customerData.phone) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (editing) {
    const id = document.getElementById('customer-id').value;
    updateCustomer(id, customerData);
  } else {
    createCustomer(customerData);
  }
}

// Load all customers
function loadCustomers() {
  showLoadingIndicator(true);
  
  fetch('/api/customers')
    .then(handleResponse)
    .then(customers => {
      renderCustomerTable(customers);
      showLoadingIndicator(false);
    })
    .catch(error => {
      console.error('Error loading customers:', error);
      showErrorMessage('Failed to load customers');
      showLoadingIndicator(false);
    });
}

// Create new customer
function createCustomer(customerData) {
  showLoadingIndicator(true);
  
  fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  })
    .then(handleResponse)
    .then(data => {
      resetForm();
      loadCustomers();
      showSuccessMessage('Customer created successfully!');
    })
    .catch(error => {
      console.error('Error creating customer:', error);
      showErrorMessage('Failed to create customer');
      showLoadingIndicator(false);
    });
}

// View customer details
function viewCustomer(id) {
  showLoadingIndicator(true);
  
  fetch(`/api/customers/${id}`)
    .then(handleResponse)
    .then(customer => {
      fillFormWithCustomerData(customer);
      formTitle.textContent = `Viewing Customer: ${customer.name}`;
      
      // Disable editing
      toggleFormInputs(true);
      submitBtn.style.display = 'none';
      showLoadingIndicator(false);
    })
    .catch(error => {
      console.error('Error fetching customer:', error);
      showErrorMessage('Failed to fetch customer details');
      showLoadingIndicator(false);
    });
}

// Prepare form for editing
function editCustomer(id) {
  showLoadingIndicator(true);
  
  fetch(`/api/customers/${id}`)
    .then(handleResponse)
    .then(customer => {
      fillFormWithCustomerData(customer);
      formTitle.textContent = `Edit Customer: ${customer.name}`;
      
      // Enable editing mode
      editing = true;
      toggleFormInputs(false);
      submitBtn.style.display = 'block';
      
      // Scroll to form
      document.querySelector('.customer-form').scrollIntoView({ behavior: 'smooth' });
      showLoadingIndicator(false);
    })
    .catch(error => {
      console.error('Error fetching customer:', error);
      showErrorMessage('Failed to load customer for editing');
      showLoadingIndicator(false);
    });
}

// Update customer
function updateCustomer(id, customerData) {
  showLoadingIndicator(true);
  
  fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  })
    .then(handleResponse)
    .then(data => {
      resetForm();
      loadCustomers();
      showSuccessMessage('Customer updated successfully!');
    })
    .catch(error => {
      console.error('Error updating customer:', error);
      showErrorMessage('Failed to update customer');
      showLoadingIndicator(false);
    });
}

// Delete customer
function deleteCustomer(id) {
  if (confirm('Are you sure you want to delete this customer?')) {
    showLoadingIndicator(true);
    
    fetch(`/api/customers/${id}`, {
      method: 'DELETE'
    })
      .then(handleResponse)
      .then(data => {
        loadCustomers();
        showSuccessMessage('Customer deleted successfully!');
      })
      .catch(error => {
        console.error('Error deleting customer:', error);
        showErrorMessage('Failed to delete customer');
        showLoadingIndicator(false);
      });
  }
}

// Reset form to initial state
function resetForm() {
  form.reset();
  document.getElementById('customer-id').value = '';
  formTitle.textContent = 'Add New Customer';
  editing = false;
  
  // Enable all inputs
  toggleFormInputs(false);
  submitBtn.style.display = 'block';
}

// Helper functions
function fillFormWithCustomerData(customer) {
  document.getElementById('customer-id').value = customer.id;
  document.getElementById('name').value = customer.name;
  document.getElementById('email').value = customer.email;
  document.getElementById('phone').value = customer.phone;
  document.getElementById('address').value = customer.address || '';
  document.getElementById('city').value = customer.city || '';
  document.getElementById('state').value = customer.state || '';
  document.getElementById('zip').value = customer.zip || '';
  document.getElementById('country').value = customer.country || '';
}

function renderCustomerTable(customers) {
  const tableBody = document.getElementById('customers-table');
  tableBody.innerHTML = '';
  
  if (customers.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No customers found</td></tr>';
    return;
  }
  
  customers.forEach(customer => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td class="actions">
        <button onclick="viewCustomer('${customer.id}')">View</button>
        <button onclick="editCustomer('${customer.id}')">Edit</button>
        <button onclick="deleteCustomer('${customer.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function toggleFormInputs(disabled) {
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => input.disabled = disabled);
}

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function showLoadingIndicator(show) {
  // If you want to add a loading indicator, implement it here
  // For now, we'll just log to console
  console.log(show ? 'Loading...' : 'Loading complete');
}

function showSuccessMessage(message) {
  alert(message);
}

function showErrorMessage(message) {
  alert(`Error: ${message}`);
}
