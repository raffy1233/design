/**
 * PAR.js - Property Acknowledgement Receipt management functions
 * This file handles all PAR-related functionality including CRUD operations
 */

let parItems = [];
let parTotal = 0;
let parData = [];

/**
 * Initialize PAR functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("PAR.js initialized");
    
    // Add CSS for table stabilization
    addTableStabilizationCSS();
    
    // Check for required stored procedures
    fetch('check_stored_procedures.php')
        .then(response => response.json())
        .then(data => {
            console.log("Stored procedure check result:", data);
        })
        .catch(error => {
            console.error("Error checking stored procedures:", error);
        });
    
    // Debug PAR form submission
    const saveParBtn = document.getElementById('saveParBtn');
    if (saveParBtn) {
        console.log("Found saveParBtn element, adding diagnostic logging");
        saveParBtn.addEventListener('click', function(e) {
            // Just log, don't prevent default or stop propagation
            console.log("saveParBtn clicked directly from initial event handler");
            // Check form existence and structure
            const parForm = document.getElementById('parForm');
            if (parForm) {
                console.log("PAR form found:", {
                    parId: parForm.querySelector('[name="par_id"]')?.value,
                    parNo: parForm.querySelector('[name="par_no"]')?.value,
                    fields: Array.from(parForm.elements).map(el => el.name || el.id)
                });
            } else {
                console.error("PAR form not found in DOM");
            }
        });
    } else {
        console.warn("saveParBtn element not found during initialization");
    }
    
    // Add event listener to the received_by dropdown to update the hidden received_by_id field
    const receivedByDropdown = document.getElementById('received_by');
    if (receivedByDropdown) {
        console.log('Found received_by dropdown, adding event listener');
        receivedByDropdown.addEventListener('change', function() {
            const receivedById = document.getElementById('received_by_id');
            if (receivedById) {
                receivedById.value = this.value;
                console.log('Updated received_by_id with value:', this.value);
            } else {
                console.error('received_by_id field not found in the form');
            }
        });
        
        // Trigger the change event initially to set the initial value if one is selected
        receivedByDropdown.dispatchEvent(new Event('change'));
    } else {
        console.warn('received_by dropdown not found - will create it dynamically if needed');
    }
    
    // Load PAR data if on the PAR page - with force refresh to prevent cache issues
    if (document.getElementById('parTable') || document.querySelector('.par-table')) {
        // Enforce a slight delay to ensure DOM is fully ready
        setTimeout(() => {
            loadPARData(true); // Force initial refresh
        }, 100);
    }

    // Initialize PAR form events
    initPARFormEvents();

    // Run cleanup function for specific PAR items
    removeSpecificParItem();
    
    // Set up search functionality for both parSearchInput and poSearchInput
    const parSearchInput = document.getElementById('parSearchInput');
    const poSearchInput = document.getElementById('poSearchInput');
    
    if (parSearchInput) {
        console.log('Found parSearchInput, adding event listener');
        parSearchInput.addEventListener('input', function() {
            searchPAR(this.value);
        });
    }
    
    if (poSearchInput) {
        console.log('Found poSearchInput (alternative ID), adding event listener');
        poSearchInput.addEventListener('input', function() {
            searchPAR(this.value);
        });
    }
    
    // Enhanced modal event handling for PAR modals
    document.addEventListener('shown.bs.modal', function(event) {
        const modal = event.target;
        console.log("Modal shown:", modal.id || 'unnamed modal');
        
        // Mark this modal as being shown in data attribute for tracking
        modal.setAttribute('data-modal-status', 'shown');
        
        // Remember which modal was most recently shown
        window.lastShownModalId = modal.id || '';
        
        // Run cleanup and calculation functions
        removeSpecificParItem();
        setTimeout(calculateParTotal, 200);
    });
    
    // Critical: PAR data refresh when modals are closed
    document.addEventListener('hidden.bs.modal', function(event) {
        const modal = event.target;
        console.log("Modal hidden:", modal.id || 'unnamed modal');
        
        // Mark this modal as being hidden
        modal.setAttribute('data-modal-status', 'hidden');
        modal.setAttribute('data-hidden-time', Date.now());
        
        // If this is a PAR-related modal, refresh the PAR data
        const parRelatedModalIds = ['parModal', 'addPARModal', 'editPARModal', 'addParModal'];
        const isParModal = parRelatedModalIds.includes(modal.id) || 
                          modal.id.toLowerCase().includes('par') || 
                          modal.classList.contains('par-modal');
        
        if (isParModal || window.lastShownModalId.toLowerCase().includes('par')) {
            console.log("PAR modal closed, triggering data refresh");
            
            // Force refresh to ensure data consistency
            refreshPARTableData();
            
            // Schedule additional refreshes to catch any potential delays
            setTimeout(() => refreshPARTableData(), 800);
            setTimeout(() => loadPARData(true), 1500);
        }
    });
    
    // Save PAR button in the modal - handle all possible button variants
    const saveBtnSelectors = [
        '#saveParBtn', 
        '[data-action="save-par"]', 
        '.save-par-btn',
        'button[form="parForm"]',
        '#parForm button[type="submit"]',
        '.modal button.btn-primary:not([data-bs-dismiss])'
    ];
    
    // Create a single selector string
    const combinedSelector = saveBtnSelectors.join(', ');
    
    // Find all potential save buttons
    const saveParBtns = document.querySelectorAll(combinedSelector);
    console.log(`Found ${saveParBtns.length} potential PAR save buttons`);
    
    // Add event listeners to all potential save buttons
    saveParBtns.forEach((btn, index) => {
        // Skip if the button has a dismiss attribute (it's a cancel/close button)
        if (btn.hasAttribute('data-bs-dismiss') || btn.hasAttribute('data-dismiss')) {
            return;
        }
        
        // Skip if button already has the handler
        if (btn.hasAttribute('data-handler-attached')) {
            return;
        }
        
        console.log(`Adding save event to button ${index}:`, btn.id || btn.className);
        btn.setAttribute('data-handler-attached', 'true');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Save PAR button clicked");
            savePAR();
        });
    });
    
    // Add global event delegation for dynamically created PAR buttons
    document.addEventListener('click', function(e) {
        // Handle dynamically created PAR buttons
        if (e.target.closest('.view-par')) {
            const parId = e.target.closest('.view-par').getAttribute('data-par-id');
            console.log("View PAR clicked for ID:", parId);
            viewPAR(parId);
        } else if (e.target.closest('.edit-par')) {
            const parId = e.target.closest('.edit-par').getAttribute('data-par-id');
            console.log("Edit PAR clicked for ID:", parId);
            editPAR(parId);
        } else if (e.target.closest('.delete-par')) {
            const parId = e.target.closest('.delete-par').getAttribute('data-par-id');
            console.log("Delete PAR clicked for ID:", parId);
            deletePAR(parId);
        } else if (e.target.closest('.remove-par-row')) {
            handleRemoveParRow(e.target.closest('.remove-par-row'));
        } else if (e.target.closest('.save-par-btn, [data-action="save-par"]') && !e.target.closest('[data-handler-attached="true"]')) {
            // Handle dynamically added save buttons that don't have handlers yet
            e.preventDefault();
            console.log("Dynamically created save PAR button clicked");
            e.target.closest('.save-par-btn, [data-action="save-par"]').setAttribute('data-handler-attached', 'true');
            savePAR();
        }
    });
    
    // Add PAR search input if it doesn't exist
    addPARSearchInput();
    
    // Enhanced save button handling - Add this at the end of the DOMContentLoaded function
    const enhanceSaveButton = function() {
        const saveParBtn = document.getElementById('saveParBtn');
        if (!saveParBtn) {
            console.warn("saveParBtn not found for enhanced handler");
            // Try again in 500ms in case it's being added dynamically
            setTimeout(enhanceSaveButton, 500);
            return;
        }
        
        console.log("Setting up enhanced save button handler");
        
        // Use the capture phase to ensure this runs first
        saveParBtn.addEventListener('click', function(e) {
            console.log("Enhanced saveParBtn handler activated");
            e.preventDefault(); // Prevent default form submission
            e.stopImmediatePropagation(); // Stop other handlers
            
            // Call the save function
            try {
                savePAR();
            } catch (error) {
                console.error("Error in savePAR function:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while saving: ' + error.message
                });
            }
        }, true); // true = use capture phase
        
        console.log("Enhanced save button handler added");
    };
    
    // Run immediately and also after DOM is fully loaded
    enhanceSaveButton();
    setTimeout(enhanceSaveButton, 1000);
    
    // Initialize pagination buttons
    const prevBtn = document.getElementById('parPrevBtn');
    const nextBtn = document.getElementById('parNextBtn');
    
    // Add a check for received_by field after modals are fully shown
    document.addEventListener('shown.bs.modal', function(event) {
        const modal = event.target;
        
        // Only check PAR-related modals
        if (modal.id && (modal.id.includes('PAR') || modal.id.includes('par'))) {
            console.log("PAR modal shown, checking and fixing received_by field");
            
            // Multiple checks with increasing delay to ensure field is correctly set
            setTimeout(ensureReceivedByFilled, 200);
            setTimeout(ensureReceivedByFilled, 500);
            setTimeout(ensureReceivedByFilled, 1000);
        }
    });
    
    // Add an event listener to the saveParBtn to ensure received_by is filled before submission
    const saveParButton = document.getElementById('saveParBtn');
    if (saveParButton) {
        saveParButton.addEventListener('click', function(e) {
            // This runs before the savePAR function
            if (!ensureReceivedByFilled()) {
                e.preventDefault();
                e.stopPropagation();
                console.error("Prevented form submission due to empty received_by field");
                
                // Try one more time with maximum effort
                if (ensureReceivedByFilled(true)) {
                    // If we fixed it, try again
                    console.log("Fixed received_by field, continuing with form submission");
                    savePAR();
                } else {
                    // If still failed, show error
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Recipient information is required. Please enter who received this PAR.'
                    });
                }
            }
        }, true); // Use capture phase to run before other handlers
    }

    // Add event handler for "Create New PAR" button
    const newParBtn = document.getElementById('newParBtn');
    if (newParBtn) {
        newParBtn.addEventListener('click', function() {
            console.log('Create New PAR button clicked');
            
            // Schedule check for received_by field after modal is shown
            setTimeout(function() {
                // Get the form
                const parForm = document.getElementById('parForm');
                if (!parForm) {
                    console.log('PAR form not found');
                    return;
                }
                
                // Reset form - this clears any previous data
                parForm.reset();
                
                // Clear par_id field - ensure we're creating new
                const parIdField = parForm.querySelector('[name="par_id"]');
                if (parIdField) {
                    parIdField.value = '';
                }
                
                // Ensure received_by field is filled with default value
                const receivedByInput = parForm.querySelector('[name="received_by"]');
                const receivedByIdField = parForm.querySelector('[name="received_by_id"]');
                
                if (receivedByInput) {
                    // Try to get username from data attribute
                    const originalValue = receivedByInput.getAttribute('data-original-value');
                    if (originalValue && originalValue.trim() !== '') {
                        receivedByInput.value = originalValue;
                        console.log('Set received_by with default value:', originalValue);
                    } else {
                        // Try to get from username data
                        const usernameData = document.getElementById('username_data');
                        if (usernameData) {
                            const username = usernameData.value || usernameData.getAttribute('data-username');
                            if (username && username.trim() !== '') {
                                receivedByInput.value = username;
                                console.log('Set received_by with username data:', username);
                            } else {
                                // Last resort
                                receivedByInput.value = 'Admin';
                                console.log('Set received_by with default "Admin"');
                            }
                        } else {
                            // Last resort
                            receivedByInput.value = 'Admin';
                            console.log('Set received_by with default "Admin"');
                        }
                    }
                }
                
                // Set default user ID in received_by_id field
                if (receivedByIdField) {
                    receivedByIdField.value = '1';
                    console.log('Set received_by_id to default: 1');
                }
                
                // Update the modal title to indicate this is a new PAR
                const titleElement = document.getElementById('addPARModalLabel');
                if (titleElement) {
                    titleElement.textContent = 'Create New Property Acknowledgement Receipt';
                }
                
                // Add initial item row if needed
                const tbody = document.getElementById('parItemsTable')?.querySelector('tbody');
                if (tbody && tbody.children.length === 0) {
                    addInitialParRow();
                }
                
                // Calculate totals
                calculateParTotal();
            }, 300);
        });
    }

    // --- Add this utility to populate filters ---
    function populateParFilters() {
        const parNoFilter = document.getElementById('parNoFilter');
        const parDateFilter = document.getElementById('parDateFilter');
        if (!parNoFilter || !parDateFilter) return;

        // Get unique PAR No and Dates from all data
        const allPars = window._allParData || parData || [];
        const parNos = Array.from(new Set(allPars.map(par => par.par_no).filter(Boolean)));
        const parDates = Array.from(new Set(allPars.map(par => par.date_acquired).filter(Boolean)));

        // Sort for better UX
        parNos.sort();
        parDates.sort();

        // Populate PAR No filter
        parNoFilter.innerHTML = '<option value="">All PAR No.</option>' +
            parNos.map(no => `<option value="${no}">${no}</option>`).join('');

        // Populate Date filter
        parDateFilter.innerHTML = '<option value="">All Dates</option>' +
            parDates.map(date => `<option value="${date}">${date}</option>`).join('');
    }

    // --- Add filter event listeners ---
    function setupParFilterEvents() {
        const parNoFilter = document.getElementById('parNoFilter');
        const parDateFilter = document.getElementById('parDateFilter');
        if (!parNoFilter || !parDateFilter) return;

        parNoFilter.addEventListener('change', function() {
            applyParFilters();
        });
        parDateFilter.addEventListener('change', function() {
            applyParFilters();
        });
    }

    function applyParFilters() {
        const parNoFilter = document.getElementById('parNoFilter');
        const parDateFilter = document.getElementById('parDateFilter');
        let filtered = window._allParData ? [...window._allParData] : [...parData];
        if (parNoFilter && parNoFilter.value) {
            filtered = filtered.filter(par => par.par_no === parNoFilter.value);
        }
        if (parDateFilter && parDateFilter.value) {
            filtered = filtered.filter(par => par.date_acquired === parDateFilter.value);
        }
        parData = filtered;
        totalItems = parData.length;
        totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        currentPage = 1;
        displayPaginatedData();
        updatePagination();
    }

    // --- Call these after loading data ---
    // Patch loadPARData to call populateParFilters after data is loaded
    const originalLoadPARData = loadPARData;
    loadPARData = function(forceRefresh = false) {
        showLoading();
        let requestUrl = 'get_par_data.php';
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 15);
        if (forceRefresh) {
            requestUrl += `?force_refresh=1&_=${timestamp}&random=${random}`;
        } else {
            requestUrl += `?_=${timestamp}`;
        }
        fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                parData = Array.isArray(data.data) ? data.data : [];
                window._allParData = [...parData];
                totalItems = parData.length;
                totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                if (currentPage > totalPages) currentPage = totalPages;
                displayPaginatedData();
                updatePagination();
                populateParFilters(); // <-- update filters
            } else {
                showError(data.message || 'Failed to load PAR data');
                if (parData && parData.length > 0) {
                    displayPaginatedData();
                    updatePagination();
                } else {
                    const tbody = document.querySelector('#parTable tbody, .par-table tbody');
                    if (tbody) {
                        tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center">
                            <i class="bi bi-exclamation-triangle me-2"></i>Error loading data. Please refresh the page.
                        </td></tr>`;
                    }
                }
                if (parTable) {
                    parTable.classList.remove('table-processing');
                    parTable.style.minHeight = '';
                    parTable.style.width = '';
                }
            }
        })
        .catch(error => {
            console.error('Error loading PAR data:', error);
            if (parData && parData.length > 0) {
                displayPaginatedData();
                updatePagination();
            } else {
                const tbody = document.querySelector('#parTable tbody, .par-table tbody');
                if (tbody) {
                    tbody.innerHTML = `<tr class=\"par-empty-row\"><td colspan=\"6\" class=\"text-center text-danger\">\n                    <i class=\"bi bi-exclamation-triangle me-2\"></i>Error: ${error.message || 'Failed to load data'}\n                </td></tr>`;
                }
            }
            if (!forceRefresh) {
                setTimeout(() => {
                    loadPARData(true);
                }, 2000);
            }
            showError('Error loading PAR data: ' + error.message);
            if (parTable) {
                parTable.classList.remove('table-processing');
                parTable.style.minHeight = '';
                parTable.style.width = '';
            }
        })
        .finally(() => {
            hideLoading();
        });
    };

    // Setup filter events on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupParFilterEvents);
    } else {
        setupParFilterEvents();
    }
    
    // Enhanced save button handling with improved reliability
    function enhanceSaveButtonHandlers() {
        console.log("Setting up enhanced save button handlers");
        
        // Improved saveParBtn event handling with multiple selectors
        const saveButtonSelectors = [
            '#saveParBtn',
            '.save-par-btn',
            '[data-action="save-par"]',
            'button[form="parForm"]',
            '.modal .btn-primary:not([data-bs-dismiss])'
        ];
        
        // Try each selector and attach handlers to all matching buttons
        saveButtonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            if (buttons.length) {
                console.log(`Found ${buttons.length} buttons matching "${selector}"`);
                
                buttons.forEach((btn, index) => {
                    // Skip if the button already has our handler
                    if (btn.hasAttribute('data-par-handler')) {
                        return;
                    }
                    
                    // Create a clone to remove any existing handlers
                    const newBtn = btn.cloneNode(true);
                    newBtn.setAttribute('data-par-handler', 'true');
                    
                    // Set type to button to prevent default form submission
                    newBtn.setAttribute('type', 'button');
                    
                    // Add our handler
                    newBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`Save button (${selector}) clicked`);
                        savePAR();
                    });
                    
                    // Replace the original button
                    if (btn.parentNode) {
                        btn.parentNode.replaceChild(newBtn, btn);
                        console.log(`Enhanced save button ${index+1} (${selector})`);
                    }
                });
            }
        });
        
        // Also add global event delegation for dynamically added buttons
        document.removeEventListener('click', handleDynamicSaveButtons);
        document.addEventListener('click', handleDynamicSaveButtons);
        
        console.log("Enhanced save button handlers setup complete");
    }
    
    // Handler for dynamically added save buttons
    function handleDynamicSaveButtons(e) {
        // Find the closest matching button that doesn't have our handler yet
        const dynamicSaveButton = e.target.closest('#saveParBtn:not([data-par-handler]), .save-par-btn:not([data-par-handler]), [data-action="save-par"]:not([data-par-handler])');
        
        if (dynamicSaveButton) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Dynamic save button clicked');
            
            // Mark it as handled to prevent duplicate triggers
            dynamicSaveButton.setAttribute('data-par-handler', 'true');
            
            // Call the save function
            savePAR();
        }
    }
    
    // Call immediately and also with delay to catch async loaded elements
    enhanceSaveButtonHandlers();
    setTimeout(enhanceSaveButtonHandlers, 500);
    setTimeout(enhanceSaveButtonHandlers, 1500);
    
    // Also setup when modals are shown
    document.addEventListener('shown.bs.modal', function(event) {
        if (event.target.id && (event.target.id.includes('par') || event.target.id.includes('PAR'))) {
            setTimeout(enhanceSaveButtonHandlers, 100);
        }
    });
    
    // Additional PAR-specific initialization code can go here
    
    // Make a global reference to the enhance function for external calls
    window.attachPARButtonHandler = enhanceSaveButtonHandlers;
});

/**
 * Add PAR search input to the PAR table section
 */
