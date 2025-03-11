import { DatabaseManager } from './database.js';
import { DocumentManager } from './document-manager.js';
import { UIManager } from './ui-manager.js';
import { PreviewManager } from './preview-manager.js';
import { JsonTemplateManager } from './json-template-manager.js';
import { TemplateManager } from './template-manager.js';

class App {
    constructor() {
        // Initialize managers
        this.dbManager = new DatabaseManager();
        this.documentManager = new DocumentManager();
        this.uiManager = new UIManager();
        this.previewManager = new PreviewManager();
        this.jsonManager = new JsonTemplateManager();
        this.templateManager = new TemplateManager(this.dbManager);
    }
    
    async init() {
        try {
            console.log('Initializing application...');
            
            // Initialize database
            await this.dbManager.initDatabase();
            
            // Initialize JSON templates
            this.jsonManager.initDefaultTemplates();
            
            // Initialize template manager
            this.templateManager.init();
            
            // Load initial data
            await this.loadDashboardData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Application initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
    
    async loadDashboardData() {
        try {
            // Load recent documents
            const recentDocuments = await this.dbManager.getRecentDocuments();
            this.uiManager.renderRecentDocuments(recentDocuments);
            
            // Load recent packages
            const recentPackages = await this.dbManager.getRecentPackages();
            this.uiManager.renderRecentPackages(recentPackages);
            
            // Load available templates
            const templates = await this.dbManager.getAllTemplates();
            this.uiManager.renderTemplates(templates);
            
            // Load JSON templates and display them
            const jsonTemplates = await this.dbManager.getJsonTemplates();
            this.renderJsonTemplates(jsonTemplates);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    renderJsonTemplates(templates) {
        const container = document.getElementById('templateList');
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'card json-template';
            card.dataset.id = template.id;
            card.dataset.type = 'json';
            
            card.innerHTML = `
                <h4>${template.name}</h4>
                <p>${template.description || 'Nessuna descrizione'}</p>
                <span class="template-badge">JSON</span>
            `;
            
            container.appendChild(card);
            console.log(`Added JSON template card: ${template.name}, ID: ${template.id}`);
        });
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation buttons - Direct implementation for debugging
        const dashboardBtn = document.getElementById('dashboardBtn');
        const createDocBtn = document.getElementById('createDocBtn');
        const createPackageBtn = document.getElementById('createPackageBtn');
        
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                console.log('Dashboard button clicked');
                this.uiManager.showView('dashboard');
            });
        } else {
            console.error('Dashboard button not found!');
        }
        
        if (createDocBtn) {
            createDocBtn.addEventListener('click', () => {
                console.log('Create document button clicked');
                this.uiManager.showView('createDoc');
            });
        } else {
            console.error('Create document button not found!');
        }
        
        if (createPackageBtn) {
            createPackageBtn.addEventListener('click', () => {
                console.log('Create package button clicked');
                this.uiManager.showView('createPackage');
            });
        } else {
            console.error('Create package button not found!');
        }
        
        // Template selection - Improved implementation
        const templateList = document.getElementById('templateList');
        if (templateList) {
            console.log('Adding click handler to template list');
            templateList.addEventListener('click', (e) => {
                console.log('Template list clicked');
                const templateCard = e.target.closest('.card');
                if (templateCard) {
                    console.log(`Template card clicked: ${templateCard.dataset.id}, type: ${templateCard.dataset.type || 'standard'}`);
                    
                    if (templateCard.dataset.type === 'json') {
                        this.onJsonTemplateSelected(templateCard.dataset.id);
                    } else {
                        this.onTemplateSelected(templateCard.dataset.id);
                    }
                } else {
                    console.log('Click was not on a template card');
                }
            });
        } else {
            console.error('Template list element not found!');
        }
        
        // Document form handling
        document.getElementById('documentForm').addEventListener('input', () => {
            this.updateDocumentPreview();
        });

