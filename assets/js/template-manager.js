/**
 * This file manages template creation, including Word file uploads
 */

export class TemplateManager {
    constructor(dbManager) {
        this.dbManager = dbManager;
        this.fields = [];
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Upload template button
        const uploadBtn = document.getElementById('uploadTemplateBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }

        // Cancel upload
        const cancelBtn = document.getElementById('cancelTemplateUpload');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideUploadModal());
        }

        // Add field button
        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => this.addTemplateField());
        }

        // Template upload form
        const form = document.getElementById('uploadTemplateForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processTemplateUpload();
            });
        }

        // Setup file drop area if exists
        const dropArea = document.getElementById('dropArea');
        if (dropArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, this.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => {
                    dropArea.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => {
                    dropArea.classList.remove('drag-over');
                }, false);
            });

            dropArea.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    document.getElementById('templateFile').files = files;
                    this.handleFile(files[0]);
                }
            }, false);
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    showUploadModal() {
        const modal = document.getElementById('uploadTemplateModal');
        if (modal) {
            // Reset form
            document.getElementById('uploadTemplateForm').reset();
            document.getElementById('templateFields').innerHTML = '';
            this.fields = [];
            this.addTemplateField(); // Add one empty field by default
            
            modal.style.display = 'flex';
        }
    }

    hideUploadModal() {
        const modal = document.getElementById('uploadTemplateModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    addTemplateField(fieldData = null) {
        const fieldsContainer = document.getElementById('templateFields');
        const fieldIndex = this.fields.length;
        
        const fieldRow = document.createElement('div');
        fieldRow.className = 'field-row';
        fieldRow.dataset.index = fieldIndex;
        
        fieldRow.innerHTML = `
            <input type="text" name="fieldName${fieldIndex}" placeholder="Nome campo" 
                value="${fieldData?.name || ''}" class="field-name" required>
                
            <input type="text" name="fieldLabel${fieldIndex}" placeholder="Etichetta" 
                value="${fieldData?.label || ''}" class="field-label" required>
                
            <select name="fieldType${fieldIndex}" class="field-type">
                <option value="text" ${fieldData?.type === 'text' ? 'selected' : ''}>Testo</option>
                <option value="textarea" ${fieldData?.type === 'textarea' ? 'selected' : ''}>Area di testo</option>
                <option value="number" ${fieldData?.type === 'number' ? 'selected' : ''}>Numero</option>
                <option value="date" ${fieldData?.type === 'date' ? 'selected' : ''}>Data</option>
                <option value="email" ${fieldData?.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="select" ${fieldData?.type === 'select' ? 'selected' : ''}>Menu a tendina</option>
            </select>
            
            <div class="field-required">
                <input type="checkbox" name="fieldRequired${fieldIndex}" 
                    ${fieldData?.required ? 'checked' : ''}>
                <label>Richiesto</label>
            </div>
            
            <button type="button" class="remove-field">×</button>
        `;
        
        // Add event listener to remove button
        const removeBtn = fieldRow.querySelector('.remove-field');
        removeBtn.addEventListener('click', () => {
            fieldRow.remove();
            this.updateFieldsArray();
        });
        
        fieldsContainer.appendChild(fieldRow);
        
        // Update internal fields array
        if (!fieldData) {
            this.fields.push({
                name: '',
                label: '',
                type: 'text',
                required: false
            });
        } else {
            this.fields[fieldIndex] = fieldData;
        }
    }

    updateFieldsArray() {
        const fieldRows = document.querySelectorAll('.field-row');
        this.fields = [];
        
        fieldRows.forEach((row, index) => {
            row.dataset.index = index;
            
            const nameInput = row.querySelector('.field-name');
            const labelInput = row.querySelector('.field-label');
            const typeSelect = row.querySelector('.field-type');
            const requiredCheckbox = row.querySelector('input[type="checkbox"]');
            
            // Update name attributes to match new index
            nameInput.name = `fieldName${index}`;
            labelInput.name = `fieldLabel${index}`;
            typeSelect.name = `fieldType${index}`;
            requiredCheckbox.name = `fieldRequired${index}`;
            
            this.fields.push({
                name: nameInput.value,
                label: labelInput.value,
                type: typeSelect.value,
                required: requiredCheckbox.checked
            });
        });
    }

    async handleFile(file) {
        if (!file) return;
        
        try {
            // For a real implementation, you would need to parse the Word document
            // For this demo, we'll just display the filename
            console.log(`File selected: ${file.name}`);
            
            // You could extract fields from the Word document here
            // For now, we'll just use the fields defined manually
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }

    async processTemplateUpload() {
        try {
            // Update fields array with latest values
            this.updateFieldsArray();
            
            // Get form data
            const templateName = document.getElementById('templateName').value;
            const templateDescription = document.getElementById('templateDescription').value;
            const templateFile = document.getElementById('templateFile').files[0];
            
            if (!templateName || !templateFile || this.fields.length === 0) {
                alert('Compila tutti i campi obbligatori');
                return;
            }
            
            // Process the Word file
            // In a real implementation, you would analyze the Word document
            // For this demo, we'll just use the manually defined fields
            
            // Create template object
            const templateData = {
                name: templateName,
                description: templateDescription,
                fields: this.fields,
                createdAt: Date.now()
            };
            
            // Save template to database
            const success = await this.dbManager.saveTemplate(templateData);
            
            if (success) {
                // Hide modal and show notification
                this.hideUploadModal();
                if (window.app && window.app.uiManager) {
                    window.app.uiManager.showNotification('Template salvato con successo');
                }
                
                // Reload templates
                if (window.app) {
                    window.app.loadDashboardData();
                }
            } else {
                alert('Errore nel salvataggio del template');
            }
        } catch (error) {
            console.error('Error processing template upload:', error);
            alert('Si è verificato un errore durante il caricamento del template');
        }
    }
}