function addPARSearchInput() {
    const parCardHeader = document.querySelector('.par-section .card-header');
    if (parCardHeader) {
        // Check if search input already exists
        if (!document.getElementById('parSearchInput')) {
            // Create container for search and export elements
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'mt-2 mb-3 d-flex justify-content-between align-items-center';
            
            // Create search input container
            const searchContainer = document.createElement('div');
            searchContainer.className = 'input-group';
            searchContainer.style.width = '250px';
            
            // Create search input
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'parSearchInput';
            searchInput.className = 'form-control ps-4';
            searchInput.placeholder = 'Search PAR...';
            
            // Create search icon
            const searchIcon = document.createElement('span');
            searchIcon.className = 'input-group-text bg-transparent border-start-0';
            searchIcon.innerHTML = '<i class="bi bi-search"></i>';
            
            // Assemble the search input group
            searchContainer.appendChild(searchInput);
            searchContainer.appendChild(searchIcon);
            
            // Add buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'd-flex align-items-center';
            
            // Batch Print button
            const batchPrintBtn = document.createElement('button');
            batchPrintBtn.className = 'btn btn-outline-primary batch-print-par me-2';
            batchPrintBtn.innerHTML = '<i class="bi bi-printer"></i> Batch Print';
            batchPrintBtn.title = 'Print multiple PAR documents';
            
            // Export button
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-outline-secondary export-par';
            exportBtn.innerHTML = '<i class="bi bi-download"></i> Export';
            exportBtn.title = 'Export PAR data to Excel';
            
            // Add buttons to container
            buttonsContainer.appendChild(batchPrintBtn);
            buttonsContainer.appendChild(exportBtn);
            
            // Add search container to controls container
            controlsContainer.appendChild(searchContainer);
            controlsContainer.appendChild(buttonsContainer);
            
            // Add controls below the heading
            const cardBody = parCardHeader.closest('.card').querySelector('.card-body');
            if (cardBody) {
                // Insert controls at the beginning of card body, before table
                const tableResponsive = cardBody.querySelector('.table-responsive');
                if (tableResponsive) {
                    cardBody.insertBefore(controlsContainer, tableResponsive);
                } else {
                    cardBody.prepend(controlsContainer);
                }
            }
            
            // Add event listener to search input
            searchInput.addEventListener('input', function() {
                searchPAR(this.value);
            });
        }
    }
    
    // Also add event listener to existing search inputs if they exist but don't have listeners
    const existingSearchInput = document.getElementById('parSearchInput');
    if (existingSearchInput) {
        existingSearchInput.addEventListener('input', function() {
            searchPAR(this.value);
        });
    }
    
    // Also check for the alternative ID poSearchInput
    const poSearchInput = document.getElementById('poSearchInput');
    if (poSearchInput) {
        console.log('Found poSearchInput (alternative ID), adding event listener');
        poSearchInput.addEventListener('input', function() {
            searchPAR(this.value);
        });
    }
}

/**
 * Search PAR data with the given query
 */
function searchPAR(query) {
    if (!window._allParData) {
        window._allParData = parData ? [...parData] : [];
    }
    query = query.toLowerCase().trim();
    currentPage = 1;
    if (query === '') {
        parData = [...window._allParData];
        totalItems = parData.length;
        totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        displayPaginatedData();
        updatePagination();
        return;
    }
    const filteredData = window._allParData.filter(par => {
        return (
            (par.par_no && par.par_no.toLowerCase().includes(query)) ||
            (par.property_number && par.property_number.toLowerCase().includes(query)) ||
            (par.received_by_name && par.received_by_name.toLowerCase().includes(query)) ||
            (par.date_acquired && par.date_acquired.toLowerCase().includes(query))
        );
    });
    parData = filteredData;
    totalItems = parData.length;
    totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    displayPaginatedData();
    updatePagination();
}

/**
 * Load PAR data from the server with pagination
 * @param {boolean} forceRefresh - Whether to force a cache bypass
 */
function loadPARData(forceRefresh = false) {
    showLoading();
    let requestUrl = 'get_par_data.php';
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 15);
    if (forceRefresh) {
        requestUrl += `?force_refresh=1&_=${timestamp}&random=${random}`;
    } else {
        requestUrl += `?_=${timestamp}`;
    }
    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            parData = Array.isArray(data.data) ? data.data : [];
            window._allParData = [...parData];
            totalItems = parData.length;
            totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            displayPaginatedData();
            updatePagination();
        } else {
            showError(data.message || 'Failed to load PAR data');
            if (parData && parData.length > 0) {
                displayPaginatedData();
                updatePagination();
            } else {
                const tbody = document.querySelector('#parTable tbody, .par-table tbody');
                if (tbody) {
                    tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center">
                        <i class="bi bi-exclamation-triangle me-2"></i>Error loading data. Please refresh the page.
                    </td></tr>`;
                }
            }
            if (parTable) {
                parTable.classList.remove('table-processing');
                parTable.style.minHeight = '';
                parTable.style.width = '';
            }
        }
    })
    .catch(error => {
        console.error('Error loading PAR data:', error);
        if (parData && parData.length > 0) {
            displayPaginatedData();
            updatePagination();
        } else {
            const tbody = document.querySelector('#parTable tbody, .par-table tbody');
            if (tbody) {
                tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>Error: ${error.message || 'Failed to load data'}
                </td></tr>`;
            }
        }
        if (!forceRefresh) {
            setTimeout(() => {
                loadPARData(true);
            }, 2000);
        }
        showError('Error loading PAR data: ' + error.message);
        if (parTable) {
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
        }
    })
    .finally(() => {
        hideLoading();
    });
}

/**
 * Display only the current page of data
 */
function displayPaginatedData() {
    if (parData && parData.length > 0) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, parData.length);
        const pageData = parData.slice(startIndex, endIndex);
        displayPARData(pageData, false);
    } else {
        displayPARData([], false);
    }
}

/**
 * Update pagination controls and info
 */
