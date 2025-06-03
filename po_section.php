<!-- Purchase Order Section -->
<div class="po-section d-none">
    <div class="card shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-primary"><i class="bi bi-cart3"></i> Purchase Orders</h5>
            <div class="btn-group">
                <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPOModal">
                    <i class="bi bi-plus-circle"></i> Create New PO
                </button>
                <button class="btn btn-success btn-sm" id="exportPOBtn">
                    <i class="bi bi-file-earmark-excel"></i> Export
                </button>
                <button class="btn btn-info btn-sm text-white" id="printPOListBtn">
                    <i class="bi bi-printer"></i> Print
                </button>
            </div>
        </div>
        <div class="card-body">
            <div class="print-section">
                <div class="print-header d-none">
                    <h2>ICTD Inventory Management System</h2>
                    <p>Purchase Orders Report</p>
                    <p>Date: <span id="printPODate"></span></p>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="search-box d-flex align-items-center gap-3">
                        <div class="position-relative">
                            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2"></i>
                            <input type="text" id="poSearchInput" class="form-control ps-4" placeholder="Search PO..." style="width: 250px;">
                        </div>
                        <div class="filter-group d-flex gap-2">
                            <select class="form-select" id="poSupplierFilter" style="width: 150px;">
                                <option value="">All Suppliers</option>
                                <?php foreach ($all_suppliers as $supplier): ?>
                                    <option value="<?= htmlspecialchars($supplier) ?>"><?= htmlspecialchars($supplier) ?></option>
                                <?php endforeach; ?>
                            </select>   
                            <select class="form-select" id="poDateFilter" style="width: 150px;">
                                <option value="">All Dates</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                                <option value="180">Last 6 Months</option>
                                <option value="365">Last Year</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered table-hover align-middle shadow-sm" id="poTable">
                        <thead class="table-light">
                            <tr>
                                <th class="po-number-col">PO NO.</th>
                                <th class="supplier-col">SUPPLIER</th>
                                <th class="date-col">DATE</th>
                                <th class="amount-col">TOTAL AMOUNT</th>
                                <th class="actions-col">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="poTableBody">
                            <!-- Data will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>
                <!-- Add pagination controls for PO -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <span id="poPageInfo">Showing 1-7 of 0 purchase orders</span>
                    </div>
                    <div class="pagination-controls">
                        <button id="poPrevBtn" class="btn btn-sm btn-outline-primary" disabled>
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <button id="poNextBtn" class="btn btn-sm btn-outline-primary ms-2">
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add Purchase Order Modal -->
<div class="modal fade" id="addPOModal" tabindex="-1" aria-labelledby="addPOModalLabel">
    <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-gradient-primary text-white">
                <h5 class="modal-title" id="addPOModalLabel">Create New Purchase Order</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
            <div class="modal-body py-3">
                <form id="poForm">
                    <!-- Hidden fields for ML tracking -->
                    <input type="hidden" id="poTrackPrediction" name="track_for_prediction" value="true">
                    <input type="hidden" id="poTrackingData" name="tracking_data">

                    <div class="row g-3">
                        <!-- Left column - Main information -->
                        <div class="col-md-6">
                            <!-- PO Details Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">PO Information</h6>
                                    </div>
                                <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="poNo" class="form-label">PO NO.</label>
                                            <input type="text" class="form-control" id="poNo" name="po_no" placeholder="Enter PO number" required>
                                            </div>
                                        <div class="col-md-6">
                                            <label for="supplier" class="form-label">SUPPLIER</label>
                                            <input type="text" class="form-control" id="supplier" name="supplier_name" placeholder="Enter supplier name">
                                            </div>
                                        <div class="col-md-6">
                                            <label for="poDate" class="form-label">DATE</label>
                                            <input type="date" class="form-control" id="poDate" name="po_date">
                                            </div>
                                        <div class="col-md-6">
                                            <label for="refNo" class="form-label">Ref. No.</label>
                                            <input type="text" class="form-control" id="refNo" name="ref_no" placeholder="Enter reference number">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Supplier Information Section -->
                            <div class="card border-0 shadow-sm-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Supplier Information</h6>
                                    </div>
                                    <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="modeOfProcurement" class="form-label">Mode of Procurement</label>
                                            <input type="text" class="form-control" id="modeOfProcurement" name="mode_of_procurement" placeholder="Enter mode of procurement">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="emailAddress" class="form-label">E-Mail Address</label>
                                            <input type="email" class="form-control" id="emailAddress" name="email" placeholder="Enter email address">
                                    </div>
                                        <div class="col-12">
                                            <label for="supplierAddress" class="form-label">Supplier Address</label>
                                            <input type="text" class="form-control" id="supplierAddress" name="supplier_address" placeholder="Enter supplier address">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="telephoneNo" class="form-label">Tel.</label>
                                            <input type="text" class="form-control" id="telephoneNo" name="tel" placeholder="Enter telephone number">
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>

                        <!-- Right column - Additional information -->
                            <div class="col-md-6">
                            <!-- PR Information Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">PR Information</h6>
                                    </div>
                                    <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="prNo" class="form-label">PR No.</label>
                                            <input type="text" class="form-control" id="prNo" name="pr_no" placeholder="Enter PR number">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="prDate" class="form-label">Date</label>
                                            <input type="date" class="form-control" id="prDate" name="pr_date">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Delivery Information Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Delivery Information</h6>
                                    </div>
                                    <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="placeOfDelivery" class="form-label">Place of Delivery</label>
                                            <input type="text" class="form-control" id="placeOfDelivery" name="place_of_delivery" placeholder="Enter delivery place">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="deliveryDate" class="form-label">Date of Delivery</label>
                                            <input type="date" class="form-control" id="deliveryDate" name="delivery_date">
                                    </div>
                                        <div class="col-md-6">
                                            <label for="paymentTerm" class="form-label">Payment Term</label>
                                            <input type="text" class="form-control" id="paymentTerm" name="payment_term" placeholder="Enter payment term">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="deliveryTerm" class="form-label">Delivery Term</label>
                                            <input type="text" class="form-control" id="deliveryTerm" name="delivery_term" placeholder="Enter delivery term">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Obligation Information Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Obligation Information</h6>
                                    </div>
                                    <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="obligationRequestNo" class="form-label">Obligation Request No.</label>
                                            <input type="text" class="form-control" id="obligationRequestNo" name="obligation_request_no" placeholder="Enter obligation request number">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="obligationAmount" class="form-label">Obligation Amount</label>
                                            <div class="input-group">
                                                <span class="input-group-text">₱</span>
                                                <input type="text" class="form-control" id="obligationAmount" name="obligation_amount" placeholder="0.00">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        <!-- Full width - Gentlemen's note and item details -->
                        <div class="col-12">
                            <div class="alert alert-light rounded-3 border mb-3">
                                <p class="mb-1 fw-medium">Gentlemen:</p>
                                <p class="mb-0 small">Please furnish this office the following articles subject to the terms and conditions contained herein:</p>
                                </div>
                            </div>
                            
                        <!-- Item Details Section -->
                        <div class="col-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0 text-primary">Item Details</h6>
                                </div>
                                <div class="card-body">
                                <div class="table-responsive">
                                        <table class="table table-bordered enhanced-po-table" id="poItemsTable">
                                        <thead class="table-light">
                                            <tr>
                                                    <th>Item</th>
                                                    <th>Unit</th>
                                                    <th style="width: 30%;">Description</th>
                                                    <th>QTY</th>
                                                <th>Unit Cost</th>
                                                    <th>Amount</th>
                                                    <th>Action</th>
                                            </tr>
                                        </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <input type="text" class="form-control form-control-sm item-name" name="item_name[]" placeholder="Item">
                                                    </td>
                                                    <td>
                                                        <input type="text" class="form-control form-control-sm item-unit" name="unit[]" placeholder="Unit">
                                                    </td>
                                                    <td>
                                                        <textarea class="form-control form-control-sm item-description" name="item_description[]" placeholder="Description" rows="2" style="min-height: 60px;"></textarea>
                                                        <span class="truncated-indicator" style="display: none;">more</span>
                                                    </td>
                                                    <td>
                                                        <input type="number" class="form-control form-control-sm qty" name="quantity[]" placeholder="0">
                                                    </td>
                                                    <td>
                                                        <input type="number" class="form-control form-control-sm unit-cost" name="unit_cost[]" placeholder="0.00" min="0">
                                                    </td>
                                                    <td>
                                                        <input type="text" class="form-control form-control-sm amount" name="amount[]" placeholder="0.00" readonly>
                                                    </td>
                                                    <td class="text-center">
                                                        <button type="button" class="btn btn-sm btn-danger remove-row">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="7">
                                                        <button type="button" class="btn btn-sm btn-success" id="addRow">
                                                            <i class="bi bi-plus-circle"></i> Add Item
                                                        </button>
                                                    </td>
                                            </tr>
                                            <tr>
                                                    <td colspan="5" class="text-end fw-bold">Total Amount:</td>
                                                    <td>
                                                        <input type="text" class="form-control form-control-sm" id="totalAmount" value="₱0.00" readonly>
                                                </td>
                                                    <td></td>
                                            </tr>
                                            </tfoot>
                                    </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Cancel
                </button>
                <button type="button" class="btn btn-primary" id="savePoBtn">
                    Save PO
                </button>
            </div>
        </div>
    </div>
