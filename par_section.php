<!-- PAR Section -->
<div class="par-section d-none">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-receipt"></i> Property Acknowledgement Receipts</h5>
            <button class="btn btn-primary" id="newParBtn" data-bs-toggle="modal" data-bs-target="#addPARModal">
                <i class="bi bi-plus-circle"></i> Create New PAR
            </button>
        </div>
        <div class="card-body"> 
            <!-- Combined search and filter controls in one row -->
            <div class="row mb-3">
                <div class="col-md-8">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <div class="input-group" style="width: 220px;">
                            <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span>
                            <input type="text" id="parSearchInput" class="form-control border-start-0" placeholder="Search PAR...">
                        </div>
                        <select id="parNoFilter" class="form-select" style="width: 170px;">
                            <option value="">All PAR No.</option>
                            <!-- Options will be populated by JS -->
                        </select>
                        <select id="parDateFilter" class="form-select" style="width: 170px;">
                            <option value="">All Dates</option>
                            <!-- Options will be populated by JS -->
                        </select>
                    </div>
                </div>
            </div>
            <!-- Table -->
            <div class="table-responsive">
                <table id="parTable" class="table par-table table-striped table-bordered table-hover align-middle shadow-sm mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>PAR No.</th>
                            <th>Date Acquired</th>
                            <th>Property Number</th>    
                            <th>Received By</th>
                            <th>Amount</th>
                            <th class="text-center" style="width: 140px;">Actions</th>
                        </tr>   
                    </thead>
                    <tbody id="parTableBody">
                        <!-- PARs will be dynamically added here -->
                        <tr class="par-empty-row">
                            <td colspan="6" class="text-center text-muted">No PAR records found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Pagination info and controls below the table -->
            <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                    <span id="parPageInfo">Showing 0-0 of 0 items</span>
                </div>
                <div class="pagination-controls">
                    <button id="parPrevBtn" class="btn btn-sm btn-outline-primary" disabled>
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <button id="parNextBtn" class="btn btn-sm btn-outline-primary ms-2">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add Property Acknowledgement Receipt Modal -->
<div class="modal fade" id="addPARModal" tabindex="-1" aria-labelledby="addPARModalLabel">
    <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-gradient-primary text-white">
                <h5 class="modal-title" id="addPARModalLabel">Add Property Acknowledgement Receipt</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-3">
                <form id="parForm">
                    <!-- Hidden fields for ML tracking -->
                    <input type="hidden" id="parTrackPrediction" name="track_for_prediction" value="true">
                    <input type="hidden" id="parTrackingData" name="tracking_data">
                    <input type="hidden" id="par_id" name="par_id" value="">
                    <input type="hidden" id="default_user_id" name="default_user_id">
                    <input type="hidden" id="received_by_id" name="received_by_id" value="1">

                    <!-- Rest of the form content -->
                    <div class="row g-3">
                        <!-- Left column -->
                        <div class="col-md-6">
                            <!-- PAR Basic Information Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">PAR Information</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="par_no" class="form-label">PAR No.</label>
                                            <input type="text" class="form-control" id="par_no" name="par_no">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="entity_name" class="form-label">Entity Name</label>
                                            <input type="text" class="form-control" id="entity_name" name="entity_name">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="date_acquired" class="form-label">Date Acquired</label>
                                            <input type="date" class="form-control" id="date_acquired" name="date_acquired">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Remarks Section -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Additional Information</h6>
                                </div>
                                <div class="card-body">
                                    <div>
                                        <label for="par_remarks" class="form-label">Remarks</label>
                                        <textarea class="form-control" id="par_remarks" name="remarks" rows="3" placeholder="Enter remarks (optional)"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right column -->
                        <div class="col-md-6">
                            <!-- Recipient Information Section -->
                            <div class="card border-0 shadow-sm mb-3">  
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Recipient Information</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <label for="received_by" class="form-label">Received By*</label>
                                            <input type="text" class="form-control" id="received_by" name="received_by" placeholder="Enter received by" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="par_position" class="form-label">Position</label>
                                            <input type="text" class="form-control" id="par_position" name="position" placeholder="Enter position">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="par_department" class="form-label">Department</label>
                                            <input type="text" class="form-control" id="par_department" name="department" placeholder="Enter department">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="expiry_date" class="form-label">Expiry Date</label>
                                            <input type="date" class="form-control" id="expiry_date" name="expiry_date">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Item Details Section - Full width -->
                        <div class="col-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-light py-2">
                                    <h6 class="mb-0 text-primary">Item Details</h6>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered table-hover align-middle shadow-sm compact-table mb-0" id="parItemsTable" style="border-spacing: 0; border-collapse: collapse;">
                                            <thead class="table-light">
                                                <tr>
                                                    <th style="padding: 3px;">QTY</th>
                                                    <th style="padding: 3px;">Unit</th>
                                                    <th style="padding: 3px;">Description</th>
                                                    <th style="padding: 3px;">Property Number</th>
                                                    <th style="padding: 3px;">Date Acquired</th>
                                                    <th style="padding: 3px;">Amount</th>
                                                    <th style="padding: 3px;">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Table rows will be dynamically added by JavaScript -->
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="7">
                                                        <button type="button" class="btn btn-sm btn-success" id="addParRowBtn">
                                                            <i class="bi bi-plus-circle"></i> Add Item
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="5" class="text-end fw-bold">Total Amount:</td>
                                                    <td class="fw-bold">
                                                        <span id="parTotal">0.00</span>
                                                        <input type="hidden" id="parTotalAmount" name="total_amount" value="0.00">
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>    
                                        </table>
                                    </div>
                                    <!-- REMOVE: Pagination info and controls from modal -->
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
                <button type="button" class="btn btn-primary" id="saveParBtn">
                    Save PAR
                </button>
            </div>
        </div>
    </div>
</div>