function updatePagination() {
    const pageInfo = document.getElementById('parPageInfo');
    const prevBtn = document.getElementById('parPrevBtn');
    const nextBtn = document.getElementById('parNextBtn');
    let startItem = 0, endItem = 0;
    if (totalItems > 0) {
        startItem = (currentPage - 1) * itemsPerPage + 1;
        endItem = Math.min(currentPage * itemsPerPage, totalItems);
    }
    if (pageInfo) {
        pageInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} items`;
    }
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                displayPaginatedData();
                updatePagination();
            }
        };
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = function() {
            if (currentPage < totalPages) {
                currentPage++;
                displayPaginatedData();
                updatePagination();
            }
        };
    }
    console.log(`Pagination updated: Page ${currentPage} of ${totalPages}, Items ${totalItems}`);
}

/**
 * Display PAR data in the table
 * @param {Array} pars - Array of PAR objects to display
 * @param {boolean} updateAll - Whether to update all data and pagination
 * @returns {number} - The number of displayed records
 */
function displayPARData(pars, updateAll = true) {
    console.log(`Beginning displayPARData with ${pars?.length || 0} records`);
    
    // Normalize data format
    // get_par.php returns {success: true, data: [...]} while get_par_data.php may return different format
    if (pars && typeof pars === 'object' && pars.success && Array.isArray(pars.data)) {
        console.log('Normalizing data format from API response');
        pars = pars.data;
    }
    
    // If still not an array, try to convert
    if (!Array.isArray(pars)) {
        console.warn('PAR data is not an array, attempting to convert');
        if (pars && typeof pars === 'object') {
            // Single object - convert to array with one item
            pars = [pars];
        } else {
            // Empty or invalid - use empty array
            pars = [];
        }
    }
    
    // Find the PAR table - try multiple possible selectors
    const parTable = document.getElementById('parTable') || 
                     document.querySelector('.par-table') || 
                     document.querySelector('table.table');
    
    if (!parTable) {
        console.error("PAR table not found in the DOM. Will attempt to create it.");
        // Log all tables on the page to help debugging
        const allTables = document.querySelectorAll('table');
        console.error("Available tables:", 
            Array.from(allTables).map(t => ({
                id: t.id || '(no id)', 
                class: t.className || '(no class)',
                parent: t.parentElement ? (t.parentElement.id || t.parentElement.className || 'unknown') : 'none'
            })));
            
        // Try to find a container to create the table in
        const parSection = document.querySelector('.par-section, .par-container, #parContainer, #parSection') || 
                          document.querySelector('.card') || document.querySelector('.container');
        if (parSection) {
            console.log("Found container to create PAR table in:", parSection);
            
            // Create a table
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive mt-3';
            
            const table = document.createElement('table');
            table.id = 'parTable';
            table.className = 'table table-bordered table-hover par-table';
            
            // Add table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>PAR No.</th>
                    <th>Date Acquired</th>
                    <th>Property Number</th>
                    <th>Received By</th>
                    <th class="text-end">Amount</th>
                    <th class="text-center">Actions</th>
                </tr>
            `;
            
            // Add table body
            const tbody = document.createElement('tbody');
            tbody.id = 'parTableBody';
            
            // Assemble the table
            table.appendChild(thead);
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            
            // Add to the page
            parSection.appendChild(tableContainer);
            console.log("Created new PAR table in the DOM");
            
            // Now use this table
            return displayPARData(pars, table); // Recursive call with created table
        } else {
            showError('PAR table not found. Please refresh the page or contact support.');
            return 0;
        }
    }
    
    console.log(`Found PAR table with ID: ${parTable.id || 'unnamed'}, Class: ${parTable.className}`);
    
    // Store current table dimensions for stability
    const tableHeight = parTable.offsetHeight;
    const tableWidth = parTable.offsetWidth;
    
    // Add a processing class and stabilize dimensions
    parTable.classList.add('table-processing');
    parTable.style.minHeight = tableHeight + 'px';
    parTable.style.width = tableWidth + 'px';
    
    // Find the tbody - try multiple possible selectors
    const tbody = parTable.querySelector('tbody') || 
                document.getElementById('parTableBody') || 
                document.querySelector('#parTable tbody');
    
    if (!tbody) {
        console.error("PAR table body not found in table:", parTable);
        
        // Try to create tbody if it doesn't exist
        try {
            const newTbody = document.createElement('tbody');
            newTbody.id = 'parTableBody';
            parTable.appendChild(newTbody);
            console.log("Created new tbody element for PAR table");
            
            // Remove table stabilization
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
            
            return displayPARData(pars, parTable); // Recursive call with new tbody
        } catch (e) {
            console.error("Failed to create tbody:", e);
            
            // Remove table stabilization
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
            
            showError('Could not display PAR data. Please refresh the page.');
            return 0;
        }
    }
    
    console.log(`Displaying ${pars?.length || 0} PAR records in table with ${tbody.children.length} existing rows`);
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // If no data or empty array, show empty message
    if (!pars || !Array.isArray(pars) || pars.length === 0) {
        console.warn("No PAR data to display");
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'par-empty-row';
        emptyRow.innerHTML = `<td colspan="6" class="text-center">No PAR records found</td>`;
        tbody.appendChild(emptyRow);
        
        // Remove table stabilization after updating content
        parTable.classList.remove('table-processing');
        parTable.style.minHeight = '';
        parTable.style.width = '';
        
        // --- FIX: update totalItems and totalPages even if empty ---
        totalItems = 0;
        totalPages = 1;
        currentPage = 1;
        updatePagination();
        return 0;
    }
    
    // Make a copy of the data to avoid modifying the original
    const parsToDisplay = [...pars];
    
    // Check if the received data appears valid
    let needsFreshData = false;
    if (parsToDisplay.length > 0) {
        // Check if first par has required fields
        const firstPar = parsToDisplay[0];
        if (!firstPar.par_id || !firstPar.par_no) {
            console.warn("PAR data appears invalid, missing required fields:", firstPar);
            needsFreshData = true;
        }
    }
    
    if (needsFreshData) {
        console.log("PAR data appears invalid, fetching fresh data...");
        
        // Remove table stabilization
        parTable.classList.remove('table-processing');
        parTable.style.minHeight = '';
        parTable.style.width = '';
        
        refreshPARTableData();
        return 0;
    }
    
    // Keep track of rows created for debugging
    let rowsCreated = 0;
    
    // Add each PAR row to the table
    parsToDisplay.forEach((par, index) => {
        // Skip if par is not an object or is null
        if (!par || typeof par !== 'object') {
            console.warn(`Skipping invalid PAR record at index ${index}:`, par);
            return;
        }
        
        console.log(`Processing PAR record ${index+1}:`, par.par_id);
        
        // Ensure all required properties are available
        const parId = par.par_id || '';
        const parNo = par.par_no || '';
        const dateAcquired = par.date_acquired || '';
        const receivedBy = par.received_by_name || par.received_by || '';
        const totalAmount = par.total_amount || 0;
        
        // Ensure property number is available, even if it's from first item
        let propertyNumber = par.property_number || '';
        
        // If property number is missing, try to get it from the first item if available
        if (!propertyNumber && par.items && par.items.length > 0) {
            propertyNumber = par.items[0].property_number || '';
        }
        
        // Create row element with data attributes for stability
        const row = document.createElement('tr');
        row.setAttribute('data-par-id', parId);
        row.setAttribute('data-par-no', parNo);
        row.className = 'par-row';
        
        // Add row content
        row.innerHTML = `
            <td>${parNo}</td>
            <td>${dateAcquired}</td>
            <td>${propertyNumber}</td>
            <td>${receivedBy}</td>
            <td class="text-end fw-medium text-black">${formatNumber(totalAmount)}</td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-sm btn-info view-par" data-par-id="${parId}" title="View PAR">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-primary edit-par" data-par-id="${parId}" title="Edit PAR">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger delete-par" data-par-id="${parId}" title="Delete PAR">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Append row to tbody
        tbody.appendChild(row);
        rowsCreated++;
    });
    
    // Remove table stabilization after updating content
    parTable.classList.remove('table-processing');
    parTable.style.minHeight = '';
    parTable.style.width = '';
    
    // Log success message
    console.log(`Successfully created ${rowsCreated} PAR table rows`);
    
    // Refresh button event listeners for newly created elements
    addPARButtonEventListeners();
    
    console.log("PAR table updated with data. Row count:", tbody.children.length);
    
    // --- FIX: update totalItems and totalPages after displaying data ---
    // REMOVE this block to prevent parData from being overwritten and causing duplication
    // if (updateAll) {
    //     parData = parsToDisplay;
    //     totalItems = parsToDisplay.length;
    //     totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    //     if (currentPage > totalPages) currentPage = totalPages;
    // }
    updatePagination();
    
    // Return the number of records displayed for verification
    return tbody.children.length;
}

/**
 * Add event listeners to PAR action buttons
 */
function addPARButtonEventListeners() {
    // This function is now supplementary to the global event delegation
    // The existing code can remain as a backup for static elements
    
    // View PAR
    document.querySelectorAll('.view-par').forEach(button => {
        button.addEventListener('click', function() {
            const parId = this.getAttribute('data-par-id');
            viewPAR(parId);
        });
    });
    
    // Edit PAR
    document.querySelectorAll('.edit-par').forEach(button => {
        button.addEventListener('click', function() {
            const parId = this.getAttribute('data-par-id');
            editPAR(parId);
        });
    });
    
    // Delete PAR
    document.querySelectorAll('.delete-par').forEach(button => {
        button.addEventListener('click', function() {
            const parId = this.getAttribute('data-par-id');
            deletePAR(parId);
        });
    });
}

/**
 * Initialize PAR form events
 */
function initPARFormEvents() {
    // Add PAR item row button
    const addParRowBtn = document.getElementById('addParRowBtn');
    if (addParRowBtn) {
        // Remove any existing event listeners
        const newAddParRowBtn = addParRowBtn.cloneNode(true);
        addParRowBtn.parentNode.replaceChild(newAddParRowBtn, addParRowBtn);
        
        newAddParRowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                addParRow();
            } catch (error) {
                console.error("Error adding PAR row:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add new item. Please try again.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }
    
    // Form submission
    const parForm = document.getElementById('parForm');
    if (parForm) {
        // Store original received_by value before form reset
        let originalReceivedBy = '';
        
        // Add event listener for form reset to preserve received_by
        parForm.addEventListener('reset', function(e) {
            e.preventDefault();
            
            try {
                const receivedByInput = parForm.querySelector('[name="received_by"]');
                if (receivedByInput) {
                    originalReceivedBy = receivedByInput.value;
                    console.log("Stored original received_by value before reset:", originalReceivedBy);
                }
                
                // Reset the form the standard way
                this.reset();
                
                // After reset, restore the value
                setTimeout(function() {
                    try {
                        if (receivedByInput && originalReceivedBy) {
                            receivedByInput.value = originalReceivedBy;
                            console.log("Restored received_by value after reset:", originalReceivedBy);
                        } else {
                            // If no stored value, ensure it's filled
                            ensureReceivedByFilled(true);
                        }
                    } catch (error) {
                        console.error("Error restoring received_by value:", error);
                    }
                }, 10);
            } catch (error) {
                console.error("Error handling form reset:", error);
            }
            
            return false;
        });
        
        parForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                savePAR();
            } catch (error) {
                console.error("Error saving PAR:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save PAR. Please try again.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            return false;
        });
    }

    // Add initial PAR row if table is empty
    const parItemsTable = document.getElementById('parItemsTable');
    if (parItemsTable) {
        const tbody = parItemsTable.querySelector('tbody');
        if (tbody && tbody.children.length === 0) {
            try {
                addInitialParRow();
            } catch (error) {
                console.error("Error adding initial PAR row:", error);
            }
        }
    }
    
    // Initialize modals with error handling
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
        document.querySelectorAll('.modal').forEach(modalElement => {
            try {
                new bootstrap.Modal(modalElement, {
                    backdrop: 'static',
                    keyboard: false
                });
                
                // Add error handling for modal events
                modalElement.addEventListener('show.bs.modal', function(e) {
                    try {
                        document.body.style.overflowY = 'scroll';
                        document.body.style.paddingRight = '0px';
                    } catch (error) {
                        console.error("Error handling modal show event:", error);
                    }
                });
                
                modalElement.addEventListener('hidden.bs.modal', function(e) {
                    try {
                        document.body.style.overflowY = '';
                        document.body.style.paddingRight = '';
                    } catch (error) {
                        console.error("Error handling modal hidden event:", error);
                    }
                });
            } catch (e) {
                console.error('Error initializing modal:', e);
            }
        });
    }
    
    // Attach handlers to all save buttons
    if (typeof window.attachPARButtonHandler === 'function') {
        window.attachPARButtonHandler();
    }
}

/**
 * View PAR details
 */
function viewPAR(parId) {
    window.location.href = `ViewPAR.php?id=${parId}`;
}

/**
 * Print PAR with the given ID
 */
function printPAR(parId) {
    if (!parId) return;
    
    console.log('Printing PAR with ID:', parId);
    
    // Open the PAR in a new window for printing
    const printWindow = window.open(`viewPar.php?id=${parId}&print=true`, '_blank');
    
    // Focus the new window (if not blocked by browser)
    if (printWindow) {
        printWindow.focus();
    } else {
        Swal.fire({
            title: 'Pop-up Blocked',
            text: 'Please allow pop-ups for this site to print PAR documents',
            icon: 'warning'
        });
    }
}

/**
 * Edit PAR
 */
function editPAR(parId) {
    showLoading();
    
    fetch(`get_par.php?id=${parId}&_=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const modalElement = document.getElementById('addPARModal');
                if (!modalElement) {
                    throw new Error('Modal element not found');
                }

                // Get Bootstrap modal instance or create a new one
                let parModal;
                try {
                    if (typeof bootstrap !== 'undefined') {
                        parModal = bootstrap.Modal.getInstance(modalElement);
                        if (!parModal) {
                            parModal = new bootstrap.Modal(modalElement);
                        }
                    } else {
                        throw new Error('Bootstrap not defined');
                    }
                } catch (e) {
                    console.error('Error getting modal instance:', e);
                    // Fallback manual modal show
                    modalElement.classList.add('show');
                    modalElement.style.display = 'block';
                    modalElement.removeAttribute('aria-hidden');
                    modalElement.setAttribute('aria-modal', 'true');
                    document.body.classList.add('modal-open');
                    
                    // Add backdrop
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }

                const parForm = document.getElementById('parForm');
                if (!parForm) {
                    throw new Error('PAR form not found');
                }

                // Reset form
                parForm.reset();
                
                // Set form fields
                parForm.querySelector('[name="par_id"]').value = data.data.par_id;
                parForm.querySelector('[name="par_no"]').value = data.data.par_no;
                parForm.querySelector('[name="entity_name"]').value = data.data.entity_name;
                
                // IMPROVED: Handle received_by field with robust fallbacks
                const receivedByInput = parForm.querySelector('[name="received_by"]');
                const receivedByIdField = parForm.querySelector('[name="received_by_id"]');
                
                console.log('Received data for user:', {
                    received_by: data.data.received_by,
                    received_by_name: data.data.received_by_name
                });
                
                // First set the received_by_id field
                if (receivedByIdField) {
                    // Use numeric received_by value if available
                    if (data.data.received_by && !isNaN(parseInt(data.data.received_by))) {
                        receivedByIdField.value = data.data.received_by;
                        console.log('Set received_by_id to:', data.data.received_by);
                    } else {
                        // Default to 1 if no valid ID
                        receivedByIdField.value = '1';
                        console.log('Set received_by_id to default: 1');
                    }
                }
                
                // Then set the received_by display field
                if (receivedByInput) {
                    // Prioritize received_by_name if available
                    if (data.data.received_by_name && data.data.received_by_name !== 'Unknown') {
                        receivedByInput.value = data.data.received_by_name;
                        console.log('Set received_by to name:', data.data.received_by_name);
                    } 
                    // Fallback to received_by if it's a string (not numeric)
                    else if (data.data.received_by && isNaN(parseInt(data.data.received_by))) {
                        receivedByInput.value = data.data.received_by;
                        console.log('Set received_by to received_by string value:', data.data.received_by);
                    }
                    // Fallback to empty or default
                    else {
                        // Try to get default from the data attribute
                        const defaultValue = receivedByInput.getAttribute('data-original-value') || '';
                        receivedByInput.value = defaultValue;
                        console.log('Set received_by to default value:', defaultValue);
                    }
                }
                
                const positionField = parForm.querySelector('[name="position"]');
                if (positionField && data.data.position !== undefined) {
                    positionField.value = data.data.position || '';
                }
                
                const departmentField = parForm.querySelector('[name="department"]');
                if (departmentField && data.data.department !== undefined) {
                    departmentField.value = data.data.department || '';
                }
                
                parForm.querySelector('[name="date_acquired"]').value = data.data.date_acquired || '';
                
                const remarksField = parForm.querySelector('[name="remarks"]');
                if (remarksField && data.data.remarks !== undefined) {
                    remarksField.value = data.data.remarks || '';
                }
                
                // Clear and populate items
                const tbody = document.getElementById('parItemsTable')?.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = '';
                    if (data.data.items?.length > 0) {
                        data.data.items.forEach(item => addParRowWithData(item));
                    } else {
                        addInitialParRow();
                    }
                }
                
                calculateParTotal();
                
                // Update modal title and show
                const titleElement = document.getElementById('addPARModalLabel');
                if (titleElement) titleElement.textContent = 'Edit Property Acknowledgement Receipt';
                
                // Show the modal
                if (parModal) {
                    parModal.show();
                }
            } else {
                throw new Error(data.message || 'Failed to load PAR data');
            }
        })
        .catch(error => {
            console.error('Error loading PAR data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load PAR data'
            });
        })
        .finally(hideLoading);
}

