// Demo-Daten zum Testen der UI ohne Internetverbindung
import { insertArticles } from './db.js';
import crypto from 'crypto';

const today = new Date().toISOString().split('T')[0];

function id(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

const DEMO_ARTICLES = [
  // POLITIK
  {
    external_id: id('p1'),
    title: 'NATO einigt sich auf neue Verteidigungsstrategie für Osteuropa',
    summary: 'Die 32 NATO-Mitglieder haben sich auf ein umfassendes Paket zur Stärkung der Ostflanke geeinigt. Geplant sind permanente Truppenstationierungen in Polen und den baltischen Staaten sowie erhöhte Rüstungsausgaben von mindestens 2,5% des BIP. Deutschland übernimmt dabei die Koordination der multinationalen Battlegroup.',
    why_it_matters: 'Die neue Strategie markiert den größten Umbau der NATO-Präsenz in Europa seit dem Kalten Krieg und verändert die geopolitische Balance dauerhaft.',
    category: 'politik',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com',
    image_keyword: 'military alliance',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('p2'),
    title: 'Frankreich und Deutschland fordern EU-Reform bis 2027',
    summary: 'Paris und Berlin haben gemeinsam ein Reformpapier für die Europäische Union vorgelegt. Kernpunkte sind Mehrheitsentscheidungen in der Außenpolitik, ein gemeinsames EU-Budget für Verteidigung und eine schlankere Kommissionsstruktur. Andere EU-Staaten reagieren skeptisch.',
    why_it_matters: 'Wenn die deutsch-französische Achse hält, könnte das der größte Integrationsschub seit dem Vertrag von Lissabon werden.',
    category: 'politik',
    source_name: 'DW',
    source_url: 'https://www.dw.com',
    image_keyword: 'european union',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('p3'),
    title: 'Indiens Premier Modi gewinnt historische vierte Amtszeit',
    summary: 'Nach Auszählung von über 90% der Stimmen zeichnet sich ein klarer Sieg der BJP ab. Modis vierte Amtszeit wäre ein historisches Novum in der indischen Demokratie. Die Opposition spricht von Unregelmäßigkeiten bei der Stimmenauszählung in mehreren Bundesstaaten.',
    why_it_matters: 'Indien ist mit 1,4 Milliarden Menschen die bevölkerungsreichste Demokratie der Welt – was dort passiert, hat globale Signalwirkung.',
    category: 'politik',
    source_name: 'BBC World',
    source_url: 'https://www.bbc.com/news/world',
    image_keyword: 'india democracy',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },

  // WIRTSCHAFT
  {
    external_id: id('w1'),
    title: 'Dax auf Rekordhoch: Erstmals über 22.000 Punkte',
    summary: 'Der Deutsche Aktienindex durchbrach heute die psychologisch wichtige Marke von 22.000 Punkten. Treiber sind starke Quartalszahlen aus dem Industriesektor und sinkende Energiepreise. Analysten sehen weiteres Potenzial bis 23.500 Punkte bis Jahresende.',
    why_it_matters: 'Ein starker Dax signalisiert Vertrauen der Investoren in den Wirtschaftsstandort Deutschland – das kann Beschäftigung und Investitionen ankurbeln.',
    category: 'wirtschaft',
    source_name: 'Handelsblatt',
    source_url: 'https://www.handelsblatt.com',
    image_keyword: 'stock market',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('w2'),
    title: 'Apple zahlt 15 Mrd. Euro Nachsteuern an EU nach Gerichtsentscheid',
    summary: 'Der Europäische Gerichtshof hat Apples Beschwerde gegen einen Steuerbescheid aus Irland endgültig abgewiesen. Das Unternehmen muss 15 Milliarden Euro an entgangenen Steuern nachzahlen – die größte Steuernachforderung in der EU-Geschichte. Apple kündigt an, das Urteil zu akzeptieren.',
    why_it_matters: 'Das Urteil setzt ein Zeichen, dass auch Tech-Giganten keine Sonderregeln bei der Besteuerung in Europa bekommen.',
    category: 'wirtschaft',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com',
    image_keyword: 'tech taxation',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('w3'),
    title: 'Volkswagen schreibt erstmals seit 20 Jahren schwarze Zahlen in China',
    summary: 'Nach Jahren der Verluste meldet VW für das erste Quartal wieder einen Gewinn auf dem chinesischen Markt. Der Durchbruch kam durch neue Elektromodelle und eine Kooperation mit dem lokalen Hersteller SAIC. CEO Oliver Blume sprach von einem "Wendepunkt" für die China-Strategie.',
    why_it_matters: 'China ist der größte Automarkt der Welt – ob VW dort bestehen kann, entscheidet über Hunderttausende Arbeitsplätze in Deutschland.',
    category: 'wirtschaft',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com',
    image_keyword: 'electric car',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },

  // TECH & AI
  {
    external_id: id('t1'),
    title: 'Anthropic veröffentlicht Claude 4: Erstmals besser als menschliche Experten',
    summary: 'Anthropic hat Claude 4 lanciert und behauptet, in Bereichen wie Medizindiagnostik, Rechtsfragen und wissenschaftlicher Analyse die Leistung menschlicher Spezialisten zu übertreffen. Das Modell kann 2 Millionen Token verarbeiten – das entspricht etwa 4 kompletten Romanen gleichzeitig. Preis für den API-Zugang sinkt um 60%.',
    why_it_matters: 'Wenn KI menschliche Experten übertrifft, ändert sich, wofür wir Anwälte, Ärzte und Berater brauchen – fundamentaler gesellschaftlicher Wandel steht bevor.',
    category: 'tech',
    source_name: 'The Verge',
    source_url: 'https://www.theverge.com',
    image_keyword: 'artificial intelligence',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('t2'),
    title: 'SpaceX Starship absolviert erste vollständige Rundreise um die Erde',
    summary: 'Das Raumschiff Starship von SpaceX hat erfolgreich eine vollständige Erdumrundung abgeschlossen und ist plangemäß im Indischen Ozean gelandet. Der Test dauerte 94 Minuten. Elon Musk nennt es den "wichtigsten Schritt Richtung Mars in der Geschichte der Menschheit".',
    why_it_matters: 'Starship ist das Fahrzeug, das die NASA für die nächste Mondlandung und langfristig für Mars-Missionen nutzen will.',
    category: 'tech',
    source_name: 'Ars Technica',
    source_url: 'https://www.arstechnica.com',
    image_keyword: 'rocket space',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('t3'),
    title: 'Google DeepMind löst 50 Jahre altes Proteinfaltungs-Problem vollständig',
    summary: 'Forscher von Google DeepMind melden in Nature, dass ihr System AlphaFold 3 nun alle bekannten Proteinstrukturen mit atomarer Präzision vorhersagen kann. Dies öffnet die Tür zur schnellen Entwicklung von Medikamenten gegen Krebs, Alzheimer und antibiotikaresistente Bakterien.',
    why_it_matters: 'Was früher Jahrzehnte Labor-Arbeit erforderte, kann jetzt in Minuten berechnet werden – Medikamentenentwicklung wird dadurch revolutioniert.',
    category: 'tech',
    source_name: 'Nature / BBC Science',
    source_url: 'https://www.nature.com',
    image_keyword: 'protein science',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },

  // FASZINIEREND
  {
    external_id: id('f1'),
    title: 'Tintenfische träumen – und ihr Gehirn leuchtet dabei bunt auf',
    summary: 'Neurowissenschaftler der MPI haben erstmals Träume bei Tintenfischen belegt: Im Schlaf zeigen ihre Haut blitzartige Farbmuster, die im Wachleben der Jagd entsprechen. Das Gehirn durchläuft dabei Aktivierungsmuster, die dem menschlichen REM-Schlaf verblüffend ähnlich sind.',
    why_it_matters: 'Wenn Träume evolutionär so alt sind, wurden sie vielleicht nicht für das Gehirn, sondern für das Überleben entwickelt – eine völlig neue Sicht auf Bewusstsein.',
    category: 'faszinierend',
    source_name: 'New Scientist',
    source_url: 'https://www.newscientist.com',
    image_keyword: 'octopus biology',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('f2'),
    title: 'Urwald größer als Deutschland in Amazonas entdeckt – unberührt seit Jahrtausenden',
    summary: 'Satellitendaten und Expeditionen haben ein bislang vollständig unbekanntes Waldgebiet von 420.000 Quadratkilometern im peruanisch-brasilianischen Grenzgebiet enthüllt. Erste Proben zeigen hunderte unbekannte Tier- und Pflanzenarten sowie Anzeichen menschlicher Besiedlung vor über 3.000 Jahren.',
    why_it_matters: 'In einer scheinbar vollständig kartierten Welt existiert noch immer ein Ökosystem von der Größe Deutschlands, das wir nie kannten.',
    category: 'faszinierend',
    source_name: 'National Geographic',
    source_url: 'https://www.nationalgeographic.com',
    image_keyword: 'amazon forest',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },

  // FUN
  {
    external_id: id('fun1'),
    title: 'Japaner erfindet Regenschirm, der Passanten automatisch aus dem Weg geht',
    summary: 'Ein Ingenieur aus Tokio hat einen KI-gesteuerten Regenschirm entwickelt, der per Kamera und Mini-Motor automatisch gekippt wird, wenn jemand entgegenkommt. Der Prototyp hat auf japanischen Straßen bereits 340 Zusammenstöße verhindert. Das Patent wurde bereits an einen Hersteller lizenziert.',
    why_it_matters: 'Kleines Problem, elegante Lösung: Zeigt wie alltägliche Frustration mit etwas Kreativität und KI beseitigt werden kann.',
    category: 'fun',
    source_name: 'Reddit r/TodayILearned',
    source_url: 'https://www.reddit.com/r/todayilearned',
    image_keyword: 'umbrella rain',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
  {
    external_id: id('fun2'),
    title: 'Eichhörnchen besteht Universitätsprüfung – nach Beschwerde zugelassen',
    summary: 'Ein zahmes Eichhörnchen namens "Nuts" an der Universität Gent hat an einem Seminar über Tierverhalten teilgenommen, den Klausurbogen mitgenommen und korrekte Häkchen gesetzt. Die Prüfungskommission debattierte ernsthaft, ob das Ergebnis anerkannt werden müsse – und entschied mit 3:2 dagegen.',
    why_it_matters: 'Manchmal braucht es eine Eichhörnchen-Klausur, um Prüfungsordnungen auf ihre Absurdität zu testen.',
    category: 'fun',
    source_name: 'Reddit r/interestingasfuck',
    source_url: 'https://www.reddit.com/r/interestingasfuck',
    image_keyword: 'squirrel funny',
    fetched_at: today,
    published_date: new Date().toISOString(),
  },
];

insertArticles(DEMO_ARTICLES);
console.log(`[Seed] ${DEMO_ARTICLES.length} Demo-Artikel eingefügt.`);