</div>

<!-- View Purchase Order Modal -->
<div class="modal fade" id="viewPOModal" tabindex="-1" aria-labelledby="viewPOModalLabel">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="viewPOModalLabel"><i class="bi bi-eye"></i> View Purchase Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="poLoading" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading purchase order details...</p>
                </div>  
                <div id="poContent"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="printPO()">Print</button>
            </div>
        </div>
    </div>
</div> 

<script>
// Helper to format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to save suppliers to localStorage
function saveSupplierToLocalStorage(supplier) {
    if (!supplier) return;
    
    // Get existing suppliers from localStorage or initialize empty array
    let suppliers = JSON.parse(localStorage.getItem('poSuppliers')) || [];
    
    // Add supplier if it doesn't exist
    if (!suppliers.includes(supplier)) {
        suppliers.push(supplier);
        localStorage.setItem('poSuppliers', JSON.stringify(suppliers));
    }
}

// Add event listener to Save PO button
const savePoBtn = document.getElementById('savePoBtn');
if (savePoBtn) {
    savePoBtn.addEventListener('click', function() {
        // Get supplier and date values from the form
        const supplierInput = document.getElementById('supplier');
        const dateInput = document.getElementById('poDate');
        const supplier = supplierInput ? supplierInput.value.trim() : '';
        const date = dateInput ? dateInput.value : '';
        
        // Save supplier to localStorage
        if (supplier) {
            saveSupplierToLocalStorage(supplier);
        }
        
        // Update Supplier Filter
        const supplierFilter = document.getElementById('poSupplierFilter');
        if (supplier && supplierFilter) {
            let exists = false;
            for (let i = 0; i < supplierFilter.options.length; i++) {
                if (supplierFilter.options[i].value === supplier) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                const option = document.createElement('option');
                option.value = supplier;
                option.textContent = supplier;
                supplierFilter.appendChild(option);
            }
        }

        // Update Date Filter (add only if not present and not empty)
        const dateFilter = document.getElementById('poDateFilter');
        if (date && dateFilter) {
            let exists = false;
            for (let i = 0; i < dateFilter.options.length; i++) {
                if (dateFilter.options[i].value === date) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                const option = document.createElement('option');
                option.value = date;
                option.textContent = formatDate(date);
                dateFilter.appendChild(option);
            }
        }
    });
}
</script> 

