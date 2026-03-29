// All user-visible strings, keyed by language (de, en)

export const strings = {
  de: {
    step1: {
      title: 'Berater auswaehlen',
      bestMatch: 'Bestmoegliche Zuordnung',
      bestMatchDesc: 'Wir waehlen den passenden Berater fuer Sie',
      loading: 'Berater werden geladen...',
    },
    step2: {
      title: 'Datum waehlen',
      weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      weekdaysFull: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      months: ['Jan', 'Feb', 'Maer', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    },
    step3: {
      title: 'Uhrzeit waehlen',
      morning: 'Vormittag',
      afternoon: 'Nachmittag',
      unavailable: 'Nicht verfuegbar',
      loading: 'Verfuegbarkeit wird geladen...',
    },
    step4: {
      title: 'Ihre Angaben',
      name: 'Name',
      namePlaceholder: 'Max Mustermann',
      email: 'Geschaeftliche E-Mail',
      emailPlaceholder: 'max@firma.de',
      company: 'Unternehmen',
      companyPlaceholder: 'Musterfirma GmbH',
      topic: 'Thema',
      attendees: 'Auch Kollegen einladen',
      attendeesPlaceholder: 'kollege1@firma.de, kollege2@firma.de',
      gdpr: 'Ich stimme der Verarbeitung meiner Daten gemaess der <a href="/datenschutz" target="_blank">Datenschutzerklaerung</a> zu.',
      submit: 'Termin buchen',
    },
    step5: {
      title: 'Termin bestaetigt',
      confirmed: 'Ihr Termin wurde erfolgreich gebucht.',
      meetLink: 'Google Meet beitreten',
      downloadIcs: 'Kalender-Datei herunterladen (.ics)',
      summary: 'Zusammenfassung',
      consultant: 'Berater',
      date: 'Datum',
      time: 'Uhrzeit',
      topicLabel: 'Thema',
    },
    topics: [
      'ERP-Einfuehrung',
      'Prozessautomatisierung',
      'Datenmigration',
      'Beratungsgespraech',
      'Individualisierung',
      'Sonstiges',
    ],
    common: {
      next: 'Weiter',
      back: 'Zurueck',
      close: 'Schliessen',
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten.',
      retry: 'Erneut versuchen',
      step: 'Schritt',
      of: 'von',
      bookNow: 'Termin buchen',
    },
    errors: {
      networkError: 'Verbindungsfehler. Bitte versuchen Sie es erneut.',
      consultantsFailed: 'Berater konnten nicht geladen werden.',
      availabilityFailed: 'Verfuegbarkeit konnte nicht geladen werden.',
      bookingFailed: 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.',
      requiredField: 'Dieses Feld ist erforderlich.',
      invalidEmail: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.',
    },
  },
  en: {
    step1: {
      title: 'Choose consultant',
      bestMatch: 'Best match',
      bestMatchDesc: 'We will assign the best consultant for you',
      loading: 'Loading consultants...',
    },
    step2: {
      title: 'Choose date',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekdaysFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    step3: {
      title: 'Choose time',
      morning: 'Morning',
      afternoon: 'Afternoon',
      unavailable: 'Unavailable',
      loading: 'Loading availability...',
    },
    step4: {
      title: 'Your details',
      name: 'Name',
      namePlaceholder: 'John Smith',
      email: 'Work email',
      emailPlaceholder: 'john@company.com',
      company: 'Company',
      companyPlaceholder: 'Company Ltd',
      topic: 'Topic',
      attendees: 'Also invite colleagues',
      attendeesPlaceholder: 'colleague1@company.com, colleague2@company.com',
      gdpr: 'I consent to the processing of my data in accordance with the <a href="/privacy" target="_blank">Privacy Policy</a>.',
      submit: 'Book appointment',
    },
    step5: {
      title: 'Appointment confirmed',
      confirmed: 'Your appointment has been booked successfully.',
      meetLink: 'Join Google Meet',
      downloadIcs: 'Download calendar file (.ics)',
      summary: 'Summary',
      consultant: 'Consultant',
      date: 'Date',
      time: 'Time',
      topicLabel: 'Topic',
    },
    topics: [
      'ERP Implementation',
      'Process Automation',
      'Data Migration',
      'Consultation',
      'Customisation',
      'Other',
    ],
    common: {
      next: 'Next',
      back: 'Back',
      close: 'Close',
      loading: 'Loading...',
      error: 'An error occurred.',
      retry: 'Try again',
      step: 'Step',
      of: 'of',
      bookNow: 'Book appointment',
    },
    errors: {
      networkError: 'Connection error. Please try again.',
      consultantsFailed: 'Could not load consultants.',
      availabilityFailed: 'Could not load availability.',
      bookingFailed: 'Booking failed. Please try again.',
      requiredField: 'This field is required.',
      invalidEmail: 'Please enter a valid email address.',
    },
  },
}

// Dot-path lookup: t('de', 'step1.title') -> 'Berater auswaehlen'
export function t(lang, key) {
  const keys = key.split('.')
  let val = strings[lang] || strings.de
  for (const k of keys) {
    if (val == null) return key
    val = val[k]
  }
  return val != null ? val : key
}
