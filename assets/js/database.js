export class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }
    
    async initDatabase() {
        try {
            // Use SQL.js for client-side SQLite
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
            });
            
            // Create a new database
            this.db = new SQL.Database();
            
            // Create tables
            this.createTables();
            
            // Insert some sample data for development
            await this.insertSampleData();
            
            this.isInitialized = true;
            console.log("Database initialized successfully");
            return true;
        } catch (error) {
            console.error("Database initialization failed:", error);
            return false;
        }
    }
    
    createTables() {
        // Templates table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                fields TEXT NOT NULL,
                createdAt INTEGER NOT NULL
            )
        `);
        
        // Documents table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY,
                templateId INTEGER NOT NULL,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                FOREIGN KEY (templateId) REFERENCES templates(id)
            )
        `);
        
        // Packages table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS packages (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                documents TEXT NOT NULL,
                createdAt INTEGER NOT NULL
            )
        `);
        
        // Document progress table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS document_progress (
                id INTEGER PRIMARY KEY,
                templateId INTEGER NOT NULL,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (templateId) REFERENCES templates(id)
            )
        `);

        // JSON Templates table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS json_templates (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                schema TEXT NOT NULL,
                createdAt INTEGER NOT NULL
            )
        `);
    }
    
    async insertSampleData() {
        // Insert sample templates
        const templates = [
            {
                name: 'Contratto di Lavoro',
                description: 'Template per contratti di lavoro standard',
                fields: JSON.stringify([
                    { name: 'nomeCliente', label: 'Nome Cliente', type: 'text', required: true },
                    { name: 'cognomeCliente', label: 'Cognome Cliente', type: 'text', required: true },
                    { name: 'indirizzo', label: 'Indirizzo', type: 'text', required: true },
                    { name: 'città', label: 'Città', type: 'text', required: true },
                    { name: 'dataInizio', label: 'Data di Inizio', type: 'date', required: true },
                    { name: 'stipendio', label: 'Stipendio Annuale', type: 'number', required: true }
                ]),
                createdAt: Date.now()
            },
            {
                name: 'Dichiarazione dei Redditi',
                description: 'Template per dichiarazioni fiscali',
                fields: JSON.stringify([
                    { name: 'nome', label: 'Nome', type: 'text', required: true },
                    { name: 'cognome', label: 'Cognome', type: 'text', required: true },
                    { name: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
                    { name: 'annoFiscale', label: 'Anno Fiscale', type: 'number', required: true },
                    { name: 'redditoTotale', label: 'Reddito Totale', type: 'number', required: true }
                ]),
                createdAt: Date.now()
            }
        ];
        
        templates.forEach(template => {
            this.db.run(
                'INSERT INTO templates (name, description, fields, createdAt) VALUES (?, ?, ?, ?)',
                [template.name, template.description, template.fields, template.createdAt]
            );
        });

        // Insert JSON templates
        const jsonTemplates = [
            {
                name: 'Lettera Militare',
                description: 'Template per lettere ufficiali militari',
                schema: JSON.stringify({
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
                }),
                createdAt: Date.now()
            }
        ];
        
        jsonTemplates.forEach(template => {
            this.db.run(
                'INSERT INTO json_templates (name, description, schema, createdAt) VALUES (?, ?, ?, ?)',
                [template.name, template.description, template.schema, template.createdAt]
            );
        });
    }
    
    async getRecentDocuments(limit = 6) {
        try {
            const query = `SELECT * FROM documents ORDER BY createdAt DESC LIMIT ${limit}`;
            const result = this.db.exec(query);
            
            if (result.length === 0) return [];
            
            const documents = [];
            const columns = result[0].columns;
            result[0].values.forEach(row => {
                const document = {};
                columns.forEach((column, i) => {
                    document[column] = row[i];
                });
                // Parse the data field
                document.data = JSON.parse(document.data);
                documents.push(document);
            });
            
            return documents;
        } catch (error) {
            console.error('Failed to get recent documents:', error);
            return [];
        }
    }
    
    async getRecentPackages(limit = 6) {
        try {
            const query = `SELECT * FROM packages ORDER BY createdAt DESC LIMIT ${limit}`;
            const result = this.db.exec(query);
            
            if (result.length === 0) return [];
            
            const packages = [];
            const columns = result[0].columns;
            result[0].values.forEach(row => {
                const pkg = {};
                columns.forEach((column, i) => {
                    pkg[column] = row[i];
                });
                // Parse the documents field
                pkg.documents = JSON.parse(pkg.documents);
                packages.push(pkg);
            });
            
            return packages;
        } catch (error) {
            console.error('Failed to get recent packages:', error);
            return [];
        }
    }
    
    async getAllTemplates() {
        try {
            const query = 'SELECT * FROM templates ORDER BY name';
            const result = this.db.exec(query);
            
            if (result.length === 0) return [];
            
            const templates = [];
            const columns = result[0].columns;
            result[0].values.forEach(row => {
                const template = {};
                columns.forEach((column, i) => {
                    template[column] = row[i];
                });
                // Parse the fields
                template.fields = JSON.parse(template.fields);
                templates.push(template);
            });
            
            return templates;
        } catch (error) {
            console.error('Failed to get templates:', error);
            return [];
        }
    }
    
    async getTemplateById(id) {
        try {
            console.log(`Looking for template with ID: ${id} (type: ${typeof id})`);
            
            // Convert ID to number if it's not already
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                console.error(`Invalid template ID: ${id}`);
                return null;
            }
            
            const query = 'SELECT * FROM templates WHERE id = ?';
            const stmt = this.db.prepare(query);
            stmt.bind([numericId]);
            const result = stmt.getAsObject();
            stmt.free();
            
            console.log('Query result:', result);
            
            if (!result.id) {
                console.error(`No template found with ID ${id}`);
                return null;
            }
            
            // Parse the fields
            try {
                result.fields = JSON.parse(result.fields);
            } catch (parseError) {
                console.error(`Error parsing fields for template ${id}:`, parseError);
                result.fields = [];
            }
            
            console.log(`Template found with ID ${id}:`, result);
            return result;
        } catch (error) {
            console.error(`Failed to get template with id ${id}:`, error);
            return null;
        }
    }
    
    async saveDocumentProgress(data) {
        try {
            const query = `
                INSERT INTO document_progress (templateId, name, data, timestamp)
                VALUES (?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(query);
            stmt.run([
                data.templateId,
                data.name,
                JSON.stringify(data.data),
                data.timestamp
            ]);
            stmt.free();
            
            return true;
        } catch (error) {
            console.error('Failed to save document progress:', error);
            return false;
        }
    }
    
    async savePackage(packageData) {
        try {
            const query = `
                INSERT INTO packages (name, description, documents, createdAt)
                VALUES (?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(query);
            stmt.run([
                packageData.name,
                packageData.description,
                JSON.stringify(packageData.documents),
                packageData.createdAt
            ]);
            stmt.free();
            
            return true;
        } catch (error) {
            console.error('Failed to save package:', error);
            return false;
        }
    }
    
    // Save a completed document
    async saveDocument(documentData) {
        try {
            const query = `
                INSERT INTO documents (templateId, name, data, createdAt)
                VALUES (?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(query);
            stmt.run([
                documentData.templateId,
                documentData.name,
                JSON.stringify(documentData.data),
                documentData.createdAt
            ]);
            stmt.free();
            
            return true;
        } catch (error) {
            console.error('Failed to save document:', error);
            return false;
        }
    }
    
    // Export database to a file
    exportDatabase() {
        try {
            const data = this.db.export();
            return new Uint8Array(data);
        } catch (error) {
            console.error('Failed to export database:', error);
            return null;
        }
    }

    async getJsonTemplates() {
        try {
            const query = 'SELECT * FROM json_templates ORDER BY name';
            const result = this.db.exec(query);
            
            if (result.length === 0) return [];
            
            const templates = [];
            const columns = result[0].columns;
            result[0].values.forEach(row => {
                const template = {};
                columns.forEach((column, i) => {
                    template[column] = row[i];
                });
                // Parse the schema
                template.schema = JSON.parse(template.schema);
                templates.push(template);
            });
            
            return templates;
        } catch (error) {
            console.error('Failed to get JSON templates:', error);
            return [];
        }
    }
    
    async getJsonTemplateById(id) {
        try {
            console.log(`Looking for JSON template with ID: ${id} (type: ${typeof id})`);
            
            // Convert ID to number if it's not already
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                console.error(`Invalid JSON template ID: ${id}`);
                return null;
            }
            
            const query = 'SELECT * FROM json_templates WHERE id = ?';
            const stmt = this.db.prepare(query);
            stmt.bind([numericId]);
            const result = stmt.getAsObject();
            stmt.free();
            
            console.log('Query result:', result);
            
            if (!result.id) {
                console.error(`No JSON template found with ID ${id}`);
                return null;
            }
            
            // Parse the schema
            try {
                result.schema = JSON.parse(result.schema);
            } catch (parseError) {
                console.error(`Error parsing schema for template ${id}:`, parseError);
                result.schema = {};
            }
            
            console.log(`JSON template found with ID ${id}:`, result);
            return result;
        } catch (error) {
            console.error(`Failed to get JSON template with id ${id}:`, error);
            return null;
        }
    }

    async saveTemplate(templateData) {
        try {
            const query = `
                INSERT INTO templates (name, description, fields, createdAt)
                VALUES (?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(query);
            stmt.run([
                templateData.name,
                templateData.description,
                JSON.stringify(templateData.fields),
                templateData.createdAt
            ]);
            stmt.free();
            
            console.log('Template saved successfully:', templateData);
            return true;
        } catch (error) {
            console.error('Failed to save template:', error);
            return false;
        }
    }
}