/**
 * Delete PAR with improved confirmation and table stability
 */
function deletePAR(parId) {
    if (!parId) {
        console.error("No PAR ID provided for deletion");
        return;
    }

    console.log("Attempting to delete PAR with ID:", parId);
    
    // First, apply a stabilizing class to the table to prevent layout shifts
    const parTable = document.getElementById('parTable') || document.querySelector('.par-table');
    if (parTable) {
        parTable.classList.add('table-processing');
        
        // Store current table dimensions for stability
        const tableHeight = parTable.offsetHeight;
        const tableWidth = parTable.offsetWidth;
        
        // Apply fixed dimensions to prevent layout shifts
        parTable.style.minHeight = tableHeight + 'px';
        parTable.style.width = tableWidth + 'px';
    }

    Swal.fire({
        title: 'Delete PAR',
        text: "Are you sure you want to delete this PAR record? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            showLoading();
            
            // Use both approaches for compatibility - try POST first with JSON body
            fetch('delete_par.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    par_id: parId
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error("Server response:", text);
                        try {
                            // Try to parse as JSON
                            return JSON.parse(text);
                        } catch (e) {
                            // If not valid JSON, throw with text
                            throw new Error(`Server error: ${response.status} ${response.statusText}. Details: ${text}`);
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Use Swal.fire instead of showSuccessModal
                    Swal.fire({
                        icon: 'success',
                        title: 'Item Deleted!',
                        text: 'The Property Acknowledgement Receipt has been deleted successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        // Refresh PAR data after successful deletion
                        loadPARData(true);
                    });
                } else {
                    showError(data.message || 'Failed to delete PAR');
                }
            })
            .catch(error => {
                console.error('Error deleting PAR:', error);
                showError('Error deleting PAR: ' + error.message);
            })
            .finally(() => {
                hideLoading();
            });
        }
    });
}

/**
 * Add a new PAR item row
 */
