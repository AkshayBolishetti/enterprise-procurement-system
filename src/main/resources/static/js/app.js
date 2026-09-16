// Global state
let currentUser = null;
let currentRequests = [];
let currentPayments = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkCurrentUser();
});

// Check if user is logged in
async function checkCurrentUser() {
    try {
        const response = await fetch('/api/procurement-requests/my-requests');
        if (response.ok) {
            // Logged in as some user, fetch profile
            const profileRes = await fetch('/api/users/me'); // fallback check
            if (profileRes.ok) {
                const resData = await profileRes.json();
                currentUser = resData.data;
            } else {
                // Infer from requests or default
                currentUser = { role: 'ADMIN', name: 'System User' };
            }
            showMainUI();
        } else {
            showLoginUI();
        }
    } catch (err) {
        showLoginUI();
    }
}

function showLoginUI() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('navLinks').style.display = 'none';
    document.getElementById('userProfile').style.display = 'none';
}

function showMainUI() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
    document.getElementById('navLinks').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'flex';

    if (currentUser) {
        const badge = document.getElementById('userBadge');
        badge.textContent = currentUser.role || 'USER';
        badge.className = 'role-badge ' + (currentUser.role === 'ADMIN' ? 'role-admin' : 'role-employee');
        document.getElementById('userNameDisplay').textContent = currentUser.name || currentUser.email || 'User';
        
        // Hide payment history tab for regular employees
        if (currentUser.role !== 'ADMIN') {
            document.getElementById('btnTabPayments').style.display = 'none';
        } else {
            document.getElementById('btnTabPayments').style.display = 'inline-block';
        }
    }

    loadRequests();
}

async function handleLogin(e) {
    e.preventDefault();
    const alertDiv = document.getElementById('loginAlert');
    alertDiv.innerHTML = '';

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.data;
            showMainUI();
        } else {
            alertDiv.innerHTML = `<div class="alert alert-error">${data.message || 'Invalid credentials'}</div>`;
        }
    } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">Network error. Please try again.</div>`;
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    currentUser = null;
    showLoginUI();
}

function switchTab(tabName) {
    document.getElementById('btnTabRequests').classList.remove('active');
    document.getElementById('btnTabPayments').classList.remove('active');

    if (tabName === 'requests') {
        document.getElementById('btnTabRequests').classList.add('active');
        document.getElementById('tabRequests').style.display = 'block';
        document.getElementById('tabPayments').style.display = 'none';
        loadRequests();
    } else if (tabName === 'payments') {
        document.getElementById('btnTabPayments').classList.add('active');
        document.getElementById('tabRequests').style.display = 'none';
        document.getElementById('tabPayments').style.display = 'block';
        loadPayments();
    }
}

