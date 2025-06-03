    <div class="container-fluid mt-4">
        <!-- Inventory Section -->
        <div class="inventory-section">
            <div class="d-flex justify-content-between align-items-center mb-4">
            </div>

            <div class="card shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="mb-0 text-primary"><i class="bi bi-box-seam"></i> Inventory Items</h5>
                    <div class="btn-group">
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addInventoryModal">
                            <i class="bi bi-plus-circle"></i> Add New Item
                        </button>
                        <button class="btn btn-success btn-sm" id="exportBtn">
                            <i class="bi bi-file-earmark-excel"></i> Export
                        </button>
                        <button class="btn btn-info btn-sm text-white" id="printBtn">
                            <i class="bi bi-printer"></i> Print
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="print-section">
                        <div class="print-header d-none">
                            <h2>ICTD Inventory Management System</h2>
                            <p>Inventory Report</p>
                            <p>Date: <span id="printDate"></span></p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="search-box d-flex align-items-center gap-3">
                                <div class="position-relative">
                                    <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2"></i>
                                    <input type="text" id="inventorySearchInput" class="form-control ps-4" placeholder="Search inventory..." style="width: 250px;">
                                </div>
                                <div class="filter-group d-flex gap-2">
                                    <select class="form-select" id="conditionFilter" style="width: 150px;">
                                        <option value="">All Conditions</option>
                                        <option value="New">New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                    <select class="form-select" id="locationFilter" style="width: 150px;">
                                        <option value="">All Locations</option>
                                        <option value="Office">Office</option>
                                        <option value="Storage">Storage</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Serial Number Scanner Button - Moved to its own row -->
                        <div class="scan-button-container mb-3 d-flex justify-content-between align-items-center">
                            <!-- Placeholder for scanner button if missing -->
                            <!-- Scan result notification area -->
                            <div id="scanResultNotification" class="scan-result d-none">
                                <span class="scan-result-status"></span>
                                <span class="scan-result-text"></span>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-striped table-bordered table-hover align-middle shadow-sm">
                                <thead class="table-light">
                                    <tr>
                                        <th class="text-center" style="width: 100px;">Actions</th>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Brand/Model</th>
                                        <th>Serial Number</th>
                                        <th>Purchase Date</th>
                                        <th>Warranty</th>
                                        <th>Assigned To</th>
                                        <th>Location</th>
                                        <th>Condition</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody id="inventoryTableBody">
                                    <!-- Data will be loaded dynamically -->
                                </tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <span id="inventoryPageInfo">Showing 0-0 of 0 items</span>
                            </div>
                            <div class="pagination-controls">
                                <button id="inventoryPrevBtn" class="btn btn-sm btn-outline-primary" disabled>
                                    <i class="bi bi-chevron-left"></i> Previous
                                </button>
                                <button id="inventoryNextBtn" class="btn btn-sm btn-outline-primary ms-2" disabled>
                                    Next <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Inventory Item Modal -->
        <div class="modal fade" id="addInventoryModal" tabindex="-1" aria-labelledby="addInventoryModalLabel" aria-hidden="true" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-gradient-primary text-white">
                        <h5 class="modal-title" id="addInventoryModalLabel">Add New Inventory Item</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body py-3">
                        <form id="addInventoryForm">
                            <input type="hidden" id="inventoryTrackPrediction" name="track_for_prediction" value="true">
                            <input type="hidden" id="inventoryTrackingData" name="tracking_data">
                            <div class="row g-3">
                                <!-- Left Column -->
                                <div class="col-md-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0 text-primary">Basic Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-2">
                                                <div class="col-md-6">
                                                    <label for="itemID" class="form-label">Item ID</label>
                                                    <input type="text" class="form-control" id="itemID" name="itemID" placeholder="Enter item ID">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="itemName" class="form-label">Item Name</label>
                                                    <input type="text" class="form-control" id="itemName" name="item_name" placeholder="Enter item name" required>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="brandModel" class="form-label">Brand/Model</label>
                                                    <input type="text" class="form-control" id="brandModel" name="brand_model" placeholder="Enter Brand/Model">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="serialNumber" class="form-label">Serial Number</label>
                                                    <input type="text" class="form-control serial-number-field" id="serialNumber" name="serial_number" placeholder="Enter serial number">
                                                    <div class="form-text text-muted small">Serial numbers must be unique.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Column -->
                                <div class="col-md-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0 text-primary">Purchase & Warranty</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-2">
                                                <div class="col-md-6">
                                                    <label for="purchaseDate" class="form-label">Purchase Date</label>
                                                    <input type="date" class="form-control" id="purchaseDate" name="purchase_date">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="warrantyDate" class="form-label">Warranty Expiration</label>
                                                    <input type="date" class="form-control" id="warrantyDate" name="warranty_expiration">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Third Row -->
                                <div class="col-md-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0 text-primary">Assignment & Status</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-2">
                                                <div class="col-md-6">
                                                    <label for="assignedTo" class="form-label">Assigned To</label>
                                                    <input type="text" class="form-control" id="assignedTo" name="assigned_to" placeholder="Enter person name">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="location" class="form-label">Location</label>
                                                    <input type="text" class="form-control" id="location" name="location" placeholder="Enter location">
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="condition" class="form-label">Condition</label>
                                                    <select class="form-select" id="condition" name="condition">
                                                        <option selected disabled value="">Select condition</option>
                                                        <option value="New">New</option>
                                                        <option value="Good">Good</option>
                                                        <option value="Fair">Fair</option>
                                                        <option value="Poor">Poor</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-header bg-light py-2">
                                            <h6 class="mb-0 text-primary">Additional Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-0">
                                                <label for="notes" class="form-label">Notes</label>
                                                <textarea class="form-control" id="notes" name="notes" rows="3" placeholder="Enter additional notes"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form> 
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveItemBtn" onclick="saveInventoryItem()">Save Item</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

