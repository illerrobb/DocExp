// This file contains sample templates and example data to showcase the application

export const MilitaryLetterExample = {
  "pdc": {
    "grado": "Ten. Col.",
    "cognome": "B. Nasti",
    "telefono": "600-39721",
    "indirizzo": "Viale dell'Università, 4 - 00185 Roma",
    "pec": "personale.1pr@aeronautica.difesa.it"
  },
  "mittente": {
    "ufficio": "DIREZIONE PER L'IMPIEGO DEL PERSONALE MILITARE DELL'AERONAUTICA",
    "indirizzo": "Via delle Università, 4 - 00185 Roma",
    "pec": "personale.1pr@aeronautica.difesa.it"
  },
  "destinatari": [
    {
      "ufficio": "DIREZIONE GENERALE PER IL PERSONALE MILITARE",
      "reparto": "II Reparto",
      "localita": "ROMA"
    },
    {
      "ufficio": "COMANDO LOGISTICO DELL'A.M.",
      "reparto": "Sezione Operativa",
      "localita": "SEDE"
    }
  ],
  "oggetto": "Ufficiali dell'Aeronautica Militare in servizio permanente da includere presumibilmente nelle aliquote di ruolo per la formazione dei quadri di avanzamento per il 2025, riferita al 15 settembre 2024.",
  "allegati": "1 (UNO)",
  "per_conoscenza": [
    {
      "ente": "STATO MAGGIORE AERONAUTICA – 1° REPARTO",
      "localita": "SEDE"
    },
    {
      "ente": "COMANDO DELLA SQUADRA AEREA – 1° REGIONE AEREA",
      "localita": "MILANO"
    },
    {
      "ente": "COMANDO LOGISTICO DELL'A.M",
      "localita": "SEDE"
    },
    {
      "ente": "COMANDO SCUOLE DELL'A.M./3^ R.A.",
      "localita": "BARI"
    }
  ],
  "riferimenti": [
    {
      "protocollo": "M_D GMIL REG2024 0489706",
      "data": "2024-08-27"
    }
  ],
  "seguiti": [
    {
      "protocollo": "M_D ARM004 REG2024 0065327",
      "data": "2024-12-17"
    }
  ],
  "contenuto": [
    {
      "paragrafo": "In esito a quanto chiesto con i documenti a riferimento, a integrazione di quanto comunicato con i fogli citati a seguito, si comunica che gli Ufficiali nel grado di Tenente, alle date indicate nella definita aliquota di avanzamento di ruolo, risultano essere in possesso dei requisiti previsti dall'art. 1185 bis del Codice dell'Ordinamento Militare, eccezion fatta per il personale Ufficiale elencato nello specchio riepilogativo in allegato."
    },
    {
      "paragrafo": "Quanto precede, fatti salvi eventuali periodi di interruzione dal servizio derivanti da 'provvedimenti di stato' e/o assenze per collocamento in aspettativa, congedo o assenza per infermità, che esulano dalla specifica competenza di questa Direzione."
    }
  ],
  "firma": {
    "titolo": "IL DIRETTORE",
    "nome": "Gen. S.A. Francesco VESTITO"
  }
};

export const RequestaFerieExample = {
  "dipendente": {
    "nome": "Mario",
    "cognome": "Rossi",
    "grado": "Primo Maresciallo",
    "reparto": "Ufficio Personale"
  },
  "periodo": {
    "dataInizio": "2024-07-15",
    "dataFine": "2024-07-30",
    "giorniTotali": 15
  },
  "motivazione": "Ferie estive per ricongiungimento familiare",
  "recapito": {
    "indirizzo": "Via Roma 123, Palermo",
    "telefono": "333-1234567"
  },
  "sostituto": {
    "nome": "Giuseppe",
    "cognome": "Verdi",
    "grado": "Maresciallo"
  }
};
