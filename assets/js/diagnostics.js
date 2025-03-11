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

function checkTemplateSystem() {
    console.group('Template System Check');
    
    // Check if template list exists
    const templateList = document.getElementById('templateList');
    if (!templateList) {
        console.error('✗ Template list element not found!');
        console.groupEnd();
        return;
    }
    
    console.log(`✓ Template list found with ${templateList.children.length} templates`);
    
    // Check template cards
    const templateCards = templateList.querySelectorAll('.card');
    if (templateCards.length === 0) {
        console.warn('! No template cards found in the template list');
    } else {
        console.log(`✓ Found ${templateCards.length} template cards`);
        
        // Check data attributes on template cards
        templateCards.forEach((card, i) => {
            const id = card.dataset.id;
            const type = card.dataset.type;
            
            if (!id) {
                console.error(`✗ Template card #${i+1} is missing data-id attribute`);
            }
            
            console.log(`Template card #${i+1}: id=${id || 'MISSING'}, type=${type || 'standard'}`);
        });
    }
    
    // Check document form container
    const formContainer = document.querySelector('.document-form-container');
    if (!formContainer) {
        console.error('✗ Document form container not found!');
    } else {
        console.log(`✓ Document form container is ${formContainer.classList.contains('hidden') ? 'hidden' : 'visible'}`);
    }
    
    console.groupEnd();
    
    // Test click on first template if available
    if (templateCards.length > 0) {
        console.log('Testing template selection by simulating click on first template...');
        templateCards[0].click();
    }
}

// Add diagnostics to window for console access
window.diagnostics = {
    checkDomElements,
    testNavigation,
    checkTemplateSystem,
    run: function() {
        checkDomElements();
        testNavigation();
        checkTemplateSystem();
    }
};

console.log('Diagnostics module loaded - use window.diagnostics.run() to check for issues');