<script>
// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let inventoryItems = [];

// Function to update the pagination info and buttons
function updatePagination() {
    const totalItems = inventoryItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    // Update pagination info text
    document.getElementById('inventoryPageInfo').textContent = `Showing ${startItem}-${endItem} of ${totalItems} items`;
    
    // Update button states
    document.getElementById('inventoryPrevBtn').disabled = currentPage === 1;
    document.getElementById('inventoryNextBtn').disabled = currentPage >= totalPages;
}

// Function to display items for the current page
function displayInventoryItems() {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';
    
    // Calculate the slice of items to display
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = inventoryItems.slice(startIndex, endIndex);
    
    // Display the items or show a message if no items
    if (itemsToDisplay.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = '<td colspan="11" class="text-center py-3">No inventory items found</td>';
        tableBody.appendChild(noDataRow);
    } else {
        // Loop through items and create table rows
        itemsToDisplay.forEach(item => {
            // Create and append table rows with inventory data
            // This part would need to be customized based on your data structure
            // For example:
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editInventoryItem('${item.id}')">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteInventoryItem('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
                <td>${item.itemID}</td>
                <td>${item.itemName}</td>
                <td>${item.brandModel}</td>
                <td>${item.serialNumber}</td>
                <td>${item.purchaseDate}</td>
                <td>${item.warrantyDate}</td>
                <td>${item.assignedTo}</td>
                <td>${item.location}</td>
                <td>${item.condition}</td>
                <td>${item.notes}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update pagination display
    updatePagination();
}

// Event listeners for pagination buttons
document.getElementById('inventoryPrevBtn').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        displayInventoryItems();
    }
});

document.getElementById('inventoryNextBtn').addEventListener('click', function() {
    const totalPages = Math.ceil(inventoryItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayInventoryItems();
    }
});

// When the page loads, fetch inventory items and display them
// This function would need to be modified to fetch actual data from your backend
function loadInventoryItems() {
    // For demonstration, we'll create dummy data
    // In a real application, you would fetch this data from your server
    // For example: fetch('api/inventory-items').then(response => response.json()).then(data => {...})
    
    // Initialize pagination
    currentPage = 1;
    displayInventoryItems();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadInventoryItems();
});
</script>
