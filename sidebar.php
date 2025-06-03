<!-- Sidebar -->
<div class="sidebar">
    <div class="sidebar-header">
        <img src="kalbo.png" alt="Logo">
        <div class="logo-text">
            <i class="bi bi-laptop"></i> 187 -RAP
        </div>
    </div>
    <ul class="nav flex-column">
        <li class="nav-item">
            <a class="nav-link active" href="#dashboard" id="dashboard-link" onclick="updateURL('dashboard')">
                <i class="bi bi-speedometer2"></i> <span>Dashboard</span>
            </a>
        </li>       
        <li class="nav-item">
            <a class="nav-link" href="#inventory" id="inventory-link" onclick="updateURL('inventory')">
                <i class="bi bi-box-seam"></i> <span>Inventory</span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#po" id="po-link" onclick="updateURL('po')">
                <i class="bi bi-cart3"></i> <span>PO</span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#par" id="par-link" onclick="updateURL('par')">
                <i class="bi bi-receipt"></i> <span>PAR</span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#received" id="received-link" onclick="updateURL('received')">
                <i class="bi bi-box-seam"></i> <span>Received</span>
            </a>    
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#reports" id="Reports-link" onclick="updateURL('reports')">
                <i class="bi bi-file-earmark-bar-graph"></i> <span>Reports</span>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#users" id="users-link" onclick="updateURL('users')">
                <i class="bi bi-people"></i> <span>User</span>
            </a>
        </li>
        <li class="nav-item mt-5">
            <a class="nav-link" href="logout.php">
                <i class="bi bi-box-arrow-left"></i> <span>Logout</span>
            </a>
        </li>
    </ul>
</div> 