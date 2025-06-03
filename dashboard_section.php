<!-- Dashboard Section -->
<div class="dashboard-section d-none">
    <div class="dashboard-header mb-4 d-flex justify-content-between align-items-center">
        <h4><i class="bi bi-speedometer2"></i> Dashboard Overview</h4>
        <div class="d-flex align-items-center gap-2">
            <!-- Enhanced User Profile Display -->
            <div class="user-profile-display d-flex align-items-center">
                <div class="user-avatar me-3 position-relative">
                    <?php if(isset($_SESSION['user_image']) && !empty($_SESSION['user_image'])): ?>
                        <img src="<?php echo htmlspecialchars($_SESSION['user_image']); ?>" alt="Profile" class="rounded-circle border border-2 border-primary shadow-sm" width="48" height="48">
                    <?php else: ?>
                        <div class="default-avatar rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white shadow-sm" style="width: 48px; height: 48px;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                    <?php endif; ?>
                    <button class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1 upload-photo-btn" style="width: 20px; height: 20px; font-size: 10px;" title="Change profile photo">
                        <i class="bi bi-camera-fill"></i>
                    </button>
                </div>
                <div class="user-info"> 
                    <div class="user-name fw-semibold"><?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'User'; ?></div>
                    <div class="user-role small text-muted"><?php echo isset($_SESSION['role']) ? htmlspecialchars($_SESSION['role']) : ''; ?></div>
                </div>
                <div class="ms-2 dropdown">
                    <button class="btn btn-sm btn-light rounded-circle" type="button" id="userMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="userMenuDropdown">
                        <li><a class="dropdown-item" href="#" id="viewProfileBtn"><i class="bi bi-person me-2"></i>View Profile</a></li>
                        <li><a class="dropdown-item" href="#" id="editProfileBtn"><i class="bi bi-pencil-square me-2"></i>Edit Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Profile Photo Upload Modal -->
    <div class="modal fade" id="uploadPhotoModal" tabindex="-1" aria-labelledby="uploadPhotoModalLabel">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="uploadPhotoModalLabel"><i class="bi bi-camera-fill me-2"></i>Update Profile Photo</h5>
                </div>
                <div class="modal-body">
                    <form id="profilePhotoForm" enctype="multipart/form-data">
                        <div class="text-center mb-4">
                            <div class="profile-preview-container mx-auto position-relative" style="width: 150px; height: 150px;">
                                <img id="profilePreview" src="<?php echo isset($_SESSION['user_image']) && !empty($_SESSION['user_image']) ? htmlspecialchars($_SESSION['user_image']) : 'assets/images/default-avatar.png'; ?>" class="img-fluid rounded-circle border" style="width: 150px; height: 150px; object-fit: cover;">
                                <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle opacity-0 hover-visible">
                                    <i class="bi bi-camera-fill text-white fs-1"></i>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="profilePhotoInput" class="form-label">Select new photo</label>
                            <input class="form-control" type="file" id="profilePhotoInput" name="profile_photo" accept="image/*">
                            <div class="form-text">Recommended size: 300x300 pixels (square image)</div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancelProfilePhoto">Cancel</button>
                    <button type="button" class="btn btn-primary" id="saveProfilePhoto">
                        <i class="bi bi-save me-1"></i> Save Photo
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Warranty Bills container hidden by default -->
    <div id="warrantyBills" class="d-none">
        <div class="warranty-bills-container">
            <h6 class="mb-3 text-primary"><i class="bi bi-receipt-cutoff me-2"></i>Bills & Warranty Notifications</h6>
            <div class="warranty-bills-list">
                <!-- This will be dynamically populated -->
                <div class="text-muted small py-2">No pending bills or warranty notifications</div>
            </div>
        </div>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
        <!-- Total Items -->
        <div class="dashboard-stats total-items">
            <div class="stats-icon">
                <i class="bi bi-box-seam"></i>
            </div>
            <div class="stats-number"><?php echo isset($metrics['total_items']) ? htmlspecialchars($metrics['total_items']) : '0'; ?></div>
            <div class="stats-label">Total Items</div>
        </div>
        <!-- Inventory -->
        <div class="dashboard-stats inventory">
            <div class="stats-icon">
                <i class="bi bi-calendar-check"></i>
            </div>
            <div class="stats-number"><?php echo isset($metrics['inventory_count']) ? htmlspecialchars($metrics['inventory_count']) : '0'; ?></div>
            <div class="stats-label">Inventory</div>
        </div>
        <!-- PO -->
        <div class="dashboard-stats po">
            <div class="stats-icon">
                <i class="bi bi-cart3"></i>
            </div>
            <div class="stats-number"><?php echo isset($metrics['po_count']) ? htmlspecialchars($metrics['po_count']) : '0'; ?></div>
            <div class="stats-label">PO</div>
        </div>
        <!-- PAR -->
        <div class="dashboard-stats par">
            <div class="stats-icon">
                <i class="bi bi-receipt"></i>
            </div>
            <div class="stats-number"><?php echo isset($metrics['par_count']) ? htmlspecialchars($metrics['par_count']) : '0'; ?></div>
            <div class="stats-label">PAR</div>
        </div>
        <!-- Received -->
        <div class="dashboard-stats received">
            <div class="stats-icon">
                <i class="bi bi-box-seam-fill"></i>
            </div>
            <div class="stats-number"><?php echo isset($metrics['received_count']) ? htmlspecialchars($metrics['received_count']) : '0'; ?></div>
            <div class="stats-label">Received</div>
        </div>
    </div>
    
    <!-- Dashboard Charts and ML Predictions -->
    <div class="row g-3 mt-2">
        <!-- Performance Analytics Section - Full Width -->
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 text-primary fw-semibold"><i class="bi bi-bar-chart-line me-2"></i>Performance Analytics</h6>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" id="weeklyChartBtn">Weekly</button>
                        <button class="btn btn-sm btn-outline-primary active" id="monthlyChartBtn">Monthly</button>
                        <button class="btn btn-sm btn-outline-primary" id="quarterlyChartBtn">Quarterly</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <!-- Analytics charts section -->
                    <div class="row">
                        <!-- Inventory Analytics -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow mb-4">
                                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                                    <h6 class="m-0 font-weight-bold text-primary">Inventory Analytics</h6>
                                    <button class="btn btn-sm btn-outline-primary refresh-chart" data-chart="inventory-analytics">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="chart-responsive">
                                        <canvas id="inventoryAnalyticsChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Purchase Order Analytics -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow mb-4">
                                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                                    <h6 class="m-0 font-weight-bold text-primary">Purchase Order Analytics</h6>
                                    <button class="btn btn-sm btn-outline-primary refresh-chart" data-chart="purchase-order-analytics">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="chart-responsive">
                                        <canvas id="poAnalyticsChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PAR Analytics -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow mb-4">
                                <div class="card-header py-3 d-flex justify-c   ontent-between align-items-center">
                                    <h6 class="m-0 font-weight-bold text-primary">PAR Analytics</h6>
                                    <button class="btn btn-sm btn-outline-primary refresh-chart" data-chart="par-analytics">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="chart-responsive">
                                        <canvas id="parAnalyticsChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>  
                        
                        <!-- Received Items Analytics -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow mb-4">
                                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                                    <h6 class="m-0 font-weight-bold text-primary">Received Items Analytics</h6>
                                    <button class="btn btn-sm btn-outline-primary refresh-chart" data-chart="received-items-analytics">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="chart-responsive">
                                        <canvas id="receivedItemsAnalyticsChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ML Prediction Dashboard Row -->
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 text-primary fw-semibold"><i class="bi bi-robot me-2"></i>ML Prediction Dashboard</h6>
                    <button id="refreshPredictions" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                </div>
                <div class="card-body p-0">
                    <div class="row g-0">
                        <!-- Left side: Maintenance Predictions -->
                        <div class="col-md-6 border-end">
                            <div class="p-3">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-semibold mb-0 text-primary"><i class="bi bi-tools me-2"></i>Maintenance Predictions</h6>
                                    <a href="#" class="btn btn-sm btn-link text-decoration-none" id="viewAllMaintenance">
                                        View All <i class="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                                <div id="maintenancePredictions" class="maintenance-predictions">
                                    <div class="text-center text-muted py-3" id="maintenanceLoading">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2">Loading predictions...</p>
                                    </div>
                                    <div id="maintenanceItems">
                                        <div class="list-group list-group-flush maintenance-list">
                                            <!-- Will be populated by JavaScript -->
                                        </div>
                                    </div>
                                    <div id="noMaintenanceItems" class="d-none">
                                        <div class="text-center py-3">
                                            <i class="bi bi-check-circle-fill text-success mb-2" style="font-size: 1.5rem;"></i>
                                            <p>No maintenance required at this time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right side: Inventory Suggestions -->
                        <div class="col-md-6">
                            <div class="p-3">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-semibold mb-0 text-primary"><i class="bi bi-box-seam me-2"></i>Parts & Budget Forecasting</h6>
                                    <a href="#" class="btn btn-sm btn-link text-decoration-none" id="viewAllForecasts">
                                        View All <i class="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                                <div id="inventorySuggestions" class="inventory-suggestions">
                                    <div class="text-center text-muted py-3" id="suggestionsLoading">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2">Loading suggestions...</p>
                                    </div>
                                    <div id="inventoryItems">
                                        <!-- Will be populated by JavaScript -->
                                    </div>
                                    <div id="noInventoryItems" class="d-none">
                                        <div class="text-center py-3">
                                            <i class="bi bi-search text-primary mb-2" style="font-size: 1.5rem;"></i>
                                            <p>No inventory suggestions available</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ML Predictions View All Modal -->
