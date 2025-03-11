# DocGen - Applicazione di Generazione Documenti

Un'applicazione web per la generazione rapida di documenti e pacchetti di documenti con anteprima PDF in tempo reale.

## Caratteristiche Principali

- Creazione di documenti singoli basati su template
- Creazione di pacchetti di documenti (workflow predefiniti)
- Anteprima PDF in tempo reale durante la compilazione
- Esportazione in formato Word
- Interfaccia utente intuitiva e responsiva
- Salvataggio del progresso per riprendere la modifica

## Requisiti Tecnici

- Browser web moderno (Chrome, Firefox, Edge, Safari)
- Per funzionalità complete di esportazione: Python 3.7+ con le librerie:
  - Flask
  - python-docx
  - flask-cors

## Installazione

### Configurazione Client

1. Clona il repository:
   ```
   git clone https://github.com/username/DocGen.git
   cd DocGen
   ```

2. Apri il file `index.html` in un browser web.

### Configurazione Server (opzionale)

Per abilitare la generazione di documenti Word e PDF avanzata:

1. Naviga nella directory server:
   ```
   cd server
   ```

2. Installa le dipendenze Python:
   ```
   pip install flask flask-cors python-docx
   ```

3. Avvia il server:
   ```
   python server.py
   ```

Il server sarà disponibile all'indirizzo `http://localhost:5000`.

## Utilizzo

### Dashboard

La dashboard mostra i documenti e i pacchetti recenti.

### Creazione di un Documento Singolo

1. Clicca su "Nuovo Documento"
2. Seleziona un template
3. Compila i campi richiesti
4. Visualizza l'anteprima in tempo reale
5. Clicca su "Esporta Documento" per salvarlo come Word

### Creazione di un Pacchetto

1. Clicca su "Nuovo Pacchetto"
2. Seleziona i documenti da includere
3. Compila nome e descrizione
4. Salva il pacchetto

### Esportazione

Quando esporti un documento o un pacchetto, puoi selezionare la cartella di destinazione.

## Struttura del Progetto

- `index.html`: Punto di ingresso dell'applicazione
- `assets/css/`: Fogli di stile CSS
- `assets/js/`: Script JavaScript
- `server/`: Server Python per la generazione avanzata di documenti

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file LICENSE per maggiori dettagli.

## Contatti

Per supporto o domande, contatta: example@example.com
