import { MilitaryLetterExample, RequestaFerieExample } from './template-samples.js';

export class UIManager {
    constructor() {
        this.activeView = 'dashboard';
        this.notification = null;
        this.currentFormData = {};
    }
    
    showView(viewId) {
        console.log(`Showing view: ${viewId}`);
        
        // Check if the view exists
        const targetView = document.getElementById(viewId);
        if (!targetView) {
            console.error(`View with ID "${viewId}" not found!`);
            return;
        }
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            console.log(`Removed active class from: ${view.id}`);
        });
        
        // Show the selected view
        console.log(`Adding active class to: ${viewId}`);
        targetView.classList.add('active');
        
        // Update active button
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.getElementById(`${viewId}Btn`);
        if (activeButton) {
            console.log(`Setting active button: ${viewId}Btn`);
            activeButton.classList.add('active');
        } else {
            console.warn(`Button with ID "${viewId}Btn" not found!`);
        }
        
        this.activeView = viewId;
    }
    
    renderRecentDocuments(documents) {
        const container = document.getElementById('recentDocuments');
        container.innerHTML = '';
        
        if (documents.length === 0) {
            container.innerHTML = '<p class="empty-message">Nessun documento recente</p>';
            return;
        }
        
        documents.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = doc.id;
            
            card.innerHTML = `
                <h4>${doc.name}</h4>
                <p>Creato il: ${new Date(doc.createdAt).toLocaleString()}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    renderRecentPackages(packages) {
        const container = document.getElementById('recentPackages');
        container.innerHTML = '';
        
        if (packages.length === 0) {
            container.innerHTML = '<p class="empty-message">Nessun pacchetto recente</p>';
            return;
        }
        
        packages.forEach(pkg => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = pkg.id;
            
            card.innerHTML = `
                <h4>${pkg.name}</h4>
                <p>${pkg.description || 'Nessuna descrizione'}</p>
                <p>Documenti: ${pkg.documents.length}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    renderTemplates(templates) {
        const container = document.getElementById('templateList');
        container.innerHTML = '';
        
        if (templates.length === 0) {
            container.innerHTML = '<p class="empty-message">Nessun template disponibile</p>';
            return;
        }
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = template.id;
            
            card.innerHTML = `
                <h4>${template.name}</h4>
                <p>${template.description || 'Nessuna descrizione'}</p>
                <p>Campi: ${template.fields.length}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    generateFormFields(fields) {
        const form = document.getElementById('documentForm');
        form.innerHTML = '';
        
        if (Array.isArray(fields)) {
            // Handle flat fields array
            fields.forEach(field => {
                this._createFormField(form, field);
            });
        } else if (fields.type === 'object' && fields.properties) {
            // Handle JSON schema object
            this._createFormFieldsFromSchema(form, fields, '');
        } else {
            console.error('Formato campi non valido:', fields);
        }
    }
    
    _createFormFieldsFromSchema(container, schema, prefix) {
        if (schema.type === 'object' && schema.properties) {
            // Create a fieldset for this object
            const fieldset = document.createElement('fieldset');
            fieldset.className = 'form-fieldset';
            
            const legend = document.createElement('legend');
            legend.textContent = schema.label || prefix;
            fieldset.appendChild(legend);
            
            // Add all properties
            Object.entries(schema.properties).forEach(([key, propSchema]) => {
                const propPrefix = prefix ? `${prefix}.${key}` : key;
                this._createFormFieldsFromSchema(fieldset, propSchema, propPrefix);
            });
            
            container.appendChild(fieldset);
        } else if (schema.type === 'array') {
            // Create an array container
            const arrayContainer = document.createElement('div');
            arrayContainer.className = 'array-container';
            arrayContainer.dataset.fieldName = prefix;
            
            const arrayHeader = document.createElement('div');
            arrayHeader.className = 'array-header';
            
            const arrayTitle = document.createElement('h4');
            arrayTitle.textContent = schema.label || prefix;
            arrayHeader.appendChild(arrayTitle);
            
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'add-item-btn';
            addButton.textContent = '+ Aggiungi';
            addButton.onclick = () => this._addArrayItem(arrayContainer, schema.item, prefix);
            arrayHeader.appendChild(addButton);
            
            arrayContainer.appendChild(arrayHeader);
            
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'array-items';
            arrayContainer.appendChild(itemsContainer);
            
            // Add minimum number of items
            if (schema.minItems && schema.minItems > 0) {
                for (let i = 0; i < schema.minItems; i++) {
                    this._addArrayItem(arrayContainer, schema.item, prefix);
                }
            }
            
            container.appendChild(arrayContainer);
        } else {
            // Create a simple form field
            this._createFormField(container, {
                name: prefix,
                label: schema.label || prefix,
                type: schema.type || 'text',
                required: schema.required || false,
                placeholder: schema.placeholder
            });
        }
    }
    
    _addArrayItem(arrayContainer, itemSchema, arrayName) {
        const itemsContainer = arrayContainer.querySelector('.array-items');
        
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'array-item';
        
        const itemControls = document.createElement('div');
        itemControls.className = 'item-controls';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-item-btn';
        removeBtn.textContent = 'Rimuovi';
        removeBtn.onclick = () => {
            itemWrapper.remove();
            this.updateDocumentPreview();
        };
        
        itemControls.appendChild(removeBtn);
        itemWrapper.appendChild(itemControls);
        
        // Get existing items count for indexing
        const itemIndex = itemsContainer.children.length;
        
        // Create form fields for this item
        if (itemSchema.type === 'object') {
            Object.entries(itemSchema.properties).forEach(([key, propSchema]) => {
                // Use array notation for field names: arrayName[index].propertyName
                const fieldName = `${arrayName}[${itemIndex}].${key}`;
                this._createFormFieldsFromSchema(itemWrapper, {
                    ...propSchema,
                    label: propSchema.label || key
                }, fieldName);
            });
        } else {
            // Simple value array
            this._createFormField(itemWrapper, {
                name: `${arrayName}[${itemIndex}]`,
                label: itemSchema.label || 'Valore',
                type: itemSchema.type || 'text',
                required: itemSchema.required || false
            });
        }
        
        itemsContainer.appendChild(itemWrapper);
    }
    
    _createFormField(container, field) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.textContent = field.label;
        
        if (field.required) {
            const requiredMark = document.createElement('span');
            requiredMark.className = 'required';
            requiredMark.textContent = ' *';
            label.appendChild(requiredMark);
        }
        
        let input;
        
        switch (field.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.rows = 4;
                break;
            case 'select':
                input = document.createElement('select');
                if (field.options) {
                    field.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.value;
                        optionEl.textContent = option.label;
                        input.appendChild(optionEl);
                    });
                }
                break;
            case 'array':
                // Arrays are handled separately
                return;
            default:
                input = document.createElement('input');
                input.type = field.type || 'text';
        }
        
        input.id = field.name;
        input.name = field.name;
        input.className = 'form-control';
        
        if (field.required) {
            input.required = true;
        }
        
        if (field.placeholder) {
            input.placeholder = field.placeholder;
        }
        
        // Add event for live preview
        input.addEventListener('input', () => {
            this._updateFieldValue(field.name, input.value);
            document.dispatchEvent(new CustomEvent('formDataChanged'));
        });
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        container.appendChild(formGroup);
    }
    
    _updateFieldValue(name, value) {
        // Parse the field name to handle nested objects and arrays
        const parts = name.split(/\.|\[|\]\.?/).filter(Boolean);
        
        let current = this.currentFormData;
        let lastObj = null;
        let lastKey = null;
        let arrayMatch = null;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // Check if this is an array index
            arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            
            if (arrayMatch) {
                // We have an array index notation like "destinatari[0]"
                const arrayName = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                
                if (!current[arrayName]) {
                    current[arrayName] = [];
                }
                
                if (!current[arrayName][index]) {
                    current[arrayName][index] = {};
                }
                
                if (i === parts.length - 1) {
                    current[arrayName][index] = value;
                } else {
                    lastObj = current;
                    lastKey = arrayName;
                    current = current[arrayName][index];
                }
            } else if (i === parts.length - 1) {
                // Last part is the actual field name
                current[part] = value;
            } else {
                // Intermediate object
                if (!current[part]) {
                    current[part] = {};
                }
                lastObj = current;
                lastKey = part;
                current = current[part];
            }
        }
        
        // Return the updated data
        return this.currentFormData;
    }
    
    getFormData() {
        // For complex forms, we use the tracked form data
        if (Object.keys(this.currentFormData).length > 0) {
            return this.currentFormData;
        }
        
        // For simple forms, we use the traditional method
        const form = document.getElementById('documentForm');
        const formData = {};
        
        // Get all inputs, selects, and textareas
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(element => {
            if (element.name) {
                formData[element.name] = element.value;
            }
        });
        
        return formData;
    }
    
    // Method to reset current form data
    resetFormData() {
        this.currentFormData = {};
    }
    
    // Add JSON import functionality
    showJsonImportModal() {
        // Create a modal for JSON import if it doesn't exist
        let importModal = document.getElementById('jsonImportModal');
        
        if (!importModal) {
            importModal = document.createElement('div');
            importModal.id = 'jsonImportModal';
            importModal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            modalContent.innerHTML = `
                <h3>Importa dati JSON</h3>
                <p>Incolla il codice JSON da importare:</p>
                <textarea id="jsonImportText" rows="10" class="json-import-textarea"></textarea>
                <div class="modal-actions">
                    <button id="cancelJsonImport">Annulla</button>
                    <button id="loadExampleJson">Carica Esempio</button>
                    <button id="confirmJsonImport">Importa</button>
                </div>
            `;
            
            importModal.appendChild(modalContent);
            document.body.appendChild(importModal);
            
            // Add event listeners
            document.getElementById('cancelJsonImport').addEventListener('click', () => {
                importModal.style.display = 'none';
            });
            
            document.getElementById('loadExampleJson').addEventListener('click', () => {
                // Determine which template is currently active
                if (window.app && window.app.currentTemplate) {
                    const exampleData = window.app.currentTemplate.name === 'Lettera Militare' 
                        ? MilitaryLetterExample 
                        : RequestaFerieExample;
                    
                    document.getElementById('jsonImportText').value = 
                        JSON.stringify(exampleData, null, 2);
                }
            });
            
            document.getElementById('confirmJsonImport').addEventListener('click', () => {
                this.processJsonImport();
            });
        }
        
        // Show the modal
        importModal.style.display = 'flex';
    }
    
    processJsonImport() {
        const jsonText = document.getElementById('jsonImportText').value.trim();
        
        if (!jsonText) {
            this.showNotification('Inserisci un JSON valido', 'error');
            return;
        }
        
        try {
            const jsonData = JSON.parse(jsonText);
            
            // Populate form with this data
            this.currentFormData = jsonData;
            this.populateFormWithData(jsonData);
            
            // Hide modal
            document.getElementById('jsonImportModal').style.display = 'none';
            
            // Trigger preview update
            document.dispatchEvent(new CustomEvent('formDataChanged'));
            
            this.showNotification('Dati JSON importati con successo', 'success');
        } catch (error) {
            this.showNotification('JSON non valido: ' + error.message, 'error');
        }
    }
    
    populateFormWithData(data, prefix = '') {
        // Iterate through data and set form field values
        Object.entries(data).forEach(([key, value]) => {
            const fieldName = prefix ? `${prefix}.${key}` : key;
            
            if (Array.isArray(value)) {
                // Handle array values
                const arrayContainer = document.querySelector(`.array-container[data-field-name="${key}"]`);
                
                if (arrayContainer) {
                    // Clear existing items except the template
                    const itemsContainer = arrayContainer.querySelector('.array-items');
                    itemsContainer.innerHTML = '';
                    
                    // Add items from data
                    const schema = { item: JSON.parse(arrayContainer.dataset.itemSchema) };
                    value.forEach((item, index) => {
                        // Add item UI
                        const itemContainer = this._addArrayItem(arrayContainer, schema.item, key);
                        
                        // Populate with data
                        if (typeof item === 'object') {
                            this.populateFormWithData(item, `${key}[${index}]`);
                        } else {
                            const input = document.querySelector(`[name="${key}[${index}]"]`);
                            if (input) input.value = item;
                        }
                    });
                }
            } else if (value !== null && typeof value === 'object') {
                // Handle nested objects
                this.populateFormWithData(value, fieldName);
            } else {
                // Handle simple fields
                const input = document.querySelector(`[name="${fieldName}"]`);
                if (input) {
                    input.value = value;
                }
            }
        });
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notification if present
        if (this.notification) {
            document.body.removeChild(this.notification);
        }
        
        // Create notification element
        this.notification = document.createElement('div');
        this.notification.className = `notification ${type}`;
        this.notification.textContent = message;
        
        // Add to body
        document.body.appendChild(this.notification);
        
        // Animate in
        setTimeout(() => {
            this.notification.classList.add('show');
        }, 10);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (this.notification) {
                this.notification.classList.remove('show');
                setTimeout(() => {
                    if (this.notification && this.notification.parentNode) {
                        document.body.removeChild(this.notification);
                        this.notification = null;
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Add this new method to load an example into a form
    loadExampleData(templateType) {
        let exampleData;
        
        switch(templateType) {
            case 'Lettera Militare':
                exampleData = MilitaryLetterExample;
                break;
            case 'Richiesta Ferie':
                exampleData = RequestaFerieExample;
                break;
            default:
                return;
        }
        
        if (exampleData) {
            // Set the data to the form
            this.currentFormData = JSON.parse(JSON.stringify(exampleData)); // Deep clone
            
            // Populate form fields with the example data
            this.populateFormWithData(exampleData);
            
            // Trigger preview update
            document.dispatchEvent(new CustomEvent('formDataChanged'));
            
            this.showNotification('Esempio caricato con successo', 'success');
        }
    }
}