// Load Procurement Requests
async function loadRequests() {
    const tbody = document.getElementById('requestsTableBody');
    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted);">Loading requests...</td></tr>`;

    const statusFilter = document.getElementById('filterRequestStatus').value;
    const endpoint = (currentUser && currentUser.role === 'ADMIN') 
        ? '/api/procurement-requests' 
        : '/api/procurement-requests/my-requests';

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--danger);">Failed to load requests</td></tr>`;
            return;
        }

        const data = await response.json();
        let requests = data.data || [];
        if (statusFilter) {
            requests = requests.filter(r => r.status === statusFilter);
        }
        currentRequests = requests;

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted);">No requests found.</td></tr>`;
            return;
        }

        tbody.innerHTML = requests.map(req => {
            const isAdmin = currentUser && currentUser.role === 'ADMIN';
            const isApproved = req.status === 'APPROVED';
            const isPaid = req.paymentStatus === 'SUCCESS';

            let approvalBadge = `<span class="badge badge-${req.status ? req.status.toLowerCase() : 'pending'}">${req.status}</span>`;
            
            let paymentBadge = `<span class="badge badge-pending">PAYMENT PENDING</span>`;
            if (isPaid) {
                paymentBadge = `<span class="badge badge-success">PAID (${req.paymentReference || 'SUCCESS'})</span>`;
            } else if (req.paymentStatus === 'FAILED') {
                paymentBadge = `<span class="badge badge-failed">PAYMENT FAILED</span>`;
            } else if (!isApproved) {
                paymentBadge = `<span style="color: var(--text-muted); font-size: 0.8rem;">-</span>`;
            }

            let actionBtn = '';
            if (isAdmin) {
                if (req.status === 'PENDING') {
                    actionBtn = `
                        <button class="btn btn-success" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="approveRequest(${req.id})">Approve</button>
                        <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="rejectRequest(${req.id})">Reject</button>
                    `;
                } else if (isApproved) {
                    if (isPaid) {
                        actionBtn = `<button class="btn btn-secondary" disabled style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Paid</button>`;
                    } else {
                        actionBtn = `<button class="btn btn-primary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="openPaymentModal(${req.id})">💳 Make Payment</button>`;
                    }
                } else {
                    actionBtn = `<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>`;
                }
            } else {
                actionBtn = `<span style="color: var(--text-muted); font-size: 0.8rem;">View Only</span>`;
            }

            return `
                <tr>
                    <td>#${req.id}</td>
                    <td><code>${req.productCode || '-'}</code></td>
                    <td><strong>${req.productName || '-'}</strong></td>
                    <td>${req.quantity}</td>
                    <td>$${req.unitPrice ? req.unitPrice.toFixed(2) : '0.00'}</td>
                    <td><strong style="color: var(--secondary);">$${req.totalPrice ? req.totalPrice.toFixed(2) : '0.00'}</strong></td>
                    <td>${req.departmentName || '-'}</td>
                    <td>${req.requestedByName || '-'}</td>
                    <td>${approvalBadge}</td>
                    <td>${paymentBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--danger);">Error loading data</td></tr>`;
    }
}

async function approveRequest(id) {
    if (!confirm('Are you sure you want to approve this request?')) return;
    try {
        const res = await fetch(`/api/procurement-requests/${id}/approve`, { method: 'PUT' });
        if (res.ok) {
            loadRequests();
        } else {
            alert('Failed to approve request.');
        }
    } catch (e) {
        alert('Error approving request.');
    }
}

async function rejectRequest(id) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
        const res = await fetch(`/api/procurement-requests/${id}/reject`, { method: 'PUT' });
        if (res.ok) {
            loadRequests();
        } else {
            alert('Failed to reject request.');
        }
    } catch (e) {
        alert('Error rejecting request.');
    }
}

// Payment Modal logic
function openPaymentModal(reqId) {
    const req = currentRequests.find(r => r.id === reqId);
    if (!req) return;

    document.getElementById('paymentModalAlert').innerHTML = '';
    document.getElementById('modalInputReqId').value = req.id;
    document.getElementById('modalReqId').textContent = '#' + req.id;
    document.getElementById('modalProductName').textContent = req.productName;
    document.getElementById('modalProductCode').textContent = req.productCode;
    document.getElementById('modalDeptCat').textContent = `${req.departmentName || '-'} / ${req.categoryName || '-'}`;
    document.getElementById('modalRequestedBy').textContent = req.requestedByName || '-';
    document.getElementById('modalTotalAmount').textContent = '$' + (req.totalPrice ? req.totalPrice.toFixed(2) : '0.00');
    document.getElementById('modalAmount').value = req.totalPrice || 0;

    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

async function handleProcessPayment(e) {
    e.preventDefault();
    const alertDiv = document.getElementById('paymentModalAlert');
    alertDiv.innerHTML = '';

    const reqId = parseInt(document.getElementById('modalInputReqId').value);
    const paymentMethod = document.getElementById('modalPaymentMethod').value;
    const amount = parseFloat(document.getElementById('modalAmount').value);

    const btnSubmit = document.getElementById('btnSubmitPayment');
    const btnText = document.getElementById('btnPaymentText');
    const btnSpinner = document.getElementById('btnPaymentSpinner');

    btnSubmit.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';

    const idempotencyKey = 'IDEM-' + reqId + '-' + Date.now();

    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: reqId,
                paymentMethod: paymentMethod,
                amount: amount,
                idempotencyKey: idempotencyKey
            })
        });

        const data = await response.json();
        if (response.ok) {
            alertDiv.innerHTML = `<div class="alert alert-success">
                ✅ Payment Successful!<br>
                <strong>Ref:</strong> <code>${data.data.transactionReference}</code><br>
                <strong>Date:</strong> ${new Date(data.data.paymentDate).toLocaleString()}
            </div>`;

            setTimeout(() => {
                closePaymentModal();
                loadRequests();
            }, 1800);
        } else {
            alertDiv.innerHTML = `<div class="alert alert-error">${data.message || 'Payment processing failed.'}</div>`;
        }
    } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">Network error processing payment.</div>`;
    } finally {
        btnSubmit.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
    }
}

