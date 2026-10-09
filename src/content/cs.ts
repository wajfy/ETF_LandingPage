/**
 * Czech copy – taken from the approved wireframe (wireframe/wireframe.html).
 * Contains words only: every fund figure, date and source is interpolated from research/etf-data.json.
 * "W-⁠8BEN": a word joiner after the hyphen stops the form name from breaking across lines.
 */

export const hero = {
  eyebrow: 'Prověrka ETF · 7 fondů z amerických burz',
  titleLead: 'Poplatek fondu je',
  titleAccent: 'jen jedna položka.',
  lead: 'Vyberte ETF a uvidíte v korunách, co dalšího může hrát roli.',
  pickerLabel: 'Vyberte ETF',
}

export const card = {
  defaultRule: 'Předvybráno podle abecedy – nic nedoporučujeme.',
  amountLead: 'Co může hrát roli při investici',
  amountTail: '(orientačně, 1 rok)',
  amountCustomOption: 'jiná částka…',
  amountCustomLabel: 'Vlastní částka v korunách',
  amountCustomPlaceholder: 'např. 25000',
  amountError: (min: string, max: string) => `Zadejte částku od ${min} do ${max}.`,

  fee: {
    name: 'Poplatek fondu',
    sub: (ter: string) => `TER ${ter} ročně`,
    unit: 'ročně',
    note: 'Strhává se průběžně z hodnoty fondu – každý rok, dokud ETF držíte.',
  },
  conversion: {
    name: 'Směna korun na dolary',
    sub: (rate: string) => `modelová sazba ${rate}`,
    unit: 'jednorázově',
    note: 'Platí se při převodu Kč na USD – podle brokera při nákupu, nebo už při vkladu na dolarový účet. Při prodeji a převodu zpět na koruny se platí znovu.',
    sliderLabel: 'Upravte sazbu podle svého brokera',
    sliderCaption: 'modelová sazba',
  },
  tax: {
    name: 'Daň z dividend v USA',
    sub: '15 % z dividend · historický příklad',
    unit: 'ročně, přibližně',
    note: (yieldPct: string, tax15: string, tax30: string) =>
      `Zjednodušený příklad podle minulosti, ne předpověď. Za posledních 12 měsíců fond vyplatil na dividendách přibližně ${yieldPct} své hodnoty. Kdyby vyplatil stejně, strhlo by se v USA 15 % z dividend, tedy ${tax15} ročně. Bez formuláře W-⁠8BEN až 30 % (${tax30}). Je to daň, ne poplatek fondu. Nejde o výpočet vaší daně – jak se dividendy zdaní v ČR a jak se americká daň započte, záleží na vaší situaci.`,
  },

  noTotal: 'Položky záměrně nesčítáme: jedna se platí každý rok, druhá jednorázově při směně a třetí je daň.',
  facts: {
    currency: 'v USD',
    domicile: 'fond registrovaný v USA',
    since: (year: number) => `od ${year}`,
    quarterly: 'dividendy čtvrtletně',
  },
  kid: {
    title: 'Koupíte ho z Česka?',
    body: 'Většina evropských brokerů retailovým klientům nákup ETF registrovaných v USA neumožní. Jejich emitenti obvykle nevydávají dokument KID, který evropská regulace PRIIPs pro prodej drobným investorům vyžaduje. Omezení se týká brokera, ne vás.',
  },
  stamp: (terSource: string, dividendWindowEnd: string) =>
    `ETF se obchoduje v USD, takže částky v korunách se mohou měnit s kurzem. Výpočet na 1 rok, bez zhodnocení a se stálým kurzem. Poplatek: ${terSource} · dividendy: 12 měsíců do ${dividendWindowEnd}.`,
  methodLink: 'Jak počítáme ↓',
  terNoDate: 'dle prospektu',
}

/** Plain-Czech description of what each fund holds (wording from the wireframe; facts per issuer pages). */
export const fundDescriptions: Record<string, string> = {
  IVV: 'Sleduje index S&P 500 – 500 velkých amerických firem.',
  SCHD: 'Sleduje americké akcie vybírané podle kvality a stability dividend.',
  SPY: 'Sleduje index S&P 500 – 500 velkých amerických firem.',
  SPYM: 'Sleduje index S&P 500 – 500 velkých amerických firem. Do 31. 10. 2025 pod tickerem SPLG.',
  VOO: 'Sleduje index S&P 500 – 500 velkých amerických firem.',
  VT: 'Sleduje akcie firem z celého světa – z vyspělých i rozvíjejících se trhů.',
  VTI: 'Sleduje prakticky celý americký akciový trh – velké, střední i malé firmy.',
}