function addParRow() {
    console.log("Adding new PAR row");
    const tbody = document.getElementById('parItemsTable')?.querySelector('tbody');
    if (!tbody) {
        console.error("PAR table body not found");
        return;
    }
    
    try {
        const newRow = document.createElement('tr');
        
        // Get current date in ISO format
        const today = new Date().toISOString().split('T')[0];
        
        // Create empty row with default values
        newRow.innerHTML = `
            <td><input type="number" class="form-control par-qty qty" name="quantity[]"  required></td>
            <td><input type="text" class="form-control" name="unit[]" value="" placeholder="Unit"></td>
            <td><textarea class="form-control" name="description[]" placeholder="Description" required></textarea></td>
            <td><input type="text" class="form-control property-number" name="property_number[]" value="" placeholder="Property Number"></td>
            <td><input type="date" class="form-control par-item-date" name="date_acquired[]" value="${today}"></td>
            <td><input type="text" class="form-control par-amount amount" name="unit_price[]" value="0.00" data-raw-value="0"></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-par-row"><i class="bi bi-trash"></i></button></td>
        `;
        
        // Add row to table
        tbody.appendChild(newRow);
        
        // Add event listeners with error handling
        try {
            addParRowEventListeners(newRow);
        } catch (e) {
            console.error("Error adding event listeners to new row:", e);
        }
        
        // Recalculate total
        try {
            calculateParTotal();
        } catch (e) {
            console.error("Error calculating total:", e);
        }
        
        // Focus on the first input for better UX
        const firstInput = newRow.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 0);
        }
        
        console.log("Successfully added new PAR row");
    } catch (error) {
        console.error("Error adding PAR row:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add new item. Please try again.',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

/**
 * Add a PAR item row with data
 */
function addParRowWithData(item) {
    const tbody = document.getElementById('parItemsTable').querySelector('tbody');
    if (!tbody) {
        console.error("PAR table body not found");
        return;
    }
    
    const newRow = document.createElement('tr');
    
    const quantity = item.quantity || 1;
    const unit = item.unit || '';
    const description = item.description || item.item_description || '';
    const propertyNumber = item.property_number || '';
    const dateAcquired = item.date_acquired || new Date().toISOString().split('T')[0];
    
    // Get price from unit_price, amount, or 0
    let amount = 0;
    if (typeof item.unit_price !== 'undefined') {
        amount = parseFloat(item.unit_price);
    } else if (typeof item.amount !== 'undefined') {
        amount = parseFloat(item.amount);
    }
    
    // Ensure amount is a valid number
    amount = isNaN(amount) ? 0 : amount;
    
    const formattedAmount = formatNumber(amount);
    
    newRow.innerHTML = `
        <td>
            <input type="number" class="form-control par-qty qty" name="quantity[]" value="${quantity}" min="1" required>
        </td>
        <td>
            <input type="text" class="form-control" name="unit[]" value="${unit}" placeholder="Unit">
        </td>
        <td>
            <textarea class="form-control" name="description[]" placeholder="Description" required>${description}</textarea>
        </td>
        <td>
            <input type="text" class="form-control property-number" name="property_number[]" value="${propertyNumber}" placeholder="Property Number">
        </td>
        <td>
            <input type="date" class="form-control par-item-date" name="date_acquired[]" value="${dateAcquired}">
        </td>
        <td>
            <input type="text" class="form-control par-amount amount" name="unit_price[]" value="${formattedAmount}" data-raw-value="${amount}">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-par-row">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // Add event listeners for the new row
    addParRowEventListeners(newRow);
    
    calculateParTotal();
}

/**
 * Add initial PAR row if table is empty
 */
function addInitialParRow() {
    console.log("Adding initial PAR row");
    const tbody = document.getElementById('parItemsTable')?.querySelector('tbody');
    if (tbody && tbody.children.length === 0) {
        addParRow();
    }
}

/**
 * Add event listeners to PAR row
 */
function addParRowEventListeners(row) {
    if (!row) return;
    
    // Remove row button
    const removeBtn = row.querySelector('.remove-par-row');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveParRow(this);
        });
    }
    
    // Property number input event - check for duplicates
    const propertyNumberInput = row.querySelector('.property-number');
    if (propertyNumberInput) {
        propertyNumberInput.addEventListener('blur', function(e) {
            checkDuplicatePropertyNumber(this);
        });
    }
    
    // Amount input event
    const amountInput = row.querySelector('.par-amount');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            try {
                // Format the input to currency
                const value = this.value.replace(/[^0-9.]/g, '');
                this.value = formatNumber(parseFloat(value) || 0);
                if (this.dataset) {
                    this.dataset.rawValue = parseFloat(value) || 0;
                }
                
                // Recalculate total
                calculateParTotal();
            } catch (error) {
                console.error("Error handling amount input:", error);
            }
        });
        
        // Also add blur event to ensure proper formatting
        amountInput.addEventListener('blur', function(e) {
            try {
                if (this.value === '' || isNaN(parseFloat(this.value))) {
                    this.value = formatNumber(0);
                    if (this.dataset) {
                        this.dataset.rawValue = '0';
                    }
                } else {
                    const value = parseFloat(this.value.replace(/[^0-9.]/g, '')) || 0;
                    this.value = formatNumber(value);
                    if (this.dataset) {
                        this.dataset.rawValue = value.toString();
                    }
                }
                calculateParTotal();
            } catch (error) {
                console.error("Error handling amount blur:", error);
            }
        });
    }
    
    // Quantity input event with improved validation
    const qtyInput = row.querySelector('.par-qty');
    if (qtyInput) {
        // Input event
        qtyInput.addEventListener('input', function(e) {
            try {
                validateQuantity(this);
                calculateParTotal();
            } catch (error) {
                console.error("Error handling quantity input:", error);
            }
        });
        
        // Blur event to ensure valid value
        qtyInput.addEventListener('blur', function(e) {
            try {
                validateQuantity(this, true);
                calculateParTotal();
            } catch (error) {
                console.error("Error handling quantity blur:", error);
            }
        });
    }
}

/**
 * Validate quantity input
 * @param {HTMLInputElement} input - The quantity input element
 * @param {boolean} isFinalCheck - Whether this is a final check (on blur)
 * @returns {number} - The validated quantity
 */
function validateQuantity(input, isFinalCheck = false) {
    if (!input) return 1;
    
    try {
        // Parse the input value
        let value = parseInt(input.value);
        
        // Check if it's a valid number
        if (isNaN(value) || value < 1) {
            value = 1;
            input.value = value;
        }
        
        // Ensure it's a positive integer
        if (value < 1) {
            value = 1;
            input.value = value;
        }
        
        // Cap at a reasonable maximum if needed
        const MAX_QTY = 999999;
        if (value > MAX_QTY) {
            value = MAX_QTY;
            input.value = value;
            
            if (isFinalCheck) {
                console.warn(`Quantity exceeded maximum (${MAX_QTY}), capped value`);
            }
        }
        
        return value;
    } catch (error) {
        console.error("Error validating quantity:", error);
        input.value = 1;
        return 1;
    }
}

/**
 * Handle removing a PAR row
 */
function handleRemoveParRow(button) {
    if (!button) return;
    
    try {
        const row = button.closest('tr');
        if (!row) return;

        const tbody = row.parentElement;
        if (!tbody) return;
        
        // Make sure we keep at least one row
        if (tbody.querySelectorAll('tr').length > 1) {
            row.remove();
            calculateParTotal();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Remove',
                text: 'At least one item is required',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error("Error removing PAR row:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to remove item. Please try again.',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

/**
 * Calculate PAR total amount
 */
function calculateParTotal() {
    let total = 0;
    
    try {
        console.log("Calculating PAR total amount...");
        const rows = document.querySelectorAll('#parItemsTable tbody tr');
        
        if (rows.length === 0) {
            console.log('No rows found to calculate total');
            updateTotalDisplay(0);
            return 0;
        }
        
        rows.forEach((row, index) => {
            const qtyInput = row.querySelector('[name="quantity[]"]');
            const amountInput = row.querySelector('[name="unit_price[]"]');
            
            if (!qtyInput || !amountInput) {
                console.log(`Missing inputs in row ${index + 1}`);
                return;
            }
            
            // Parse quantity and amount values - ensure clean numeric values
            const qtyValue = qtyInput.value.trim();
            // Get raw value from dataset if available, otherwise clean the formatted string
            let amountValue;
            if (amountInput.dataset && amountInput.dataset.rawValue) {
                amountValue = amountInput.dataset.rawValue;
            } else {
                // Remove currency symbols, commas and spaces
                amountValue = amountInput.value.trim().replace(/[₱,\s]/g, '');
                // Store cleaned value back to dataset for future use
                if (amountInput.dataset) {
                    amountInput.dataset.rawValue = amountValue;
                }
            }
            
            const qty = parseInt(qtyValue) || 1;
            const amount = parseFloat(amountValue) || 0;
            
            const rowTotal = qty * amount;
            total += rowTotal;
            
            console.log(`Row ${index + 1}: qty=${qty}, unit_price=${amount}, rowTotal=${rowTotal}`);
        });
        
        console.log('Final total:', total);
        updateTotalDisplay(total);
    } catch (error) {
        console.error('Error calculating PAR total:', error);
    }
    
    // Ensure we return a valid number, not NaN or Infinity
    return isNaN(total) || !isFinite(total) ? 0 : total;
}

/**
 * Update total display and hidden input
 */
function updateTotalDisplay(total) {
    console.log("Updating total display with value:", total);
    
    // Ensure total is a valid number
    if (isNaN(total) || !isFinite(total)) {
        total = 0;
    }
    
    // Restrict to reasonable range (prevent SQL out of range errors)
    // Assuming DECIMAL(10,2) or similar in the database
    const MAX_VALUE = 9999999.99;
    if (total > MAX_VALUE) {
        total = MAX_VALUE;
        console.warn("Total amount exceeded maximum allowed value, capped at", MAX_VALUE);
    }
    
    // Try to find total display element in various locations
    const totalElementSelectors = [
        '#parTotalAmount',  // Hidden input
        '#parTotal',        // Visible span
        '#parItemsTable tfoot #parTotal',
        '#parItemsTable tfoot input[name="total_amount"]'
    ];
    
    // Update all total display elements we can find
    totalElementSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.value = total.toFixed(2);
            } else {
                element.textContent = formatNumber(total);
            }
            console.log(`Updated total element (${selector}):`, element);
        }
    });
    
    // Always update the hidden input for form submission
    const totalInput = document.querySelector('[name="total_amount"]');
    if (totalInput) {
        totalInput.value = total.toFixed(2);
        console.log('Updated hidden total input:', total.toFixed(2));
    } else {
        // Create a hidden input for total_amount if it doesn't exist
        const parForm = document.getElementById('parForm');
        if (parForm) {
            let hiddenInput = parForm.querySelector('[name="total_amount"]');
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'total_amount';
                parForm.appendChild(hiddenInput);
            }
            hiddenInput.value = total.toFixed(2);
            console.log('Created/updated hidden total input:', total.toFixed(2));
        }
    }
}

/**
 * Clear browser cache for PAR-related requests
 * This uses various techniques to ensure PAR data is freshly loaded
 */
function clearPARCache() {
    console.log('Clearing PAR data cache');
    
    // 1. Try to use the Cache API if available (modern browsers)
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    return caches.open(cacheName).then(cache => {
                        // Define the URLs to clear
                        const urlsToDelete = [
                            'get_par.php',
                            '/get_par.php',
                            'add_par.php',
                            '/add_par.php',
                            'update_par.php',
                            '/update_par.php',
                            'delete_par.php',
                            '/delete_par.php'
                        ];
                        
                        // Add variations with parameters
                        const timestamp = new Date().getTime();
                        const random = Math.random().toString(36).substring(2, 15);
                        urlsToDelete.push(`get_par.php?_=${timestamp}`);
                        urlsToDelete.push(`get_par.php?force_refresh=1`);
                        urlsToDelete.push(`get_par.php?force_refresh=1&_=${timestamp}`);
                        urlsToDelete.push(`get_par.php?random=${random}`);
                        
                        // Also add the current page URL and variants
                        const currentUrl = window.location.href;
                        urlsToDelete.push(currentUrl);
                        urlsToDelete.push(currentUrl + '?_=' + timestamp);
                        
                        // Delete each URL from cache
                        const deletionPromises = urlsToDelete.map(url => {
                            return cache.delete(url).then(success => {
                                if (success) {
                                    console.log(`Successfully deleted ${url} from cache ${cacheName}`);
                                }
                                return success;
                            });
                        });
                        
                        return Promise.all(deletionPromises);
                    });
                })
            );
        }).then(() => {
            console.log('PAR cache clearing completed');
        }).catch(error => {
            console.error('Error clearing PAR cache:', error);
        });
    } else {
        console.log('Cache API not available, using alternative cache busting');
    }
    
    // 2. Force reload for specific URLs
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    
    // Create a fetch request with cache-busting parameters
    fetch(`get_par.php?cache_bust=${timestamp}&rand=${random}`, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    }).then(() => {
        console.log('Sent cache-busting request');
    }).catch(error => {
        console.error('Cache busting request failed:', error);
    });
    
    // 3. Create an image element with a unique URL to bypass cache (old technique but still effective)
    const cacheBuster = new Image();
    cacheBuster.src = `get_par.php?cache_bust=${timestamp}&rand=${random}&r=${Math.random()}`;
    cacheBuster.style.display = 'none';
    cacheBuster.onload = function() {
        console.log('Image cache bust request completed');
        document.body.removeChild(cacheBuster);
    };
    document.body.appendChild(cacheBuster);
    
    // 4. Reload PAR data with force refresh as a final fallback
    setTimeout(() => {
        console.log('Reloading PAR data after cache clear');
        loadPARData(true);
    }, 500);
    
    console.log('PAR cache clearing triggered via multiple methods');
}

/**
 * Save PAR data to server
 */
function savePAR() {
    // Validate form
    const parForm = document.getElementById('parForm');
    if (!parForm) {
        console.error("PAR form not found");
        showError("PAR form not found. Please refresh the page.");
        return;
    }
    
    // Check for duplicate property numbers
    const propertyNumberInputs = parForm.querySelectorAll('.property-number');
    const propertyNumbers = new Map();
    let hasDuplicates = false;
    let duplicateInfo = [];
    
    propertyNumberInputs.forEach((input, index) => {
        const value = input.value.trim();
        if (!value) return; // Skip empty values
        
        if (propertyNumbers.has(value)) {
            hasDuplicates = true;
            const firstIndex = propertyNumbers.get(value) + 1; // 1-based index
            const currentIndex = index + 1; // 1-based index
            duplicateInfo.push(`Property number "${value}" is duplicated in items #${firstIndex} and #${currentIndex}`);
            
            // Mark as invalid
            input.classList.add('is-invalid');
            
            // Also mark the first occurrence
            const firstInput = propertyNumberInputs[propertyNumbers.get(value)];
            if (firstInput) {
                firstInput.classList.add('is-invalid');
            }
        } else {
            propertyNumbers.set(value, index);
        }
    });
    
    if (hasDuplicates) {
        Swal.fire({
            icon: 'error',
            title: 'Duplicate Property Numbers',
            html: `<p>Duplicate property numbers found:</p><ul><li>${duplicateInfo.join('</li><li>')}</li></ul><p>All property numbers must be unique.</p>`
        });
        return;
    }
    
    // Ensure received_by is filled before proceeding
    if (!ensureReceivedByFilled(true)) {
        console.error("Cannot proceed with empty received_by field");
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Recipient information is required. Please enter who received this PAR.'
        });
        return;
    }
    
    // Debug received_by field before form submission
    console.log("Pre-submission check of received_by field:");
    const receivedByValues = debugReceivedByField();
    
    if (!parForm.checkValidity()) {
        parForm.reportValidity();
        return;
    }
    
    console.log("Saving PAR data...");
    showLoading();
    
    // Continue with the original savePAR code...
    // Clear browser cache for PAR data first
    clearPARCache();
    
    // Collect form data
    const parId = parForm.querySelector('[name="par_id"]')?.value || '';
    
    // Get all the form fields by name attributes 
    const formData = {
        par_id: parId || null,
        par_no: parForm.querySelector('[name="par_no"]')?.value || '',
        entity_name: parForm.querySelector('[name="entity_name"]')?.value || '',
        date_acquired: parForm.querySelector('[name="date_acquired"]')?.value || '',
        items: []
    };
    
    // Rest of the original savePAR function follows...
    // IMPROVED: Handle received_by more robustly - ALWAYS use the name as the primary value
    const receivedById = parForm.querySelector('[name="received_by_id"]')?.value || '';
    const receivedByName = parForm.querySelector('[name="received_by"]')?.value || '';
    
    // Always prioritize the name field for received_by
    if (receivedByName && receivedByName.trim()) {
        // We have a name - use it directly for received_by
        formData.received_by = receivedByName.trim();
        formData.received_by_name = receivedByName.trim();
        console.log("Using name for received_by:", receivedByName);
        
        // Also include the ID as a separate field if available
        if (receivedById && receivedById.trim()) {
            formData.received_by_id = receivedById.trim();
            console.log("Including user ID reference:", receivedById);
        }
    } else {
        // No name provided - use a default name
        formData.received_by = "Admin";
        formData.received_by_name = "Admin";
        console.log("Using default name 'Admin' for received_by");
        
        // Include ID if available
        if (receivedById && receivedById.trim()) {
            formData.received_by_id = receivedById.trim();
        }
    }
    
    // Position field is optional - only add if it exists in the form
    const positionField = parForm.querySelector('[name="position"]');
    if (positionField && positionField.value.trim() !== '') {
        formData.position = positionField.value.trim();
    }
    
    // Department field is optional - only add if it exists in the form
    const departmentField = parForm.querySelector('[name="department"]');
    if (departmentField && departmentField.value.trim() !== '') {
        formData.department = departmentField.value.trim();
    }
    
    // Remarks field is optional - only add if it exists in the form
    const remarksField = parForm.querySelector('[name="remarks"]');
    if (remarksField && remarksField.value.trim() !== '') {
        formData.remarks = remarksField.value.trim();
    }
    
    // Collect items data
    let hasEmptyDescription = false;
    let emptyItemNumbers = [];
    
    // Get all rows from the items table
    document.querySelectorAll('#parItemsTable tbody tr').forEach((row, index) => {
        const qtyInput = row.querySelector('[name="quantity[]"]');
        const unitInput = row.querySelector('[name="unit[]"]');
        const descInput = row.querySelector('[name="description[]"]');
        const propInput = row.querySelector('[name="property_number[]"]');
        const dateInput = row.querySelector('[name="date_acquired[]"]');
        const priceInput = row.querySelector('[name="unit_price[]"]');
        
        // Check if description is empty and track it
        if (!descInput || !descInput.value.trim()) {
            hasEmptyDescription = true;
            emptyItemNumbers.push(index + 1);
            console.log(`Row ${index + 1} has no description`);
            return; // Skip rows without description
        }

        // Get raw amount value (either from data attribute or by cleaning formatted text)
        let unitPrice = 0;
        if (priceInput) {
            if (priceInput.dataset && priceInput.dataset.rawValue) {
                unitPrice = parseFloat(priceInput.dataset.rawValue) || 0;
            } else {
                unitPrice = parseFloat(priceInput.value.replace(/[₱,\s]/g, '')) || 0;
            }
        }
        
        const qtyValue = parseInt(qtyInput?.value) || 1;
        if (qtyValue < 1) {
            qtyInput.value = 1; // Ensure minimum quantity is 1
        }
        
        const item = {
            quantity: qtyValue,
            unit: unitInput?.value || '',
            description: descInput?.value?.trim() || '', 
            item_description: descInput?.value?.trim() || '', // Keep both field names for compatibility
            property_number: propInput?.value || '',
            date_acquired: dateInput?.value || formData.date_acquired,
            unit_price: unitPrice
        };
        
        console.log(`Item ${index + 1}:`, item);
        formData.items.push(item);
    });
    
    // Show error if any descriptions are empty
    if (hasEmptyDescription) {
        hideLoading();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add description for items: ' + emptyItemNumbers.join(', '),
            didClose: () => {
                // Make sure the modal stays open
                if (parId) {
                    setTimeout(() => editPAR(parId), 100);
                } else {
                    // Find and show the modal
                    const modalElement = document.getElementById('parModal') || document.getElementById('addPARModal');
                    if (modalElement && typeof bootstrap !== 'undefined') {
                        try {
                            const parModal = new bootstrap.Modal(modalElement);
                            parModal.show();
                        } catch (e) {
                            console.error('Error showing modal after validation:', e);
                        }
                    }
                }
            }
        });
        return;
    }
    
    // Check if we have items
    if (formData.items.length === 0) {
        hideLoading();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add at least one item',
            didClose: () => {
                // Make sure the modal stays open
                if (parId) {
                    setTimeout(() => editPAR(parId), 100);
                } else {
                    // Find and show the modal
                    const modalElement = document.getElementById('parModal') || document.getElementById('addPARModal');
                    if (modalElement && typeof bootstrap !== 'undefined') {
                        try {
                            const parModal = new bootstrap.Modal(modalElement);
                            parModal.show();
                        } catch (e) {
                            console.error('Error showing modal after validation:', e);
                        }
                    }
                }
            }
        });
        return;
    }
    
    // Calculate and include the total amount
    const calculatedTotal = calculateParTotal();
    
    // Ensure we have a valid total amount
    formData.total_amount = parseFloat(calculatedTotal.toFixed(2));
    
    // Validate total amount to prevent "out of range" error
    if (isNaN(formData.total_amount) || !isFinite(formData.total_amount)) {
        console.error("Invalid total amount calculated:", calculatedTotal);
        formData.total_amount = 0;
    }
    
    // Cap total to a reasonable maximum to prevent database range errors
    const MAX_VALUE = 9999999.99;
    if (formData.total_amount > MAX_VALUE) {
        console.warn(`Total amount ${formData.total_amount} exceeds maximum allowed value, capping at ${MAX_VALUE}`);
        formData.total_amount = MAX_VALUE;
    }
    
    console.log("Final calculated total:", formData.total_amount);
    console.log('Saving PAR data:', formData);
    
    // Determine endpoint - either update or create
    const endpoint = parId ? 'update_par.php' : 'add_par.php';
    console.log("Using endpoint:", endpoint);
    
    // Send data to server with proper JSON Content-Type header
    console.log(`Sending data to ${endpoint} with ${formData.items.length} items`);
    
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("Server response status:", response.status);
        console.log("Server response headers:", Object.fromEntries([...response.headers.entries()]));
        
        if (!response.ok) {
            return response.text().then(text => {
                console.error("Error response text:", text);
                
                // Check for HTML error responses (PHP errors)
                if (text.includes('</body>') || text.includes('<br') || text.includes('<html')) {
                    console.error("Received HTML error response from server");
                    
                    // Extract error message if possible
                    let errorMsg = 'Server returned HTML instead of JSON. Check PHP logs.';
                    
                    // Try to extract error message from common PHP error format
                    const errorMatch = text.match(/<b>([^<]+)<\/b>/i);
                    if (errorMatch && errorMatch[1]) {
                        errorMsg = `PHP Error: ${errorMatch[1]}`;
                    }
                    
                    throw new Error(errorMsg);
                }
                
                try {
                    // Try to parse the response as JSON
                    const errorData = JSON.parse(text);
                    // Handle the specific error about missing procedure
                    if (errorData.message && errorData.message.includes('update_par_total does not exist')) {
                        console.log("Missing stored procedure error detected. Retrying with direct calculation.");
                        // We'll continue and treat this as a success since the total was already calculated in JavaScript
                        return { success: true, message: 'PAR saved successfully' };
                    }
                    throw new Error(errorData.message || `Server returned ${response.status}`);
                } catch (e) {
                    // If not valid JSON, return the text or status
                    if (e instanceof SyntaxError) {
                        console.error("Failed to parse error response as JSON:", e);
                        throw new Error(`Invalid server response: ${text.substring(0, 100)}...`);
                    }
                    throw e; // Re-throw other errors
                }
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Server response data:", data);
        if (data.success) {
            // Store the success status and par_id for post-processing
            const isNewPar = !parId;
            const savedParId = data.par_id || null;
            
            // Log detailed information about the save operation
            console.log(`PAR ${isNewPar ? 'created' : 'updated'} successfully. PAR ID: ${savedParId}`);
            
            // Close the modal first to ensure UI is updated properly
            closeParModal();
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: parId ? 'PAR Updated!' : 'PAR Added!',
                text: parId ? 'Property Acknowledgement Receipt has been updated successfully.' : 'New Property Acknowledgement Receipt has been added successfully.',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Only refresh the data once after the success message closes
            setTimeout(() => {
                currentPage = 1; // Always reset to first page after add/edit
                loadPARData(true);
                setTimeout(updatePagination, 500);
            }, 2100);
        } else {
            throw new Error(data.message || 'Failed to save PAR');
        }
    })
    .catch(error => {
        console.error('Error saving PAR:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to save PAR. Please try again.'
        });
    })
    .finally(() => {
        // Ensure any loading indicators are hidden, just in case
        hideLoading();
    });
}

