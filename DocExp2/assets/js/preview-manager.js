export class PreviewManager {
    constructor() {
        this.previewContainer = document.getElementById('pdfPreview');
        this.currentPreviewUrl = null;
    }
    
    async generatePreview(template, formData) {
        try {
            // Clear any previous preview
            this.clearPreview();
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Generate preview HTML
            const previewHtml = this.generatePreviewHtml(template, formData);
            
            // Convert HTML to PDF (in a real application, this would be done server-side)
            const previewUrl = await this.htmlToPdfPreview(previewHtml);
            this.currentPreviewUrl = previewUrl;
            
            // Display the preview
            this.displayPreview(previewUrl);
        } catch (error) {
            console.error('Error generating preview:', error);
            this.showPreviewError();
        }
    }
    
    async generateJsonPreview(template, formData) {
        try {
            // Clear any previous preview
            this.clearPreview();
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Generate preview HTML for JSON template
            const previewHtml = this.generateJsonPreviewHtml(template, formData);
            
            // Convert HTML to PDF preview
            const previewUrl = await this.htmlToPdfPreview(previewHtml);
            this.currentPreviewUrl = previewUrl;
            
            // Display the preview
            this.displayPreview(previewUrl);
        } catch (error) {
            console.error('Error generating JSON preview:', error);
            this.showPreviewError();
        }
    }
    
    clearPreview() {
        this.previewContainer.innerHTML = '';
        
        // Revoke any existing object URLs to prevent memory leaks
        if (this.currentPreviewUrl) {
            URL.revokeObjectURL(this.currentPreviewUrl);
            this.currentPreviewUrl = null;
        }
    }
    
    showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'preview-loader';
        loader.innerHTML = '<p>Generazione anteprima in corso...</p>';
        
        this.previewContainer.appendChild(loader);
    }
    
    generatePreviewHtml(template, formData) {
        // Create a simple HTML representation of the document
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${template.name}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        line-height: 1.6;
                    }
                    .header {
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .document-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                    }
                    .field {
                        margin-bottom: 15px;
                    }
                    .field-label {
                        font-weight: bold;
                    }
                    .field-value {
                        margin-top: 5px;
                    }
                    .footer {
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                        font-size: 0.9em;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="document-title">${template.name}</div>
                </div>
                <div class="content">
        `;
        
        // Add form fields
        template.fields.forEach(field => {
            const value = formData[field.name] || '';
            
            html += `
                <div class="field">
                    <div class="field-label">${field.label}:</div>
                    <div class="field-value">${value}</div>
                </div>
            `;
        });
        
        // Add footer
        html += `
                </div>
                <div class="footer">
                    Documento generato il: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;
        
        return html;
    }
    
    generateJsonPreviewHtml(template, formData) {
        // Create a styled HTML representation of the JSON document
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${template.name}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        line-height: 1.6;
                    }
                    .header {
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .document-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #4a6fa5;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 5px;
                    }
                    .field {
                        margin-bottom: 8px;
                    }
                    .field-label {
                        font-weight: bold;
                        display: inline-block;
                        min-width: 150px;
                    }
                    .field-value {
                        display: inline-block;
                    }
                    .array-container {
                        margin-left: 20px;
                    }
                    .array-item {
                        margin-bottom: 15px;
                        padding: 10px;
                        border-left: 3px solid #ddd;
                        background-color: #f9f9f9;
                    }
                    .footer {
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                        font-size: 0.9em;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="document-title">${template.name}</div>
                </div>
                <div class="content">
        `;
        
        // Generate HTML content for each section of the JSON data
        html += this.renderJsonObject(formData);
        
        // Add footer
        html += `
                </div>
                <div class="footer">
                    Documento generato il: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;
        
        return html;
    }
    
    renderJsonObject(data, level = 0) {
        let html = '';
        const indent = '  '.repeat(level);
        
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                html += `<div class="section">
                    <div class="section-title">${this.formatKey(key)}</div>
                    <div class="array-container">`;
                
                value.forEach((item, index) => {
                    html += `<div class="array-item">
                        <div class="field"><span class="field-label">Item ${index + 1}</span></div>`;
                    
                    if (typeof item === 'object' && item !== null) {
                        html += this.renderJsonObject(item, level + 1);
                    } else {
                        html += `<div class="field"><span class="field-value">${item}</span></div>`;
                    }
                    
                    html += `</div>`;
                });
                
                html += `</div></div>`;
            } else if (typeof value === 'object' && value !== null) {
                html += `<div class="section">
                    <div class="section-title">${this.formatKey(key)}</div>
                    ${this.renderJsonObject(value, level + 1)}
                </div>`;
            } else {
                html += `<div class="field">
                    <span class="field-label">${this.formatKey(key)}:</span>
                    <span class="field-value">${value}</span>
                </div>`;
            }
        }
        
        return html;
    }
    
    formatKey(key) {
        // Convert snake_case or camelCase to Title Case with spaces
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    async htmlToPdfPreview(html) {
        try {
            // In a real application, this would convert HTML to PDF using a library
            // For now, we'll just create an HTML preview that looks like a PDF
            
            // Create a blob of the HTML content
            const blob = new Blob([html], { type: 'text/html' });
            
            // Create an object URL for the blob
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('HTML to PDF conversion failed:', error);
            throw error;
        }
    }
    
    displayPreview(url) {
        // Clear the container
        this.previewContainer.innerHTML = '';
        
        // Create an iframe to display the preview
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.className = 'pdf-preview-iframe';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        
        this.previewContainer.appendChild(iframe);
    }
    
    showPreviewError() {
        this.previewContainer.innerHTML = `
            <div class="preview-error">
                <p>Si è verificato un errore nella generazione dell'anteprima.</p>
                <p>Ricontrolla i dati inseriti e riprova.</p>
            </div>
        `;
    }
}
