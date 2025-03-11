/**
 * This file provides template-specific debugging functions
 */

export function debugTemplates() {
    return {
        inspectDatabase: async function() {
            if (!window.app || !window.app.dbManager) {
                console.error('Database manager not available');
                return;
            }
            
            try {
                // Get standard templates
                const templates = await window.app.dbManager.getAllTemplates();
                console.log('Standard templates in database:', templates);
                
                // Get JSON templates
                const jsonTemplates = await window.app.dbManager.getJsonTemplates();
                console.log('JSON templates in database:', jsonTemplates);
                
                return { templates, jsonTemplates };
            } catch (error) {
                console.error('Error inspecting database:', error);
            }
        },
        
        forceTemplateSelection: async function(templateId, templateType = 'standard') {
            if (!window.app) {
                console.error('App not available');
                return;
            }
            
            try {
                console.log(`Forcing selection of ${templateType} template with ID: ${templateId}`);
                
                if (templateType === 'json') {
                    await window.app.onJsonTemplateSelected(templateId);
                } else {
                    await window.app.onTemplateSelected(templateId);
                }
                
                return true;
            } catch (error) {
                console.error('Error forcing template selection:', error);
                return false;
            }
        },
        
        checkTemplateUI: function() {
            const templateList = document.getElementById('templateList');
            const cards = templateList ? Array.from(templateList.children) : [];
            
            console.log(`Template list contains ${cards.length} cards`);
            
            cards.forEach((card, i) => {
                console.log(`Card ${i+1}:`, {
                    id: card.dataset.id,
                    type: card.dataset.type || 'standard',
                    html: card.innerHTML
                });
            });
            
            return cards;
        }
    };
}

// Add to window object for console access
window.templateDebug = debugTemplates();

console.log('Template debugging tools available via window.templateDebug');