/** Short issuer names used in the data stamp ("Vanguard, k 28. 4. 2026"). */
export const issuerShort: Record<string, string> = {
  Vanguard: 'Vanguard',
  'State Street Global Advisors': 'State Street',
  'BlackRock iShares': 'iShares',
  'Schwab Asset Management': 'Schwab',
}

export const methodology = {
  title: 'Jak počítáme a odkud jsou data',
  items: {
    independent:
      'Každou položku počítáme zvlášť ze zadané částky. Zjednodušení: poplatek fondu ani daň nesnižujeme o cenu směny (rozdíl je nejvýš 1 % dané položky).',
    fee: 'částka × roční poplatek fondu (TER). Zdroj: stránky emitentů, stav k datu uvedenému u každého fondu.',
    conversion:
      'částka × modelová sazba. Výchozích 0,5 % odpovídá přirážce ze sazebníku XTB ze dne 29. 4. 2026. Přirážka se připočítává ke kurzu brokera, takže skutečný náklad může být o něco vyšší. Rozsah 0–1 % je modelový, nejde o přehled trhu. Jiní brokeři účtují jinak.',
    tax: (windowStart: string, windowEnd: string, navDate: string) =>
      `částka × dividendový výnos za posledních 365 dní × 15 % (s W-⁠8BEN), případně 30 % (bez něj). Výnos je historický: součet výplat s rozhodným dnem od ${windowStart} do ${windowEnd} ÷ hodnota podílu (NAV) k ${navDate}; u SPY a SPYM údaj emitenta podle stejné definice. Částka v Kč je ilustrace pro případ, že by fond vyplácel stejně – není to odhad budoucích dividend.`,
    notIncluded: 'zhodnocení, změny kurzu, poplatky brokera za obchod, rozpětí mezi nákupní a prodejní cenou ani českou daň.',
    rounding:
      'dividendový výnos ukazujeme na dvě desetinná místa (např. 1,04 %). Počítáme ale z nezaokrouhlené hodnoty, takže přepočet ze zobrazeného čísla může dát o něco jinou částku. Všechny částky v korunách zaokrouhlujeme na tři platné číslice, nejvýš na celé koruny, a polovinu nahoru (např. 155,93 Kč → 156 Kč, 94,50 Kč → 95 Kč, 15 593 Kč → 15 600 Kč). Jde o modelový výpočet, proto u částek píšeme „≈“.',
    fx: (rate: string, date: string) =>
      `1 USD = ${rate} Kč (ČNB, ${date}). Do výpočtů nevstupuje – ty pracují s procenty z částky v korunách.`,
  },
  labels: {
    fee: 'Poplatek fondu',
    conversion: 'Směna',
    tax: 'Daň z dividend (přibližně)',
    notIncluded: 'Nepočítáme',
    rounding: 'Zaokrouhlení',
    fx: 'Kurz pro představu',
  },
  sourcesTitle: 'Zdroje',
  otherSources: [
    { label: 'sazebník XTB 29. 4. 2026', href: 'https://www.xtb.com/cz/soubory/tabulka-poplatku-a-provizi.pdf' },
    { label: 'IRS – formulář W-⁠8BEN', href: 'https://www.irs.gov/forms-pubs/about-form-w-8-ben' },
    { label: 'IRS – smluvní sazby', href: 'https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf' },
    { label: 'smlouva ČR–USA č. 32/1994 Sb.', href: 'https://e-sbirka.gov.cz/sb/1994/32' },
    { label: 'zákon č. 586/1992 Sb.', href: 'https://e-sbirka.gov.cz/sb/1992/586' },
    { label: 'nařízení (EU) č. 1286/2014 (PRIIPs)', href: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1286' },
  ],
  fxSourceLabel: 'ČNB kurzy devizového trhu',
  important:
    'Tato stránka slouží ke vzdělávání. Nejde o nabídku investice, investiční doporučení ani daňové poradenství. Minulé údaje nezaručují budoucí výsledky.',
  importantLabel: 'Důležité',
}

export const footer = {
  operatorPlaceholder: 'Provozovatel: doplní se před spuštěním (název, sídlo, IČO, kontakt).',
  dataAsOf: (date: string) => `Data k ${date}`,
}
