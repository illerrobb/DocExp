/**
 * This file helps diagnose issues with the application
 */

function checkDomElements() {
    const requiredElements = [
        'dashboardBtn', 'createDocBtn', 'createPackageBtn',
        'dashboard', 'createDoc', 'createPackage'
    ];
    
    console.group('DOM Element Check');
    let allFound = true;
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✓ Element "${id}" found`);
        } else {
            console.error(`✗ Element "${id}" NOT found`);
            allFound = false;
        }
    });
    
    if (allFound) {
        console.log('All required DOM elements are present!');
    } else {
        console.error('Some required DOM elements are missing!');
    }
    
    console.groupEnd();
}

function testNavigation() {
    console.group('Navigation Testing');
    
    // Check if views have active classes
    const views = document.querySelectorAll('.view');
    console.log(`Found ${views.length} view elements`);
    
    views.forEach(view => {
        console.log(`View "${view.id}": ${view.classList.contains('active') ? 'active' : 'inactive'}`);
    });
    
    // Check if buttons have correct event listeners
    const buttons = document.querySelectorAll('nav button');
    console.log(`Found ${buttons.length} navigation buttons`);
    
    console.groupEnd();
}

// Add diagnostics to window for console access
window.diagnostics = {
    checkDomElements,
    testNavigation,
    run: function() {
        checkDomElements();
        testNavigation();
    }
};

console.log('Diagnostics module loaded - use window.diagnostics.run() to check for issues');
