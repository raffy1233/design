<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="updateURL.js"></script>
<script src="admindashboard.js"></script>
<script src="admindashboardpar.js"></script>
<script src="amindinventory.js"></script>
<script src="inventory_ml_tracking.js"></script>
<script src="user_dashboard_client.js"></script>
<script src="user_management.js"></script>
<script src="user_navigation.js"></script>
<script src="reports.js"></script>
<script src="settings.js"></script>
<script src="received_items.js"></script>
<script src="analytics.js"></script>    
<script src="reportschart.js"></script>


<!-- Required JavaScript Libraries -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/datatables.net@1.13.1/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.1/js/dataTables.bootstrap5.min.js"></script>

<!-- Legacy script for non-module support -->
<script>
  // This ensures backward compatibility for browsers that don't support ES modules
  window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('js/admindashboard.js')) {
      console.warn('Error loading modular scripts, falling back to legacy script');
      const script = document.createElement('script');
      script.src = 'admindashboard.js';
      document.body.appendChild(script);
    }
  }, true);
</script>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        fetch('refresh_chart.php?type=inventory-machine')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const inventory = data.data.inventory;
                    const forecast = data.data.forecast;
                    
                    // Store the data globally for the view all functionality
                    window.mlPredictionData = {
                        inventory: inventory || [],
                        forecast: forecast || []
                    };
                    
                    // Inventory table - Maintenance Predictions
                    const maintenanceItems = document.querySelector('#maintenancePredictions .maintenance-list');
                    if (maintenanceItems) {
                        maintenanceItems.innerHTML = '';
                        
                        // Hide loading indicator
                        document.getElementById('maintenanceLoading').classList.add('d-none');
                        
                        if (inventory && inventory.length > 0) {
                            document.getElementById('maintenanceItems').classList.remove('d-none');
                            document.getElementById('noMaintenanceItems').classList.add('d-none');
                            
                            // Display only first 3 items in the dashboard
                            const displayItems = inventory;
                            displayItems.forEach(item => {
                                const row = document.createElement('div');
                                row.className = 'list-group-item';
                                row.innerHTML = `
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${item.item_name}</h6>
                                            <small class="text-muted">SN: ${item.serial_number}</small>
                                        </div>
                                        <span class="badge ${item.condition_status === 'POOR' ? 'bg-danger' : item.condition_status === 'FAIR' ? 'bg-warning' : 'bg-success'} rounded-pill">
                                            ${item.condition_status}
                                        </span>
                                    </div>
                                    <p class="mb-1 small">Warranty expires: ${item.expire_warranty}</p>
                                `;
                                maintenanceItems.appendChild(row);
                            });
                        } else {
                            document.getElementById('maintenanceItems').classList.add('d-none');
                            document.getElementById('noMaintenanceItems').classList.remove('d-none');
                        }
                    }

                    // Forecast table - Inventory Suggestions
                    const inventorySuggestions = document.querySelector('#inventorySuggestions');
                    if (inventorySuggestions) {
                        const inventoryItemsContainer = document.getElementById('inventoryItems');
                        inventoryItemsContainer.innerHTML = '';
                        
                        // Hide loading indicator
                        document.getElementById('suggestionsLoading').classList.add('d-none');
                        
                        if (forecast && forecast.length > 0) {
                            document.getElementById('noInventoryItems').classList.add('d-none');
                            
                            // Create list group for suggestions
                            const suggestionsList = document.createElement('div');
                            suggestionsList.className = 'list-group list-group-flush';
                            
                            // Display only first 3 items in the dashboard
                            const displayForecasts = forecast;
                            displayForecasts.forEach(fore => {
                                const item = document.createElement('div');
                                item.className = 'list-group-item';
                                item.innerHTML = `
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${fore.item_name}</h6>
                                            <small class="text-muted">SN: ${fore.serial_number}</small>
                                        </div>
                                        <span class="badge bg-primary rounded-pill">₱${fore.estimated_budget.toFixed(2)}</span>
                                    </div>
                                    <p class="mb-1 small">Action: ${fore.suggested_action}</p>
                                    <p class="mb-0 small text-muted">Target: ${fore.target_month}</p>
                                `;
                                suggestionsList.appendChild(item);
                            });
                            
                            inventoryItemsContainer.appendChild(suggestionsList);
                        } else {
                            document.getElementById('noInventoryItems').classList.remove('d-none');
                        }
                    }
                } else {
                    console.error('API error:', data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                // Show error messages in both sections
                document.getElementById('maintenanceLoading').classList.add('d-none');
                document.getElementById('suggestionsLoading').classList.add('d-none');
                
                const errorMessage = `<div class="alert alert-danger">Failed to load data: ${error.message}</div>`;
                document.getElementById('maintenancePredictions').innerHTML += errorMessage;
                document.getElementById('inventorySuggestions').innerHTML += errorMessage;
            });
            
        // View All Maintenance button click handler
        document.getElementById('viewAllMaintenance').addEventListener('click', function(e) {
            e.preventDefault();
            showAllPredictions('maintenance');
        });
        
        // View All Forecasts button click handler
        document.getElementById('viewAllForecasts').addEventListener('click', function(e) {
            e.preventDefault();
            showAllPredictions('forecast');
        });
        
        // Function to display all predictions in the modal
        function showAllPredictions(type) {
            const modal = new bootstrap.Modal(document.getElementById('viewAllPredictionsModal'));
            const title = document.getElementById('predictionModalTitle');
            const col1 = document.getElementById('predictionCol1');
            const col2 = document.getElementById('predictionCol2');
            const tableBody = document.getElementById('allPredictionsTableBody');
            
            // Clear previous content
            tableBody.innerHTML = '';
            
            // Show loading
            document.getElementById('allPredictionsLoading').classList.remove('d-none');
            document.getElementById('allPredictionsContent').classList.add('d-none');
            document.getElementById('noPredictionsFound').classList.add('d-none');
            
            // Set title and column headers based on prediction type
            if (type === 'maintenance') {
                title.textContent = 'Maintenance Predictions';
                col1.textContent = 'Condition';
                col2.textContent = 'Warranty Expires';
            } else {
                title.textContent = 'Budget & Parts Forecasting';
                col1.textContent = 'Action';
                col2.textContent = 'Est. Budget';
            }
            
            // Show modal
            modal.show();
            
            setTimeout(() => {
                // Hide loading indicator
                document.getElementById('allPredictionsLoading').classList.add('d-none');
                
                const data = window.mlPredictionData || {};
                const items = type === 'maintenance' ? (data.inventory || []) : (data.forecast || []);
                
                if (items.length > 0) {
                    // Show content
                    document.getElementById('allPredictionsContent').classList.remove('d-none');
                    
                    // Populate table
                    items.forEach(item => {
                        const row = document.createElement('tr');
                        
                        if (type === 'maintenance') {
                            // Maintenance prediction row
                            row.innerHTML = `
                                <td>${item.item_name}</td>
                                <td>${item.serial_number}</td>
                                <td>
                                    <span class="badge ${item.condition_status === 'POOR' ? 'bg-danger' : item.condition_status === 'FAIR' ? 'bg-warning' : 'bg-success'} rounded-pill">
                                        ${item.condition_status}
                                    </span>
                                </td>
                                <td>${item.expire_warranty}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="scheduleMaintenanceAction('${item.serial_number}')">
                                        <i class="bi bi-tools"></i> Schedule
                                    </button>
                                </td>
                            `;
                        } else {
                            // Forecast prediction row
                            row.innerHTML = `
                                <td>${item.item_name}</td>
                                <td>${item.serial_number}</td>
                                <td>${item.suggested_action}</td>
                                <td>₱${item.estimated_budget.toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-success" onclick="createBudgetRequest('${item.serial_number}')">
                                        <i class="bi bi-cash"></i> Budget
                                    </button>
                                </td>
                            `;
                        }
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    // Show no items message
                    document.getElementById('noPredictionsFound').classList.remove('d-none');
                }
            }, 500);
        }
        
        // Export predictions button
        document.getElementById('exportPredictionsBtn').addEventListener('click', function() {
            const title = document.getElementById('predictionModalTitle').textContent;
            const type = title.includes('Maintenance') ? 'maintenance' : 'forecast';
            
            exportPredictionsToExcel(type);
        });
        
        // Function to export predictions to Excel
        function exportPredictionsToExcel(type) {
            const data = window.mlPredictionData || {};
            const items = type === 'maintenance' ? (data.inventory || []) : (data.forecast || []);
            
            if (items.length === 0) {
                alert('No data to export!');
                return;
            }
            
            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            
            // Format data for export
            let exportData;
            if (type === 'maintenance') {
                exportData = items.map(item => ({
                    'Item Name': item.item_name,
                    'Serial Number': item.serial_number,
                    'Condition': item.condition_status,
                    'Warranty Expiration': item.expire_warranty
                }));
            } else {
                exportData = items.map(item => ({
                    'Item Name': item.item_name,
                    'Serial Number': item.serial_number,
                    'Suggested Action': item.suggested_action,
                    'Estimated Budget': `₱${item.estimated_budget.toFixed(2)}`,
                    'Target Month': item.target_month
                }));
            }
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, type === 'maintenance' ? 'Maintenance Predictions' : 'Budget Forecasts');
                
            // Generate filename
            const fileName = `${type === 'maintenance' ? 'Maintenance_Predictions' : 'Budget_Forecasts'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // Save to file
            XLSX.writeFile(wb, fileName);
        }
    });
    
    // Placeholder function for scheduling maintenance
    function scheduleMaintenanceAction(serialNumber) {
        alert(`Scheduling maintenance for item with SN: ${serialNumber}`);
        // Implement actual functionality as needed
    }
    
    // Placeholder function for creating budget request
    function createBudgetRequest(serialNumber) {
        alert(`Creating budget request for item with SN: ${serialNumber}`);
        // Implement actual functionality as needed
    }
</script> 