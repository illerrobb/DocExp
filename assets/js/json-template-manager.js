export class JsonTemplateManager {
    constructor() {
        this.templates = new Map();
    }

    registerTemplate(name, schema) {
        this.templates.set(name, schema);
    }

    getTemplate(name) {
        return this.templates.get(name);
    }

    getAllTemplates() {
        return Array.from(this.templates.entries()).map(([name, schema]) => ({
            name,
            schema
        }));
    }

    // Initialize with default templates
    initDefaultTemplates() {
        // Template for military letter based on the provided example
        this.registerTemplate("Lettera Militare", {
            pdc: {
                type: "object",
                label: "Punto di Contatto",
                properties: {
                    grado: { type: "text", label: "Grado", required: true },
                    cognome: { type: "text", label: "Cognome", required: true },
                    telefono: { type: "text", label: "Telefono", required: false },
                    indirizzo: { type: "text", label: "Indirizzo", required: false },
                    pec: { type: "email", label: "PEC", required: false }
                }
            },
            mittente: {
                type: "object",
                label: "Mittente",
                properties: {
                    ufficio: { type: "text", label: "Ufficio", required: true },
                    indirizzo: { type: "text", label: "Indirizzo", required: true },
                    pec: { type: "email", label: "PEC", required: false }
                }
            },
            destinatari: {
                type: "array",
                label: "Destinatari",
                minItems: 1,
                item: {
                    type: "object",
                    properties: {
                        ufficio: { type: "text", label: "Ufficio", required: true },
                        reparto: { type: "text", label: "Reparto", required: false },
                        localita: { type: "text", label: "Località", required: true }
                    }
                }
            },
            oggetto: { type: "textarea", label: "Oggetto", required: true },
            allegati: { type: "text", label: "Allegati", required: false },
            per_conoscenza: {
                type: "array",
                label: "Per Conoscenza",
                minItems: 0,
                item: {
                    type: "object",
                    properties: {
                        ente: { type: "text", label: "Ente", required: true },
                        localita: { type: "text", label: "Località", required: true }
                    }
                }
            },
            riferimenti: {
                type: "array",
                label: "Riferimenti",
                minItems: 0,
                item: {
                    type: "object",
                    properties: {
                        protocollo: { type: "text", label: "Protocollo", required: true },
                        data: { type: "date", label: "Data", required: true }
                    }
                }
            },
            seguiti: {
                type: "array",
                label: "Seguiti",
                minItems: 0,
                item: {
                    type: "object",
                    properties: {
                        protocollo: { type: "text", label: "Protocollo", required: true },
                        data: { type: "date", label: "Data", required: true }
                    }
                }
            },
            contenuto: {
                type: "array",
                label: "Contenuto",
                minItems: 1,
                item: {
                    type: "object",
                    properties: {
                        paragrafo: { type: "textarea", label: "Paragrafo", required: true }
                    }
                }
            },
            firma: {
                type: "object",
                label: "Firma",
                properties: {
                    titolo: { type: "text", label: "Titolo", required: true },
                    nome: { type: "text", label: "Nome Completo", required: true }
                }
            }
        });

        // Add another template example
        this.registerTemplate("Richiesta Ferie", {
            dipendente: {
                type: "object",
                label: "Dati Dipendente",
                properties: {
                    nome: { type: "text", label: "Nome", required: true },
                    cognome: { type: "text", label: "Cognome", required: true },
                    grado: { type: "text", label: "Grado/Qualifica", required: true },
                    reparto: { type: "text", label: "Reparto", required: true }
                }
            },
            periodo: {
                type: "object",
                label: "Periodo Richiesto",
                properties: {
                    dataInizio: { type: "date", label: "Data Inizio", required: true },
                    dataFine: { type: "date", label: "Data Fine", required: true },
                    giorniTotali: { type: "number", label: "Giorni Totali", required: true }
                }
            },
            motivazione: { type: "textarea", label: "Motivazione", required: false },
            recapito: {
                type: "object",
                label: "Recapito durante l'assenza",
                properties: {
                    indirizzo: { type: "text", label: "Indirizzo", required: true },
                    telefono: { type: "text", label: "Telefono", required: true }
                }
            },
            sostituto: {
                type: "object",
                label: "Sostituto",
                properties: {
                    nome: { type: "text", label: "Nome", required: true },
                    cognome: { type: "text", label: "Cognome", required: true },
                    grado: { type: "text", label: "Grado/Qualifica", required: true }
                }
            }
        });
    }
    
    // Generate sample data based on a template schema
    generateSampleData(templateName) {
        const template = this.getTemplate(templateName);
        if (!template) return null;
        
        return this._generateSampleForSchema(template);
    }
    
    _generateSampleForSchema(schema) {
        if (!schema) return null;
        
        if (schema.type === 'object' && schema.properties) {
            const result = {};
            Object.entries(schema.properties).forEach(([key, prop]) => {
                result[key] = this._generateSampleForSchema(prop);
            });
            return result;
        } 
        else if (schema.type === 'array') {
            const count = schema.minItems || 1;
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(this._generateSampleForSchema(schema.item));
            }
            return result;
        }
        else {
            // Generate sample values based on type
            switch(schema.type) {
                case 'text':
                    return schema.label ? `Sample ${schema.label}` : 'Sample Text';
                case 'textarea':
                    return 'Sample multi-line text content. This is an example of longer text that might be entered in a textarea field.';
                case 'number':
                    return 42;
                case 'date':
                    return new Date().toISOString().split('T')[0];
                case 'email':
                    return 'example@domain.com';
                default:
                    return 'Sample Value';
            }
        }
    }
    
    // Import a JSON document from string
    importJsonDocument(jsonString, templateName) {
        try {
            const data = JSON.parse(jsonString);
            const template = this.getTemplate(templateName);
            
            if (!template) {
                throw new Error(`Template "${templateName}" non trovato`);
            }
            
            return this._validateAndTransformData(data, template);
        } catch (error) {
            throw new Error(`Errore durante l'importazione JSON: ${error.message}`);
        }
    }
    
    // Validate imported data
    _validateAndTransformData(data, schema) {
        // Simple validation check - in a real application, this would be more thorough
        if (!data || typeof data !== 'object') {
            throw new Error('I dati JSON non sono un oggetto valido');
        }
        
        // Check for required fields at the top level
        if (schema.type === 'object' && schema.properties) {
            Object.entries(schema.properties).forEach(([key, prop]) => {
                if (prop.required && !(key in data)) {
                    throw new Error(`Campo richiesto mancante: ${prop.label || key}`);
                }
            });
        }
        
        return data;
    }
    
    // Generate flat field structure for database storage
    generateFieldsFromSchema(schema) {
        const fields = [];
        this._extractFields(schema, fields, '');
        return fields;
    }
    
    _extractFields(schema, fields, prefix) {
        if (!schema) return;
        
        if (typeof schema === 'object') {
            if (schema.type === 'object') {
                const objectPrefix = prefix ? `${prefix}.` : '';
                Object.entries(schema.properties).forEach(([key, prop]) => {
                    this._extractFields(prop, fields, `${objectPrefix}${key}`);
                });
            } else if (schema.type === 'array') {
                fields.push({
                    name: prefix,
                    label: schema.label || prefix,
                    type: 'array',
                    itemSchema: schema.item
                });
            } else {
                fields.push({
                    name: prefix,
                    label: schema.label || prefix,
                    type: schema.type || 'text',
                    required: schema.required || false
                });
            }
        }
    }
}