// Load Admin Payment History
async function loadPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Loading payment records...</td></tr>`;

    const statusFilter = document.getElementById('filterPaymentStatus').value;
    let url = '/api/payments';
    if (statusFilter) url += '?status=' + statusFilter;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger);">Failed to load payment history</td></tr>`;
            return;
        }

        const data = await response.json();
        const payments = data.data || [];
        currentPayments = payments;

        if (payments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No payment records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = payments.map(pay => `
            <tr>
                <td>#${pay.id}</td>
                <td><code>${pay.transactionReference}</code></td>
                <td>#${pay.requestId}</td>
                <td><strong>${pay.productName || '-'}</strong></td>
                <td><strong style="color: var(--secondary);">$${pay.amount ? pay.amount.toFixed(2) : '0.00'} ${pay.currency || 'USD'}</strong></td>
                <td><span class="badge" style="background: #334155; color: #fff;">${pay.paymentMethod}</span></td>
                <td><span class="badge badge-${pay.paymentStatus === 'SUCCESS' ? 'success' : 'failed'}">${pay.paymentStatus}</span></td>
                <td>${pay.paidByName || 'Admin'}</td>
                <td>${new Date(pay.paymentDate).toLocaleString()}</td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger);">Error fetching payment history</td></tr>`;
    }
}

// Modal for creating new request
function openNewRequestModal() {
    document.getElementById('newRequestAlert').innerHTML = '';
    document.getElementById('newRequestModal').classList.add('active');
}

function closeNewRequestModal() {
    document.getElementById('newRequestModal').classList.remove('active');
}

async function handleCreateRequest(e) {
    e.preventDefault();
    const alertDiv = document.getElementById('newRequestAlert');
    alertDiv.innerHTML = '';

    const payload = {
        productCode: document.getElementById('reqProductCode').value,
        productName: document.getElementById('reqProductName').value,
        quantity: parseInt(document.getElementById('reqQuantity').value),
        unitPrice: parseFloat(document.getElementById('reqUnitPrice').value),
        departmentId: parseInt(document.getElementById('reqDeptId').value),
        categoryId: parseInt(document.getElementById('reqCatId').value),
        requestedById: currentUser ? currentUser.id : null,
        status: 'PENDING'
    };

    try {
        const response = await fetch('/api/procurement-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alertDiv.innerHTML = `<div class="alert alert-success">Request created successfully!</div>`;
            setTimeout(() => {
                closeNewRequestModal();
                loadRequests();
            }, 1200);
        } else {
            alertDiv.innerHTML = `<div class="alert alert-error">${data.message || 'Failed to create request.'}</div>`;
        }
    } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">Network error.</div>`;
    }
}

function downloadCsv() {
    const filterSelect = document.getElementById('filterRequestStatus');
    const status = filterSelect && filterSelect.value ? filterSelect.value : 'ALL';
    window.location.href = `/api/requests/download?status=${status}`;
}