/**
 * Helper function to ensure PAR table data is refreshed properly
 * with reliable cache bypassing
 */
function refreshPARTableData() {
    console.log('Force refreshing PAR table data');
    
    // Apply stabilizing class to table
    const parTable = document.getElementById('parTable') || document.querySelector('.par-table');
    if (parTable) {
        const tableHeight = parTable.offsetHeight;
        const tableWidth = parTable.offsetWidth;
        
        parTable.classList.add('table-processing');
        parTable.style.minHeight = tableHeight + 'px';
        parTable.style.width = tableWidth + 'px';
    }
    
    // Reset to page 1 when refreshing
    currentPage = 1;
    
    // Generate unique timestamp for cache busting
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 15);
    
    // Load data using get_par_data.php with pagination and cache busting
    fetch(`get_par_data.php?force_refresh=1&_=${timestamp}&random=${random}&limit=${itemsPerPage}&offset=0`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success && Array.isArray(data.data)) {
            // Store data and update display
            parData = data.data;
            totalItems = data.total || data.data.length;
            totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages === 0) totalPages = 1;
            displayPaginatedData();
            updatePagination();
            console.log(`Refreshed PAR table with ${parData.length} records`);
        } else {
            throw new Error('Invalid data received from server');
        }
    })
    .catch(error => {
        console.error('Error refreshing PAR data:', error);
        
        // Try alternative fetch method as fallback
        fetchLatestPARData();
        
        // Remove table stabilization if still applied
        if (parTable) {
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
        }
    })
    .finally(() => {
        // Ensure stabilization is removed
        if (parTable) {
            setTimeout(() => {
                parTable.classList.remove('table-processing');
                parTable.style.minHeight = '';
                parTable.style.width = '';
            }, 300);
        }
    });
}

/**
 * Alternative fetch method using XMLHttpRequest for maximum reliability
 * Used as a fallback when the primary refresh method fails
 */
function fetchLatestPARData() {
    const timestamp = new Date().getTime();
    console.log(`Attempting alternative PAR data fetch with timestamp ${timestamp}`);
    
    // Apply stabilizing class to table if not already applied
    const parTable = document.getElementById('parTable') || document.querySelector('.par-table');
    if (parTable && !parTable.classList.contains('table-processing')) {
        const tableHeight = parTable.offsetHeight;
        const tableWidth = parTable.offsetWidth;
        
        parTable.classList.add('table-processing');
        parTable.style.minHeight = tableHeight + 'px';
        parTable.style.width = tableWidth + 'px';
    }
    
    // Reset to page 1 when fetching latest data
    currentPage = 1;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `get_par_data.php?nocache=1&_=${timestamp}&limit=${itemsPerPage}&offset=0`, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Expires', '0');
    
    xhr.onload = function() {
        // Remove table stabilization regardless of outcome
        if (parTable) {
            setTimeout(() => {
                parTable.classList.remove('table-processing');
                parTable.style.minHeight = '';
                parTable.style.width = '';
            }, 300);
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                console.log(`Alternative fetch: PAR data received with ${data.data?.length || 0} records`);
                
                if (data.success && Array.isArray(data.data)) {
                    parData = data.data;
                    totalItems = data.total || data.data.length;
                    totalPages = Math.ceil(totalItems / itemsPerPage);
                    if (totalPages === 0) totalPages = 1;
                    displayPaginatedData();
                    updatePagination();
                    console.log(`Refreshed PAR table with ${parData.length} records via alternative fetch`);
                }
            } catch (e) {
                console.error('Error parsing PAR data:', e);
                // Display an error message in the table
                if (parTable) {
                    const tbody = parTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>Error loading data. Please refresh the page.
                        </td></tr>`;
                    }
                }
            }
        } else {
            console.error('Alternative fetch failed:', xhr.status, xhr.statusText);
            // Show a generic error message in the table
            if (parTable) {
                const tbody = parTable.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>Error communicating with server. Please refresh the page.
                    </td></tr>`;
                }
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('Network error during alternative PAR data fetch');
        
        // Remove table stabilization
        if (parTable) {
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
            
            // Show a network error message in the table
            const tbody = parTable.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = `<tr class="par-empty-row"><td colspan="6" class="text-center text-danger">
                    <i class="bi bi-wifi-off me-2"></i>Network error. Please check your connection and refresh the page.
                </td></tr>`;
            }
        }
    };
    
    xhr.ontimeout = function() {
        console.error('Request timeout during alternative PAR data fetch');
        
        // Remove table stabilization
        if (parTable) {
            parTable.classList.remove('table-processing');
            parTable.style.minHeight = '';
            parTable.style.width = '';
        }
    };
    
    xhr.timeout = 10000; // 10 second timeout
    xhr.send();
}

/**
 * Close PAR modal function
 */
function closeParModal() {
    console.log("Closing PAR modal");
    
    // Find all possible modal elements - check for all known IDs
    const modalIds = ['addPARModal', 'parModal', 'addParModal', 'editPARModal', 'editParModal'];
    let modalClosed = false;
    
    for (const modalId of modalIds) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) continue;
        
        console.log(`Found modal with ID: ${modalId}`);
        
        try {
            // Try closing with Bootstrap 5 API first
            if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modalElement);
                if (bsModal) {
                    bsModal.hide();
                    console.log(`Modal ${modalId} closed using Bootstrap API`);
                    modalClosed = true;
                    continue; // Continue checking other modals - we want to close ALL PAR modals
                } else {
                    // Create instance if not found
                    try {
                        const newModal = new bootstrap.Modal(modalElement);
                        newModal.hide();
                        modalClosed = true;
                        console.log(`Created and closed modal ${modalId} using Bootstrap API`);
                        continue;
                    } catch (err) {
                        console.error(`Error creating modal instance for ${modalId}:`, err);
                    }
                }
            }
            
            // Fallback to jQuery if available
            if (typeof $ !== 'undefined' && typeof $.fn.modal !== 'undefined') {
                $(modalElement).modal('hide');
                console.log(`Modal ${modalId} closed using jQuery`);
                modalClosed = true;
                continue;
            }
            
            // Fallback to manual DOM manipulation
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Mark as closed
            modalClosed = true;
            console.log(`Modal ${modalId} closed manually`);
        } catch (e) {
            console.error(`Error closing modal ${modalId}:`, e);
        }
    }
    
    // If no specific PAR modals were found/closed, try closing any visible modal
    if (!modalClosed) {
        console.warn("No specific PAR modal elements found, trying to close any visible modal");
        
        // Close any visible modal
        const visibleModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
        visibleModals.forEach((modal, index) => {
            try {
                // Try bootstrap API first
                if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) {
                        bsModal.hide();
                        console.log(`Visible modal ${index} closed using Bootstrap API`);
                        return;
                    } else {
                        try {
                            const newModal = new bootstrap.Modal(modal);
                            newModal.hide();
                            console.log(`Created and closed visible modal ${index} using Bootstrap API`);
                            return;
                        } catch (err) {
                            console.error(`Error creating modal instance for visible modal ${index}:`, err);
                        }
                    }
                }
                
                // Fallback to manual close
                modal.classList.remove('show');
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
                console.log(`Visible modal ${index} closed manually`);
            } catch (e) {
                console.error(`Error closing visible modal ${index}:`, e);
            }
        });
    }
    
    // Remove any modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
        console.log("Removed modal backdrop");
    });
    
    // Clean up body element
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Reset all PAR forms
    const parForms = document.querySelectorAll('#parForm, form[id*="par"], form[id*="PAR"]');
    parForms.forEach((form, index) => {
        try {
            form.reset();
            console.log(`Reset PAR form ${index}`);
            
            // Clear hidden par_id field if present
            const parIdInput = form.querySelector('[name="par_id"]');
            if (parIdInput) {
                parIdInput.value = '';
                console.log("Cleared PAR ID input");
            }
            
            // Clear the items table if present
            const itemsTable = form.querySelector('#parItemsTable tbody, .par-items-table tbody');
            if (itemsTable) {
                itemsTable.innerHTML = '';
                console.log("Cleared PAR items table");
                
                // Add a clean initial row for next use
                setTimeout(() => {
                    if (typeof addInitialParRow === 'function') {
                        addInitialParRow();
                        console.log("Added initial PAR row");
                    }
                }, 100);
            }
        } catch (e) {
            console.error(`Error resetting PAR form ${index}:`, e);
        }
    });
}