        // Listen for form data changes (for complex JSON forms)
        document.addEventListener('formDataChanged', () => {
            this.updateDocumentPreview();
        });
        
        // Save progress
        document.getElementById('saveProgress').addEventListener('click', () => {
            this.saveDocumentProgress();
        });
        
        // Export document
        document.getElementById('exportDoc').addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'flex';
        });
        
        // Modal actions
        document.getElementById('cancelExport').addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'none';
        });
        
        document.getElementById('confirmExport').addEventListener('click', () => {
            this.exportDocument();
        });
        
        // JSON import/export and example buttons
        document.getElementById('importJsonBtn').addEventListener('click', () => {
            this.uiManager.showJsonImportModal();
        });

        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportJsonData();
        });
        
        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            if (this.currentTemplate && this.templateType === 'json') {
                this.uiManager.loadExampleData(this.currentTemplate.name);
            }
        });
        
        // Package creation
        document.getElementById('documentsForPackage').addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                card.classList.toggle('selected');
            }
        });
        
        document.getElementById('savePackage').addEventListener('click', (e) => {
            e.preventDefault();
            this.savePackage();
        });
    }
    
    async onTemplateSelected(templateId) {
        console.log(`Standard template selected: ${templateId}`);
        try {
            const template = await this.dbManager.getTemplateById(templateId);
            console.log('Template data retrieved:', template);
            
            if (template) {
                this.currentTemplate = template;
                this.templateType = 'standard';
                
                // Reset form data
                this.uiManager.resetFormData();
                
                // Generate form fields based on template
                this.uiManager.generateFormFields(template.fields);
                
                // Show form container and relevant buttons
                const formContainer = document.querySelector('.document-form-container');
                if (formContainer) {
                    console.log('Showing document form container');
                    formContainer.classList.remove('hidden');
                } else {
                    console.error('Document form container not found!');
                }
                
                document.getElementById('importJsonBtn').style.display = 'none';
                document.getElementById('exportJsonBtn').style.display = 'none';
                document.getElementById('loadExampleBtn').style.display = 'none';
                
                // Initialize preview
                this.updateDocumentPreview();
            } else {
                console.error(`Template with ID ${templateId} not found`);
                this.uiManager.showNotification('Template non trovato', 'error');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            this.uiManager.showNotification('Errore nel caricamento del template', 'error');
        }
    }
    
    async onJsonTemplateSelected(templateId) {
        console.log(`JSON template selected: ${templateId}`);
        try {
            const template = await this.dbManager.getJsonTemplateById(templateId);
            console.log('JSON template data retrieved:', template);
            
            if (template) {
                this.currentTemplate = template;
                this.templateType = 'json';
                
                // Reset form data
                this.uiManager.resetFormData();
                
                // Generate form fields based on JSON schema
                this.uiManager.generateFormFields(template.schema);
                
                // Show form container and JSON buttons
                const formContainer = document.querySelector('.document-form-container');
                if (formContainer) {
                    console.log('Showing document form container');
                    formContainer.classList.remove('hidden');
                } else {
                    console.error('Document form container not found!');
                }
                
                document.getElementById('importJsonBtn').style.display = 'inline-block';
                document.getElementById('exportJsonBtn').style.display = 'inline-block';
                document.getElementById('loadExampleBtn').style.display = 'inline-block';
                
                // Initialize preview
                this.updateDocumentPreview();
            } else {
                console.error(`JSON template with ID ${templateId} not found`);
                this.uiManager.showNotification('Template JSON non trovato', 'error');
            }
        } catch (error) {
            console.error('Error loading JSON template:', error);
            this.uiManager.showNotification('Errore nel caricamento del template JSON', 'error');
        }
    }
    
    updateDocumentPreview() {
        if (!this.currentTemplate) return;
        
        // Get values from form
        const formData = this.uiManager.getFormData();
        
        // Generate preview
        if (this.templateType === 'json') {
            this.previewManager.generateJsonPreview(this.currentTemplate, formData);
        } else {
            this.previewManager.generatePreview(this.currentTemplate, formData);
        }
    }
    
    async saveDocumentProgress() {
        if (!this.currentTemplate) return;
        
        try {
            const formData = this.uiManager.getFormData();
            const saveData = {
                templateId: this.currentTemplate.id,
                data: formData,
                timestamp: Date.now(),
                name: `Bozza - ${this.currentTemplate.name} ${new Date().toLocaleString()}`
            };
            
            await this.dbManager.saveDocumentProgress(saveData);
            this.uiManager.showNotification('Progresso salvato con successo');
            
            // Refresh dashboard data
            this.loadDashboardData();
        } catch (error) {
            console.error('Failed to save progress:', error);
            this.uiManager.showNotification('Errore nel salvataggio', 'error');
        }
    }
    
    exportJsonData() {
        if (!this.currentTemplate || this.templateType !== 'json') return;
        
        try {
            const formData = this.uiManager.getFormData();
            const jsonString = JSON.stringify(formData, null, 2);
            
            // Create a download link for the JSON data
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentTemplate.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.uiManager.showNotification('JSON esportato con successo');
        } catch (error) {
            console.error('Failed to export JSON:', error);
            this.uiManager.showNotification('Errore nell\'esportazione del JSON', 'error');
        }
    }
    
    async exportDocument() {
        if (!this.currentTemplate) return;
        
        try {
            const folderSelect = document.getElementById('folderSelect');
            if (!folderSelect.files.length) {
                this.uiManager.showNotification('Seleziona una cartella di destinazione', 'error');
                return;
            }
            
            const outputPath = folderSelect.files[0].path;
            const formData = this.uiManager.getFormData();
            
            if (this.templateType === 'json') {
                await this.documentManager.exportJsonDocument(this.currentTemplate, formData, outputPath);
            } else {
                await this.documentManager.exportDocument(this.currentTemplate, formData, outputPath);
            }
            
            document.getElementById('exportModal').style.display = 'none';
            this.uiManager.showNotification('Documento esportato con successo');
        } catch (error) {
            console.error('Failed to export document:', error);
            this.uiManager.showNotification('Errore nell\'esportazione del documento', 'error');
        }
    }
    
    async savePackage() {
        try {
            const packageName = document.getElementById('packageName').value;
            const packageDescription = document.getElementById('packageDescription').value;
            
            if (!packageName) {
                this.uiManager.showNotification('Inserisci un nome per il pacchetto', 'error');
                return;
            }
            
            const selectedDocumentElements = document.querySelectorAll('#documentsForPackage .card.selected');
            if (selectedDocumentElements.length === 0) {
                this.uiManager.showNotification('Seleziona almeno un documento', 'error');
                return;
            }
            
            const selectedDocuments = Array.from(selectedDocumentElements).map(el => el.dataset.id);
            
            const packageData = {
                name: packageName,
                description: packageDescription,
                documents: selectedDocuments,
                createdAt: Date.now()
            };
            
            await this.dbManager.savePackage(packageData);
            this.uiManager.showNotification('Pacchetto salvato con successo');
            
            // Reset form and refresh data
            document.getElementById('packageForm').reset();
            document.querySelectorAll('#documentsForPackage .card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            
            this.loadDashboardData();
            this.uiManager.showView('dashboard');
        } catch (error) {
            console.error('Failed to save package:', error);
            this.uiManager.showNotification('Errore nel salvataggio del pacchetto', 'error');
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    window.app = new App();
    window.app.init().then(() => {
        console.log('App initialization completed');
    }).catch(err => {
        console.error('Error during app initialization:', err);
    });
});

// Add a fallback for older browsers or if something goes wrong with DOMContentLoaded
window.onload = function() {
    console.log('Window loaded');
    if (!window.app) {
        console.log('App not initialized via DOMContentLoaded, initializing now');
        window.app = new App();
        window.app.init().catch(err => {
            console.error('Error during fallback app initialization:', err);
        });
    }
};