<script>
// --- PO Table Search & Filter Logic ---
function filterPOTable() {
    const searchInput = document.getElementById('poSearchInput');
    const supplierFilter = document.getElementById('poSupplierFilter');
    const dateFilter = document.getElementById('poDateFilter');
    const tableBody = document.getElementById('poTableBody');
    if (!tableBody) return;

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const supplierValue = supplierFilter ? supplierFilter.value.trim() : '';
    const dateValue = dateFilter ? dateFilter.value.trim() : '';

    // Loop through all table rows
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    rows.forEach(row => {
        // Get cell values
        const poNo = row.children[0]?.textContent.trim().toLowerCase() || '';
        const supplier = row.children[1]?.textContent.trim() || '';
        const date = row.children[2]?.textContent.trim() || '';
        const amount = row.children[3]?.textContent.trim() || '';

        // Search logic: match any cell
        let matchesSearch = !searchValue ||
            poNo.includes(searchValue) ||
            supplier.toLowerCase().includes(searchValue) ||
            date.toLowerCase().includes(searchValue) ||
            amount.toLowerCase().includes(searchValue);

        // Supplier filter logic
        let matchesSupplier = (supplierValue === '') || (supplier.toLowerCase().trim() === supplierValue.toLowerCase());

        // Date filter logic
        let matchesDate = true;
        if (dateValue === '') {
            matchesDate = true; // All Dates selected
        } else if (!isNaN(dateValue)) {
            // If filter is a number (e.g. 30, 90, 180, 365), filter by last X days
            const now = new Date();
            const rowDate = new Date(date);
            const daysAgo = parseInt(dateValue, 10);
            const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
            matchesDate = rowDate >= cutoff;
        } else {
            // Otherwise, match exact date string
            matchesDate = date === dateValue;
        }

        if (matchesSearch && matchesSupplier && matchesDate) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Update page info
    const pageInfo = document.getElementById('poPageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Showing ${visibleCount} of ${rows.length} purchase orders`;
    }
}

// Attach event listeners
['poSearchInput', 'poSupplierFilter', 'poDateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(id === 'poSearchInput' ? 'input' : 'change', filterPOTable);
    }
});