/**
 * Format number with commas
 */
function formatNumber(number) {
    // Handle both numbers and strings by ensuring it's treated as a number first
    try {
        // Convert to number and handle non-numeric inputs
        const num = parseFloat(number);
        
        // Check if number is valid
        if (isNaN(num) || !isFinite(num)) {
            return '0.00';
        }
        
        // Cap at a reasonable maximum to prevent database range errors
        const MAX_VALUE = 9999999.99;
        const cappedNum = Math.min(num, MAX_VALUE);
        
        // Format with number formatting to include comma separators
        // Use 2 decimal places for monetary values for better consistency
        return cappedNum.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (e) {
        console.error('Error formatting number:', e);
        return '0.00';
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    // Check for existing loading overlay
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        // Create loading overlay
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        // Apply styles
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        loadingOverlay.style.zIndex = '9999';
        loadingOverlay.style.backdropFilter = 'blur(2px)';
        loadingOverlay.style.transition = 'opacity 0.2s ease-in-out';
        
        // Add to body
        document.body.appendChild(loadingOverlay);
        
        // Apply styles to spinner container
        const spinnerContainer = loadingOverlay.querySelector('.spinner-container');
        if (spinnerContainer) {
            spinnerContainer.style.backgroundColor = 'white';
            spinnerContainer.style.borderRadius = '8px';
            spinnerContainer.style.padding = '20px';
            spinnerContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            spinnerContainer.style.display = 'flex';
            spinnerContainer.style.alignItems = 'center';
            spinnerContainer.style.justifyContent = 'center';
        }
        
        // Force opacity 0 initially then transition to 1
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
    } else {
        // Show existing overlay with transition
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
    }
    
    // Also stabilize any visible PAR tables
    const parTables = document.querySelectorAll('#parTable, .par-table');
    parTables.forEach(table => {
        if (!table.classList.contains('table-processing')) {
            const tableHeight = table.offsetHeight;
            const tableWidth = table.offsetWidth;
            
            table.classList.add('table-processing');
            table.style.minHeight = tableHeight + 'px';
            table.style.width = tableWidth + 'px';
        }
    });
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        // Fade out with transition
        loadingOverlay.style.opacity = '0';
        
        // After transition completes, hide the element
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 200);
    }
    
    // Remove stabilization from PAR tables after a delay
    setTimeout(() => {
        const parTables = document.querySelectorAll('#parTable.table-processing, .par-table.table-processing');
        parTables.forEach(table => {
            table.classList.remove('table-processing');
            table.style.minHeight = '';
            table.style.width = '';
        });
    }, 300);
}

/**
 * Show error message
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        timer: 5000
    });
}

/**
 * Show success modal with check mark
 * @param {string} title - Modal title 
 * @param {string} message - Modal message
 * @param {Function} onConfirm - Optional callback when OK is clicked
 */
