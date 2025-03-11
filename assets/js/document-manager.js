export class DocumentManager {
    constructor() {
        // Initialize the Python service for document generation
        this.pythonService = {
            url: 'http://localhost:5000', // Default to local Flask server
            initialized: false
        };
        
        this.initializePythonService();
    }
    
    async initializePythonService() {
        try {
            const response = await fetch(`${this.pythonService.url}/status`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ready') {
                    this.pythonService.initialized = true;
                    console.log("Python document service is ready");
                    return true;
                }
            }
            
            console.warn("Python document service not available. Using fallback method.");
            return false;
        } catch (error) {
            console.error("Failed to connect to Python service:", error);
            console.warn("Using fallback document generation method.");
            return false;
        }
    }
    
    async exportDocument(template, formData, outputPath) {
        try {
            // First check if we can use the Python service
            if (this.pythonService.initialized) {
                return await this.exportDocumentViaPython(template, formData, outputPath);
            } else {
                // Fallback to client-side generation
                return await this.exportDocumentClientSide(template, formData, outputPath);
            }
        } catch (error) {
            console.error('Error exporting document:', error);
            throw error;
        }
    }
    
    async exportDocumentViaPython(template, formData, outputPath) {
        try {
            const response = await fetch(`${this.pythonService.url}/generate-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    template: template,
                    data: formData,
                    outputPath: outputPath
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate document on server');
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Server-side document generation failed:', error);
            // Try the fallback method
            return await this.exportDocumentClientSide(template, formData, outputPath);
        }
    }
    
    async exportDocumentClientSide(template, formData, outputPath) {
        try {
            // In a real application, this would use a library to generate documents
            // For now, we'll simulate the document creation
            
            console.log(`Generating document for template: ${template.name}`);
            console.log('Form data:', formData);
            console.log(`Output path: ${outputPath}`);
            
            // Simulate document creation delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create a blob that simulates a Word document
            const docContent = this.generateWordDocContent(template, formData);
            const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            // In a real application, we would use the File System Access API
            // or other methods to save the file to the specified path
            // For now, we'll just trigger a download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Client-side document generation failed:', error);
            throw error;
        }
    }
    
    generateWordDocContent(template, formData) {
        // This is a simplified simulation of a Word document
        // In a real application, we'd use a library like docx-templates
        
        let content = `${template.name}\n\n`;
        
        // Add form data
        Object.entries(formData).forEach(([key, value]) => {
            // Find the field label
            const field = template.fields.find(f => f.name === key);
            const label = field ? field.label : key;
            
            content += `${label}: ${value}\n`;
        });
        
        content += `\nCreato il: ${new Date().toLocaleDateString()}`;
        
        return content;
    }
    
    async exportPackage(packageData, templates, formData, outputPath) {
        try {
            // For each document in the package, generate the document
            const results = await Promise.all(
                packageData.documents.map(async (docId) => {
                    const template = templates.find(t => t.id.toString() === docId.toString());
                    if (!template) {
                        throw new Error(`Template with ID ${docId} not found`);
                    }
                    
                    return await this.exportDocument(template, formData, outputPath);
                })
            );
            
            return results.every(result => result === true);
        } catch (error) {
            console.error('Error exporting package:', error);
            throw error;
        }
    }

    async exportJsonDocument(template, formData, outputPath) {
        try {
            console.log(`Generating JSON document for template: ${template.name}`);
            console.log('Form data:', formData);
            console.log(`Output path: ${outputPath}`);
            
            // Simulate document creation delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For JSON templates we need to generate a more complex Word document
            const docContent = this.generateJsonWordContent(template, formData);
            const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            // Trigger download as in the client-side method
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('JSON document generation failed:', error);
            throw error;
        }
    }
    
    generateJsonWordContent(template, formData) {
        // This is a simplified simulation of a Word document for JSON templates
        let content = `${template.name}\n\n`;
        
        // Add form data
        this._addJsonFieldsToContent(formData, content, 0);
        
        content += `\nCreato il: ${new Date().toLocaleDateString()}`;
        
        return content;
    }
    
    _addJsonFieldsToContent(data, content = "", indentLevel = 0) {
        const indent = "  ".repeat(indentLevel);
        let result = content;
        
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                result += `${indent}Item ${index + 1}:\n`;
                if (typeof item === 'object' && item !== null) {
                    result = this._addJsonFieldsToContent(item, result, indentLevel + 1);
                } else {
                    result += `${indent}  ${item}\n`;
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    result += `${indent}${key}:\n`;
                    result = this._addJsonFieldsToContent(value, result, indentLevel + 1);
                } else {
                    result += `${indent}${key}: ${value}\n`;
                }
            });
        }
        
        return result;
    }
}
