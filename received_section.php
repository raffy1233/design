<!-- Received Items Section -->
<div class="received-section d-none">
    <div class="card shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-primary"><i class="bi bi-box-seam-fill"></i> Received Items</h5>
            <div class="btn-group">
                <button class="btn btn-primary btn-sm" id="receiveNewItemsBtn">
                    <i class="bi bi-plus-circle"></i> Receive New Items
                </button>
                <button class="btn btn-success btn-sm" id="exportReceivedBtn">
                    <i class="bi bi-file-earmark-excel"></i> Export
                </button>
                <button class="btn btn-info btn-sm text-white" id="printReceivedListBtn">
                    <i class="bi bi-printer"></i> Print
                </button>
            </div>
        </div>
        <div class="card-body"> 
            <div class="print-section">
                <div class="print-header d-none">
                    <h2>ICTD Inventory Management System</h2>
                    <p>Received Items Report</p>
                    <p>Date: <span id="printReceivedDate"></span></p>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="search-box d-flex align-items-center gap-3">
                        <div class="position-relative">
                            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2"></i>
                            <input type="text" id="receivedSearchInput" class="form-control ps-4" placeholder="Search received items..." style="width: 250px;">
                        </div>
                        <div class="filter-group d-flex gap-2">
                            <select class="form-select" id="receivedDateFilter" style="width: 150px;">
                                <option value="">All Dates</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                            <select class="form-select" id="receivedPOFilter" style="width: 150px;">
                                <option value="">All POs</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                    </div>
                
                </div>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered table-hover align-middle shadow-sm" id="receivedTable">
                        <thead class="table-light">
                            <tr>
                                <th>PO NO.</th>
                                <th>Quantity</th>
                                <th>Supplier</th>
                                <th>Received Date</th>
                                <th>Status</th>
                                <th class="actions-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="receivedTableBody">
                            <!-- Data will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>
                <!-- Add pagination controls for received items -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <span id="receivedPageInfo">Showing 1-7 of 0 received items</span>
                    </div>
                    <div class="pagination-controls">
                        <button id="receivedPrevBtn" class="btn btn-sm btn-outline-primary" disabled>
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <button id="receivedNextBtn" class="btn btn-sm btn-outline-primary ms-2">
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Receive Items Modal -->
<div class="modal fade" id="receiveItemsModal" tabindex="-1" aria-labelledby="receiveItemsModalLabel">
    <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-gradient-primary text-white">
                <h5 class="modal-title" id="receiveItemsModalLabel"><i class="bi bi-box-seam-fill"></i> Receive Items</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-3">
                <div id="receiveItemsLoading" class="text-center p-4 d-none">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading purchase order items...</p>
                </div>
                
                <div id="receiveItemsContent">
                    <form id="receiveItemsForm">
                        <input type="hidden" id="receive_po_id" name="po_id" value="">
                        
                        <!-- PO Details Summary -->
                        <div class="card border-0 shadow-sm mb-3">
                            <div class="card-header bg-light py-2">
                                <h6 class="mb-0 text-primary">Purchase Order Details</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="mb-0">
                                            <label class="form-label small text-muted">PO Number</label>
                                            <div id="receive_po_no" class="fw-medium"></div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-0">
                                            <label class="form-label small text-muted">Supplier</label>
                                            <div id="receive_supplier" class="fw-medium"></div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-0">
                                            <label class="form-label small text-muted">PO Date</label>
                                            <div id="receive_po_date" class="fw-medium"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Delivery Information -->
                        <div class="card border-0 shadow-sm mb-3">
                            <div class="card-header bg-light py-2">
                                <h6 class="mb-0 text-primary">Delivery Information</h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label for="date_received" class="form-label">Date Received</label>
                                        <input type="date" class="form-control" id="date_received" name="date_received" value="<?php echo date('Y-m-d'); ?>" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="received_by" class="form-label">Received By</label>
                                        <input type="text" class="form-control" id="receive_received_by" name="received_by" 
                                       value="<?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'Admin'; ?>" 
                                       placeholder="Who received this delivery" required>
                                        <input type="hidden" id="username_data" value="<?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'Admin'; ?>" data-username="<?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'Admin'; ?>">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="remarks" class="form-label">Position/Title</label>
                                        <input type="text" class="form-control" id="receive_position" name="remarks" 
                                       placeholder="Position or title of the person who received the items">
                                    </div>
                                    <div class="col-md-12">
                                        <label for="delivery_notes" class="form-label">Delivery Notes</label>
                                        <textarea class="form-control" id="delivery_notes" name="delivery_notes" rows="2" placeholder="Enter any notes about this delivery"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Items Table -->
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 text-primary">Items to Receive</h6>
                                <div>
                                    <span class="badge bg-primary" id="itemsCountBadge">0</span> items
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-striped table-bordered mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 50px;" class="text-center">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="selectAllItems" checked>
                                                    </div>
                                                </th>
                                                <th>Description</th>
                                                <th style="width: 100px;">Order Qty</th>
                                                <th style="width: 120px;">Received Qty</th>
                                                <th style="width: 120px;">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="receiveItemsTableBody">
                                            <!-- Items will be populated dynamically -->
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="2" class="text-end fw-bold"></td>
                                                <td id="totalOrderedQty" class="fw-bold"></td>
                                                <td id="totalReceivedQty" class="fw-bold"></td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </form> 
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Cancel
                </button>
                <button type="button" class="btn btn-success" id="confirmReceiveItemsBtn" onclick="confirmReceiveItems()">
                    <i class="bi bi-check2-circle"></i> Confirm Receipt
                </button>
            </div>
        </div>
    </div>
</div> 