// Call on page load
window.addEventListener('DOMContentLoaded', function() {
    filterPOTable();
});
</script> 

<script>
function populateSupplierFilter() {
    const supplierFilter = document.getElementById('poSupplierFilter');
    const tableBody = document.getElementById('poTableBody');
    if (!supplierFilter) return;

    // Save the current options (including PHP-generated ones)
    const existingOptions = {};
    for (let i = 0; i < supplierFilter.options.length; i++) {
        const option = supplierFilter.options[i];
        existingOptions[option.value] = option.textContent;
    }

    // Get all unique suppliers from the table
    const suppliers = new Set();
    
    // Add suppliers from table rows
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const supplier = row.children[1]?.textContent.trim();
            if (supplier) suppliers.add(supplier);
        });
    }
    
    // Add suppliers from localStorage
    const savedSuppliers = JSON.parse(localStorage.getItem('poSuppliers')) || [];
    savedSuppliers.forEach(supplier => {
        if (supplier) suppliers.add(supplier);
    });

    // Save the current selected value
    const currentValue = supplierFilter.value;

    // Keep the first option ("All Suppliers")
    const allOption = supplierFilter.querySelector('option[value=""]');
    supplierFilter.innerHTML = '';
    if (allOption) {
        supplierFilter.appendChild(allOption);
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "All Suppliers";
        supplierFilter.appendChild(option);
    }

    // Add existing PHP-generated options first
    for (const [value, text] of Object.entries(existingOptions)) {
        if (value === "") continue; // Skip "All Suppliers" option
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        supplierFilter.appendChild(option);
    }

    // Add unique suppliers from the table and localStorage that aren't already in the dropdown
    suppliers.forEach(supplier => {
        if (!existingOptions[supplier]) {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            supplierFilter.appendChild(option);
        }
    });

    // Restore previous selection if possible
    supplierFilter.value = currentValue;
}

// Call on page load
window.addEventListener('DOMContentLoaded', function() {
    populateSupplierFilter(); // Call this function to populate supplier filter
    filterPOTable();
});
</script> 