<div class="modal fade" id="viewAllPredictionsModal" tabindex="-1" aria-labelledby="viewAllPredictionsModalLabel">
    <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-gradient-primary text-white">
                <h5 class="modal-title" id="viewAllPredictionsModalLabel"><i class="bi bi-robot"></i> <span id="predictionModalTitle">ML Predictions</span></h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-3">
                <div id="allPredictionsLoading" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading all predictions...</p>
                </div>
                <div id="allPredictionsContent" class="d-none">
                    <div class="table-responsive">
                        <table class="table table-hover table-striped" id="predictionsTable">
                            <thead class="table-light">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Serial Number</th>
                                    <th id="predictionCol1">Status</th> 
                                    <th id="predictionCol2">Details</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="allPredictionsTableBody">
                                <!-- Will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="noPredictionsFound" class="text-center py-4 d-none">
                    <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-3">No prediction items found</p>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-primary" id="exportPredictionsBtn">
                    <i class="bi bi-file-earmark-excel"></i> Export
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>  
        </div>
    </div>
</div> 

<!-- Success Modal -->
<div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel">
    <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="successModalLabel">Success</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center p-5">
                <div class="success-icon-container mb-4">
                    <div class="success-icon rounded-circle d-inline-flex align-items-center justify-content-center bg-light" style="width: 100px; height: 100px;">
                        <i class="bi bi-check-lg text-success" style="font-size: 3rem;"></i>
                    </div>
                </div>
                <h3 class="mb-3">Success!</h3>
                <p class="mb-4 text-muted">Profile photo updated successfully</p>
                <div class="d-grid gap-2 col-6 mx-auto">
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Dashboard User Profile JavaScript -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Function to update user profile display
    function updateUserProfileDisplay() {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        if (userRole && userRole.textContent.trim() !== '') {
            const role = userRole.textContent.trim().toLowerCase();
            let badgeClass = 'text-secondary';
            switch(role) {
                case 'admin': badgeClass = 'text-primary fw-bold'; break;
                case 'manager': badgeClass = 'text-info fw-bold'; break;
                case 'staff': badgeClass = 'text-secondary fw-bold'; break;
                case 'viewer': badgeClass = 'text-muted'; break;
            }
            userRole.className = `user-role small ${badgeClass}`;
        }
    }
    updateUserProfileDisplay();

    // Profile photo upload functionality
    const uploadPhotoBtn = document.querySelector('.upload-photo-btn');
    const uploadPhotoModal = document.getElementById('uploadPhotoModal');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePreview = document.getElementById('profilePreview');
    const saveProfilePhotoBtn = document.getElementById('saveProfilePhoto');
    const cancelProfilePhotoBtn = document.getElementById('cancelProfilePhoto');
    const originalImagePath = profilePreview ? profilePreview.src : '<?php echo isset($_SESSION['user_image']) && !empty($_SESSION['user_image']) ? htmlspecialchars($_SESSION['user_image']) : 'assets/images/default-avatar.png'; ?>';

    let photoModal;
    if (uploadPhotoModal) {
        photoModal = new bootstrap.Modal(uploadPhotoModal);
    }

    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (photoModal) photoModal.show();
        });
    }

    if (cancelProfilePhotoBtn) {
        cancelProfilePhotoBtn.addEventListener('click', function() {
            if (profilePhotoInput) profilePhotoInput.value = '';
            if (profilePreview) profilePreview.src = originalImagePath;
            if (photoModal) photoModal.hide();
        });
    }

    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    const previewContainer = document.querySelector('.profile-preview-container');
    if (previewContainer) {
        const hoverOverlay = previewContainer.querySelector('.hover-visible');
        previewContainer.addEventListener('mouseover', function() {
            if (hoverOverlay) {
                hoverOverlay.classList.remove('opacity-0');
                hoverOverlay.classList.add('opacity-100');
            }
        });
        previewContainer.addEventListener('mouseout', function() {
            if (hoverOverlay) {
                hoverOverlay.classList.remove('opacity-100');
                hoverOverlay.classList.add('opacity-0');
            }
        });
        previewContainer.addEventListener('click', function() {
            profilePhotoInput.click();
        });
    }

    // Save profile photo
    if (saveProfilePhotoBtn) {
        saveProfilePhotoBtn.addEventListener('click', function() {
            if (!profilePhotoInput.files.length) {
                showToast('Please select an image first', 'warning');
                return;
            }
            const formData = new FormData();
            formData.append('profile_photo', profilePhotoInput.files[0]);
            formData.append('action', 'update_profile_photo');

            saveProfilePhotoBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            saveProfilePhotoBtn.disabled = true;

            fetch('user_api.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Invalid response format. Expected JSON');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Update avatar in the UI  
                    const avatarImg = document.querySelector('.user-avatar img');
                    const defaultAvatar = document.querySelector('.default-avatar');
                    if (data.image_url) {
                        if (avatarImg) {
                            avatarImg.src = data.image_url + '?t=' + new Date().getTime();
                        } else if (defaultAvatar) {
                            const img = document.createElement('img');
                            img.src = data.image_url + '?t=' + new Date().getTime();
                            img.alt = 'Profile';
                            img.className = 'rounded-circle border border-2 border-primary shadow-sm';
                            img.width = 48;
                            img.height = 48;
                            defaultAvatar.parentNode.replaceChild(img, defaultAvatar);
                        }
                        sessionStorage.setItem('user_image', data.image_url);
                        if (profilePreview) profilePreview.src = data.image_url + '?t=' + new Date().getTime();
                    }
                    
                    // Close the photo modal
                    if (photoModal) photoModal.hide();
                    
                    // Show success modal instead of toast
                    showSuccessModal('Profile photo updated successfully');
                } else {
                    showToast(data.message || 'Failed to update profile photo', 'danger');
                }
            })
            .catch(error => {
                console.error('Error updating profile photo:', error);
                showToast(error.message || 'An error occurred while updating profile photo', 'danger');
            })
            .finally(() => {
                saveProfilePhotoBtn.innerHTML = '<i class="bi bi-save me-1"></i> Save Photo';
                saveProfilePhotoBtn.disabled = false;
            });
        });
    }

    // View Profile button
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement view profile logic here
        });
    }

    // Edit Profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement edit profile logic here
        });
    }

    // Helper function to show toast notifications
    function showToast(message, type = 'info') {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 5000
        });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', function() {
            toastEl.remove();
        });
    }
    
    // Function to show success modal with checkmark
    function showSuccessModal(message) {
        // Remove existing success modal if it exists
        const existingModal = document.getElementById('successModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="successModalLabel">Success</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center p-5">
                        <div class="success-icon-container mb-4">
                            <div class="success-icon rounded-circle d-inline-flex align-items-center justify-content-center bg-light" style="width: 100px; height: 100px;">
                                <i class="bi bi-check-lg text-success" style="font-size: 3rem;"></i>
                            </div>
                        </div>
                        <h3 class="mb-3">Success!</h3>
                        <p class="mb-4 text-muted">${message}</p>
                        <div class="d-grid gap-2 col-6 mx-auto">
                            <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Append modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Remove modal from DOM after it's hidden
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
});
</script>   