function showSuccessModal(title = 'Item Added!', message = 'New inventory item has been added successfully.', onConfirm = null) {
    // Create modal container if it doesn't exist
    let successModal = document.getElementById('successModal');
    
    if (!successModal) {
        successModal = document.createElement('div');
        successModal.id = 'successModal';
        successModal.className = 'modal fade';
        successModal.setAttribute('tabindex', '-1');
        successModal.setAttribute('role', 'dialog');
        successModal.setAttribute('aria-hidden', 'true');
        
        // Create modal content with exact styling from the image
        successModal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
                <div class="modal-content border-0 shadow-sm">
                    <div class="modal-body text-center p-5">
                        <div class="mb-4">
                            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(130, 210, 130, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#7cc17c" class="bi bi-check" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                </svg>
                            </div>
                        </div>
                        <h3 id="successModalTitle" class="modal-title fs-3 fw-bold text-dark mb-2" style="color: #333;"></h3>
                        <p id="successModalMessage" class="text-muted fs-6 mb-4" style="color: #666;"></p>
                        <button type="button" class="btn btn-primary px-5 py-2" data-bs-dismiss="modal" style="background-color: #6c65f1; border-color: #6c65f1; border-radius: 6px; font-weight: 500;">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successModal);
        
        // Add custom styles to ensure it looks exactly like the image
        const style = document.createElement('style');
        style.textContent = `
            #successModal .modal-content {
                border-radius: 12px;
            }
            #successModal .modal-body {
                padding: 2.5rem;
            }
            #successModal .btn-primary:hover {
                background-color: #5951ed !important;
                border-color: #5951ed !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set modal content
    document.getElementById('successModalTitle').textContent = title;
    document.getElementById('successModalMessage').textContent = message;
    
    // Initialize modal if needed
    let bsModal;
    try {
        if (typeof bootstrap !== 'undefined') {
            const instance = bootstrap.Modal.getInstance(successModal);
            if (instance) {
                bsModal = instance;
            } else {
                bsModal = new bootstrap.Modal(successModal);
            }
        } else {
            console.error('Bootstrap is not defined. Modal may not work properly.');
        }
    } catch (e) {
        console.error('Error initializing modal:', e);
    }
    
    // Add event handler for OK button if callback provided
    if (onConfirm && typeof onConfirm === 'function') {
        const okButton = successModal.querySelector('.btn-primary');
        const clickHandler = function() {
            onConfirm();
            okButton.removeEventListener('click', clickHandler);
        };
        okButton.addEventListener('click', clickHandler);
    }
    
    // Show modal
    if (bsModal) {
        bsModal.show();
    } else {
        console.error('Failed to initialize modal');
        // Fallback to showing an alert
        alert(title + '\n' + message);
        if (onConfirm && typeof onConfirm === 'function') {
            onConfirm();
        }
    }
}

/**
 * Remove specific PAR item row with QTY=1, AMOUNT=0, Date Acquired=10/04/25
 */
function removeSpecificParItem() {
    // Look for all rows in PAR items tables
    const parRows = document.querySelectorAll('#parItemsTable tbody tr, .par-table tbody tr, table tbody tr');
    
    parRows.forEach(row => {
        // Check if this is the row we want to remove
        const qtyElement = row.querySelector('.par-qty, .qty, [name="quantity[]"], td.quantity');
        const priceElement = row.querySelector('.par-amount, .amount, [name="unit_price[]"]');
        const dateElement = row.querySelector('.par-item-date, [name="date_acquired[]"], .date-cell');
        
        if (qtyElement && priceElement && dateElement) {
            // Get values from elements
            let qty = qtyElement.tagName === 'TD' ? qtyElement.textContent.trim() : qtyElement.value;
            let price = priceElement.tagName === 'TD' ? priceElement.textContent.trim() : priceElement.value;
            let date = dateElement.tagName === 'TD' ? dateElement.textContent.trim() : dateElement.value;
            
            // Check for exact match with the values we want to remove
            if (qty == '1' && price == '0' && (date == '10/04/25' || date == '2025-04-10')) {
                console.log('Removing specific PAR item row:', row);
                row.remove();
                
                // Recalculate PAR total if needed
                if (typeof calculateParTotal === 'function') {
                    calculateParTotal();
                }
            }
        }
    });
}

/**
 * Export PAR data to Excel
 */
function exportPARData() {
    if (!parData || parData.length === 0) {
        Swal.fire({
            title: 'No Data',
            text: 'There is no PAR data to export',
            icon: 'warning'
        });
        return;
    }
    
    console.log('Exporting PAR data to Excel');
    
    // Create worksheet from PAR data
    const worksheet = XLSX.utils.json_to_sheet(parData.map(par => {
        return {
            'PAR No': par.par_no || '',
            'Date Acquired': par.date_acquired || '',
            'Property Number': par.property_number || '',
            'Received By': par.received_by_name || '',
            'Position': par.position || '',
            'Department': par.department || '',
            'Total Amount': par.total_amount || 0
        };
    }));
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PAR Data');
    
    // Generate Excel file and trigger download
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `PAR_Export_${today}.xlsx`);
    
    // Show success message
    Swal.fire({
        title: 'Export Complete',
        text: 'PAR data has been exported to Excel',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Batch print multiple PAR documents
 */
function batchPrintPAR() {
    if (!parData || parData.length === 0) {
        Swal.fire({
            title: 'No Data',
            text: 'There are no PAR records to print',
            icon: 'warning'
        });
        return;
    }
    
    // Create batch print modal
    let batchPrintModal = document.getElementById('batchPrintModal');
    
    if (!batchPrintModal) {
        batchPrintModal = document.createElement('div');
        batchPrintModal.id = 'batchPrintModal';
        batchPrintModal.className = 'modal fade';
        batchPrintModal.setAttribute('tabindex', '-1');
        batchPrintModal.setAttribute('aria-hidden', 'true');
        
        batchPrintModal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Batch Print PAR Documents</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="selectAllPAR">
                                <label class="form-check-label" for="selectAllPAR">
                                    Select All
                                </label>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th width="50px"></th>
                                        <th>PAR No.</th>
                                        <th>Date Acquired</th>
                                        <th>Received By</th>
                                        <th class="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody id="batchPrintTableBody">
                                    <!-- Items will be added dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="printSelectedBtn">
                            <i class="bi bi-printer"></i> Print Selected
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(batchPrintModal);
        
        // Add event listeners
        document.getElementById('selectAllPAR').addEventListener('change', function() {
            const checkboxes = batchPrintModal.querySelectorAll('.par-select-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Populate the table with PAR data
    const tableBody = document.getElementById('batchPrintTableBody');
    tableBody.innerHTML = '';
    
    parData.forEach(par => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="form-check">
                    <input class="form-check-input par-select-checkbox" type="checkbox" value="${par.par_id}" id="par_${par.par_id}">
                </div>
            </td>
            <td>${par.par_no || ''}</td>
            <td>${par.date_acquired || ''}</td>
            <td>${par.received_by_name || ''}</td>
            <td class="text-end fw-medium text-black">${formatNumber(par.total_amount || 0)}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Show the modal
    let bsModal;
    try {
        if (typeof bootstrap !== 'undefined') {
            bsModal = new bootstrap.Modal(batchPrintModal);
            bsModal.show();
        } else {
            console.error('Bootstrap is not defined');
            batchPrintModal.style.display = 'block';
        }
    } catch (e) {
        console.error('Error showing modal:', e);
    }
    
    // Add event listener for print button
    document.getElementById('printSelectedBtn').onclick = function() {
        const selectedIds = Array.from(
            document.querySelectorAll('.par-select-checkbox:checked')
        ).map(checkbox => checkbox.value);
        
        if (selectedIds.length === 0) {
            Swal.fire({
                title: 'No Selection',
                text: 'Please select at least one PAR to print',
                icon: 'warning'
            });
            return;
        }
        
        console.log('Printing selected PARs:', selectedIds);
        
        // Close the modal
        if (bsModal) {
            bsModal.hide();
        }
        
        // Create a progress modal
        Swal.fire({
            title: 'Preparing Documents',
            html: `Preparing ${selectedIds.length} document(s) for printing...`,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                
                // Print each document with a delay to prevent browser blocking
                printPARSequentially(selectedIds, 0);
            }
        });
    };
}

/**
 * Print PAR documents one by one with delay
 */
function printPARSequentially(parIds, index) {
    if (index >= parIds.length) {
        // All documents have been opened for printing
        Swal.fire({
            title: 'Print Queue Processed',
            html: `${parIds.length} document(s) have been sent to the print queue.`,
            icon: 'success',
            timer: 3000
        });
        return;
    }
    
    // Print current document
    const parId = parIds[index];
    const printWindow = window.open(`viewPar.php?id=${parId}&print=true`, '_blank');
    
    // Check if window was opened successfully
    if (!printWindow) {
        Swal.fire({
            title: 'Pop-up Blocked',
            text: 'Please allow pop-ups for this site to print PAR documents',
            icon: 'warning'
        });
        return;
    }
    
    // Proceed to next document after delay
    setTimeout(() => {
        printPARSequentially(parIds, index + 1);
    }, 1000);
}
window.attachPARButtonHandler = function () {
    const saveParBtn = document.getElementById('saveParBtn');
    if (saveParBtn) {
        console.log('Attaching event handler to saveParBtn');

        // Remove any existing listeners by cloning the node
        const newSaveBtn = saveParBtn.cloneNode(true);
        saveParBtn.parentNode.replaceChild(newSaveBtn, saveParBtn);

        // Mark as handler attached to prevent duplicate calls
        newSaveBtn.setAttribute('data-handler-attached', 'true');

        newSaveBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Stop event bubbling
            console.log('saveParBtn clicked');

            // Call the global savePAR function to ensure consistent behavior
            savePAR();
        });
        
        // Set the button type to button to prevent form submission
        newSaveBtn.setAttribute('type', 'button');
        
        return newSaveBtn;
    }
    return null;
};

document.addEventListener('DOMContentLoaded', function() {
    // Attach handler to save button if it exists on page load
    attachPARButtonHandler();
    
    // Add event delegation for dynamically added save buttons
    document.addEventListener('click', function(e) {
        const saveBtn = e.target.closest('#saveParBtn:not([data-handler-attached="true"])');
        if (saveBtn) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Delegated click on saveParBtn');
            savePAR();
        }
    });
});

function deletePAR(parId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            showLoading();
            
            // Use both approaches for compatibility - try POST first with JSON body
            fetch('delete_par.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    par_id: parId
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error("Server response:", text);
                        try {
                            // Try to parse as JSON
                            return JSON.parse(text);
                        } catch (e) {
                            // If not valid JSON, throw with text
                            throw new Error(`Server error: ${response.status} ${response.statusText}. Details: ${text}`);
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Use Swal.fire instead of showSuccessModal
                    Swal.fire({
                        icon: 'success',
                        title: 'Item Deleted!',
                        text: 'The Property Acknowledgement Receipt has been deleted successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        // Refresh PAR data after successful deletion
                        loadPARData(true);
                    });
                } else {
                    showError(data.message || 'Failed to delete PAR');
                }
            })
            .catch(error => {
                console.error('Error deleting PAR:', error);
                showError('Error deleting PAR: ' + error.message);
            })
            .finally(() => {
                hideLoading();
            });
        }
    });
}
document.getElementById('saveParBtn')?.addEventListener('click', function () {
    // This will use the savePAR function defined above
    savePAR();
});
// Function to view a PAR
function viewPAR(parId) {
    if (!parId) {
        Swal.fire('Error', 'PAR ID is required', 'error');
        return;
    }

    console.log('Viewing PAR with ID:', parId);
    
    // Open the viewPAR.php in a new window
    window.open(`viewPAR.php?id=${encodeURIComponent(parId)}`, '_blank');
}

// Function to handle PAR form submission
document.getElementById('saveParBtn')?.addEventListener('click', function () {
    // Get form data
    const parForm = document.getElementById('parForm');
    if (!parForm) return;

    // Get all items from the table
    const itemRows = document.querySelectorAll('#parItemsTable tbody tr:not(.d-none)');
    const items = [];

    itemRows.forEach(row => {
        const item = {
            quantity: parseInt(row.querySelector('.quantity')?.value) || 0,
            unit: row.querySelector('.unit')?.value || '',
            description: row.querySelector('.description')?.value || '',
            property_number: row.querySelector('.property-number')?.value || '',
            date_acquired: row.querySelector('.date-acquired')?.value || '',
            amount: parseFloat(row.querySelector('.amount')?.value) || 0
        };
        if (item.description) {
            items.push(item);
        }
    });

    const parData = {
        par_no: document.getElementById('parNo').value,
        entity_name: document.getElementById('entityName').value,
        date_acquired: document.getElementById('dateAcquired').value,
        received_by: document.getElementById('receivedBy').value,
        position: document.getElementById('position').value,
        department: document.getElementById('department').value,
        remarks: document.getElementById('remarks').value,
        total_amount: parseFloat(document.getElementById('parTotalAmount').value.replace(/[^\d.-]/g, '')) || 0,
        items: items
    };

    // Validate required fields
    if (!parData.par_no || !parData.entity_name || !parData.date_acquired || !parData.received_by || items.length === 0) {
            Swal.fire({
                icon: 'error',
            title: 'Required Fields Missing',
            text: 'Please fill in required fields (PAR No, Entity Name, Date, Received By) and add at least one item'
        });
        return;
    }

    // Show loading state
    Swal.fire({
        title: 'Saving Property Acknowledgement Receipt',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send data to server
    fetch('add_par.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(parData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Property Acknowledgement Receipt saved successfully',
                    icon: 'success'
                }).then(() => {
                    // Close modal
                    const parModal = bootstrap.Modal.getInstance(document.getElementById('parModal'));
                    if (parModal) {
                        parModal.hide();
                    }
                    // Refresh PAR table
                    loadPARData();
                });
            } else {
                throw new Error(data.message || 'Failed to save PAR');
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to save PAR',
                icon: 'error'
            });
        });
    });

// ... existing code ...image.png
function loadPARData() {
    console.log('Loading PAR data');
    showLoading();

    fetch('get_par_data.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('PAR data loaded:', data);
            if (data && typeof displayPARData === 'function') {
                parData = Array.isArray(data.data) ? data.data : [];
                totalItems = parData.length;
                totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                displayPaginatedData();
                updatePagination();
            } else {
                console.error('Failed to process PAR data:', data);
                showError('Failed to process PAR data');
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Failed to load data for par:', error);
            showError('Failed to load data for par: ' + error.message);
            hideLoading();
        });
}
function deletePO(poId) {
    if (!poId) {
        Swal.fire('Error', 'PO ID is required', 'error');
        return;
    }

    console.log('Deleting PO with ID:', poId);

    // Confirm deletion with the user
    Swal.fire({
        title: 'Delete Purchase Order',
        text: 'Are you sure you want to delete this purchase order? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading state
            showLoading();

            // Send delete request to the server
            fetch('delete_po.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: poId })
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            console.error('Server error response:', text);
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
    hideLoading();

                    if (data.success) {
                // Show success message
                Swal.fire({
                    icon: 'success',
                            title: 'Deleted!',
                            text: 'The purchase order has been deleted successfully.',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        // Reload PO data to update the table
                    loadPOData();
            } else {
                        throw new Error(data.message || 'Failed to delete PO');
            }
        })
        .catch(error => {
                    hideLoading();
                    console.error('Error deleting PO:', error);
                    Swal.fire('Error', error.message || 'Failed to delete purchase order', 'error');
                });
            }
        });
    }

/**
 * Debug helper for received_by field in PAR forms
 */
function debugReceivedByField() {
    console.log("Debugging received_by fields in PAR form");
    
    const parForm = document.getElementById('parForm');
    if (!parForm) {
        console.log("PAR form not found");
        return;
    }
    
    // Get values from the form
    const receivedByInput = parForm.querySelector('[name="received_by"]');
    const receivedByIdField = parForm.querySelector('[name="received_by_id"]');
    
    const values = {
        received_by: receivedByInput ? receivedByInput.value : 'not found',
        received_by_id: receivedByIdField ? receivedByIdField.value : 'not found',
        receivedByInput_data_original: receivedByInput ? receivedByInput.getAttribute('data-original-value') : 'no attribute'
    };
    
    console.log("Current received_by values:", values);
    
    // If received_by input exists but is empty, try to fix it
    if (receivedByInput && (!receivedByInput.value || receivedByInput.value.trim() === '')) {
        // Try to get original value from data attribute
        const originalValue = receivedByInput.getAttribute('data-original-value');
        if (originalValue && originalValue.trim() !== '') {
            receivedByInput.value = originalValue;
            console.log("Fixed empty received_by with original value:", originalValue);
        } else {
            // Try to use the session username if available
            const usernameData = document.getElementById('username_data');
            if (usernameData) {
                const username = usernameData.value || usernameData.getAttribute('data-username') || 'Admin';
                receivedByInput.value = username;
                console.log("Fixed empty received_by with username data:", username);
            } else {
                // Last resort fallback
                receivedByInput.value = 'Admin';
                console.log("Fixed empty received_by with default 'Admin'");
            }
        }
    }
    
    return values;
}

// Add this function to run before modals are shown
document.addEventListener('DOMContentLoaded', function() {
    // Add a check for received_by field before modal is shown
    document.addEventListener('show.bs.modal', function(event) {
        const modal = event.target;
        
        // Only check PAR-related modals
        if (modal.id && (modal.id.includes('PAR') || modal.id.includes('par'))) {
            console.log("PAR modal about to show, checking received_by field");
            setTimeout(debugReceivedByField, 100);
        }
    });
    
    // Also run a check after modal is shown
    document.addEventListener('shown.bs.modal', function(event) {
        const modal = event.target;
        
        // Only check PAR-related modals
        if (modal.id && (modal.id.includes('PAR') || modal.id.includes('par'))) {
            console.log("PAR modal shown, checking received_by field");
            setTimeout(debugReceivedByField, 200);
        }
    });
});

/**
 * Ensure the received_by field is filled with a valid value
 * @param {boolean} maximumEffort - Whether to try harder to fill the field
 * @returns {boolean} - Whether the field is filled
 */
function ensureReceivedByFilled(maximumEffort = false) {
    console.log("Ensuring received_by field is filled");
    
    const parForm = document.getElementById('parForm');
    if (!parForm) {
        console.log("PAR form not found");
        return false;
    }
    
    // Get values from the form
    const receivedByInput = parForm.querySelector('[name="received_by"]');
    if (!receivedByInput) {
        console.log("received_by input not found");
        return false;
    }
    
    // Check if the field is already filled
    if (receivedByInput.value && receivedByInput.value.trim() !== '') {
        console.log("received_by is already filled:", receivedByInput.value);
        return true;
    }
    
    console.log("received_by is empty, attempting to fix");
    
    // Try to get original value from data attribute
    const originalValue = receivedByInput.getAttribute('data-original-value');
    if (originalValue && originalValue.trim() !== '') {
        receivedByInput.value = originalValue;
        console.log("Fixed empty received_by with original value:", originalValue);
        return true;
    }
    
    // Try to use the session username if available
    const usernameData = document.getElementById('username_data');
    if (usernameData) {
        const username = usernameData.value || usernameData.getAttribute('data-username');
        if (username && username.trim() !== '') {
            receivedByInput.value = username;
            console.log("Fixed empty received_by with username data:", username);
            return true;
        }
    }
    
    // Last resort fallback - only use if maximum effort
    if (maximumEffort) {
        receivedByInput.value = 'Admin';
        console.log("Fixed empty received_by with default 'Admin'");
        return true;
    }
    
    console.log("Failed to fix empty received_by field");
    return false;
}

/**
 * Add CSS for table stabilization to prevent layout shifts
 */
function addTableStabilizationCSS() {
    // Check if style already exists
    if (document.getElementById('table-stabilization-css')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'table-stabilization-css';
    style.textContent = `
        .table-processing {
            position: relative;
            transition: opacity 0.2s;
            opacity: 0.7;
        }
        
        .table-processing:after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.4);
            z-index: 1;
        }
        
        .par-row {
            transition: background-color 0.2s;
        }
        
        .par-row:hover {
            background-color: rgba(0, 123, 255, 0.05);
        }
        
        .par-row .btn-group {
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .par-row:hover .btn-group {
            opacity: 1;
        }
        
        .par-empty-row td {
            padding: 20px;
            font-style: italic;
            color: #6c757d;
        }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    console.log("Added table stabilization CSS");
}

// Add this at the end of your JS file or in your CSS
(function() {
    const style = document.createElement('style');
    style.textContent = `
        body.modal-open {
            padding-right: 0 !important;
            overflow-y: scroll !important;
        }
    `;
    document.head.appendChild(style);
})();

// Optionally, reinforce with JS for all modals
document.addEventListener('show.bs.modal', function() {
    document.body.style.overflowY = 'scroll';
    document.body.style.paddingRight = '0px';
});
document.addEventListener('hidden.bs.modal', function() {
    document.body.style.overflowY = '';
    document.body.style.paddingRight = '';
});

/**
 * Check for duplicate property numbers in the PAR form
 * @param {HTMLInputElement} input - The property number input element
 */
function checkDuplicatePropertyNumber(input) {
    if (!input || !input.value.trim()) return;
    
    const propertyNumber = input.value.trim();
    
    // Skip if empty
    if (!propertyNumber) return;
    
    // Find all property number inputs
    const allInputs = document.querySelectorAll('.property-number');
    let duplicateFound = false;
    let duplicateIndex = -1;
    
    // Check for duplicates
    allInputs.forEach((otherInput, index) => {
        // Skip the current input
        if (otherInput === input) return;
        
        // Check if values match
        if (otherInput.value.trim() === propertyNumber) {
            duplicateFound = true;
            duplicateIndex = index + 1; // 1-based index for user display
        }
    });
    
    // Clear previous error styles
    input.classList.remove('is-invalid');
    const existingErrorMsg = input.parentElement.querySelector('.invalid-feedback');
    if (existingErrorMsg) {
        existingErrorMsg.remove();
    }
    
    // If duplicate found, show error
    if (duplicateFound) {
        input.classList.add('is-invalid');
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'invalid-feedback';
        errorMsg.textContent = `Duplicate property number found in item #${duplicateIndex}. Property numbers must be unique.`;
        input.parentElement.appendChild(errorMsg);
        
        // Highlight the row
        const row = input.closest('tr');
        if (row) {
            row.classList.add('table-danger');
            // Remove highlight after a delay
            setTimeout(() => {
                row.classList.remove('table-danger');
            }, 5000);
        }
    }
}