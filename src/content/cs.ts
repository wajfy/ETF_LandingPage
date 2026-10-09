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
  },
  tax: {
    name: 'Daň z dividend v USA',
    sub: '15 % z dividend · historický příklad',
    unit: 'ročně, přibližně',
    /** Always visible: the five agreed caveats in short form (README §3a, dividend-tax wording). */
    summary: (yieldPct: string, tax30: string) =>
      `Zjednodušený příklad podle minulosti, ne předpověď: za posledních 12 měsíců fond vyplatil na dividendách přibližně ${yieldPct} své hodnoty. Bez formuláře W-\u20608BEN až 30 % (${tax30}). Je to daň, ne poplatek fondu, a nejde o výpočet vaší daně.`,
    /** Secondary detail behind a native disclosure. */
    detailToggle: 'Jak příklad počítáme',
    detail: (tax15: string) =>
      `Kdyby fond vyplatil stejně jako za posledních 12 měsíců, strhlo by se v USA 15 % z dividend, tedy ${tax15} ročně. Jak se dividendy zdaní v ČR a jak se americká daň započte, záleží na vaší situaci – ověřte s daňovým poradcem.`,
    detailMethodLink: 'Celá metodika ↓',
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
    comparison:
      'Srovnávací tabulka používá stejný výpočet a stejné zaokrouhlení jako karta, pro částku a modelovou sazbu zvolenou na kartě.',
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
    comparison: 'Srovnání',
  },
  sourcesTitle: 'Zdroje',
  otherSources: [
    { label: 'sazebník XTB 29. 4. 2026', href: 'https://www.xtb.com/cz/soubory/tabulka-poplatku-a-provizi.pdf' },
    { label: 'IRS – formulář W-⁠8BEN', href: 'https://www.irs.gov/forms-pubs/about-form-w-8-ben' },
    { label: 'IRS – smluvní sazby', href: 'https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf' },
    { label: 'smlouva ČR–USA č. 32/1994 Sb.', href: 'https://e-sbirka.gov.cz/sb/1994/32' },
    { label: 'zákon č. 586/1992 Sb.', href: 'https://e-sbirka.gov.cz/sb/1992/586' },
    { label: 'nařízení (EU) č. 1286/2014 (PRIIPs)', href: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1286' },
    { label: 'Interactive Brokers – FAQ „PRIIPs regulation“', href: 'https://www.interactivebrokers.com/lib/cstools/faq/#/content/1136192471' },
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

/* ---------------------------------------------------------------- M2 sections ---------------- */

/** Section labels shown in mono above each section heading. */
export const sections = {
  comparison: { number: '02', label: 'Srovnání' },
  explainers: { number: '03', label: 'Vysvětlení' },
  checklist: { number: '04', label: 'Checklist' },
  methodology: { number: '05', label: 'Metodika' },
}

/** "IVV, SPY, SPYM a VOO" – Czech list join. */
export const czList = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} a ${items[items.length - 1]}`

export const comparison = {
  title: 'Srovnání všech 7 ETF',
  intro: (amount: string) =>
    `Stejné výpočty a stejné zaokrouhlení jako na kartě, pro částku ${amount}. Pořadí je abecední, nejde o žebříček.`,
  groups: {
    'same-index': {
      title: 'Stejný index, jiný poplatek',
      text: (gap: string, tickers: string[]) =>
        `Fondy ${czList(tickers)} sledují stejný index S&P 500. Jejich roční poplatky (TER) se navzájem liší nejvýš o ${gap} procentního bodu.`,
    },
    'other-index': {
      title: 'Jiný index, jiný obsah',
      text: () => 'Tyhle fondy nedrží totéž – liší se hlavně tím, do čeho investují, ne jen poplatkem.',
    },
  },
  /** Column labels. Desktop shows label + note; mobile shows the label (all fit one line at 320 px). */
  columns: {
    fund: 'Fond',
    index: 'Index',
    feeGroup: 'Poplatek fondu',
    dividendGroup: 'Dividendy a daň v USA',
    ter: 'TER',
    terNote: 'ročně',
    fee: 'Poplatek ročně',
    feeNote: (amount: string) => `v Kč, pro ${amount}`,
    yield: 'Dividendy za 12 měsíců',
    tax: 'Daň z dividend 15 %',
    /** Table headers: shorter labels, because the group header ("Dividendy a daň v USA") gives the context. */
    yieldTable: 'Dividendy',
    yieldNote: 'za 12 měsíců, historicky',
    taxTable: 'Daň z dividend',
    taxNote: '15 %, ročně, přibližně',
  },
  inspect: 'Prověřit',
  inspectAria: (ticker: string) => `Prověřit ${ticker} v kartě nahoře`,
  selected: 'v kartě',
  footnote: (rate: string, conversion: string) =>
    `Směna korun na dolary je pro všechny fondy stejná, proto ji v tabulce neuvádíme: modelová sazba ${rate}, tedy ${conversion} jednorázově. Dividendy jsou historické údaje za posledních 12 měsíců. Daň z dividend je zjednodušený historický příklad, ne předpověď a ne výpočet vaší daně.`,
}

/** Short Czech labels for what each fund holds (wireframe overview). */
export const fundShortLabels: Record<string, string> = {
  IVV: 'S&P 500',
  SCHD: 'dividendové akcie USA',
  SPY: 'S&P 500',
  SPYM: 'S&P 500',
  VOO: 'S&P 500',
  VT: 'akcie z celého světa',
  VTI: 'celý americký trh',
}

export const explainers = {
  title: 'Co se v tabulce poplatků neukáže',
  /** Wireframe S5 "Proč tři položky nesčítáme?" used as the section lead. */
  leadTitle: 'Proč tři položky nesčítáme?',
  lead: 'Každá je jiného druhu. Poplatek fondu se platí každý rok z celé investice. Směna se platí jen při převodu měny – a jen tehdy, když k němu dochází. Daň z dividend není cena fondu, ale daň z příjmu, kterou lze v ČR obecně započíst. Která položka je pro vás větší, záleží na brokerovi, měně účtu, době držení a vaší daňové situaci.',
  fee: {
    title: 'Poplatek fondu',
    body: (min: string, max: string, gap: string, tickers: string[]) =>
      `Strhává se průběžně z hodnoty fondu – každý rok, dokud ETF držíte. U sedmi fondů v prověrce je roční poplatek (TER) od ${min} do ${max}. Fondy se stejným indexem S&P 500 (${czList(tickers)}) se navzájem liší nejvýš o ${gap} procentního bodu.`,
    source: 'Zdroj: stránky emitentů, stav k datu uvedenému u každého fondu.',
  },
  conversion: {
    title: 'Směna korun na dolary',
    body: 'Platí se při převodu Kč na USD – podle brokera při nákupu, nebo už při vkladu na dolarový účet. Při prodeji a převodu zpět na koruny se platí znovu.',
    model: 'Na kartě ji počítáme z modelové sazby, kterou si můžete upravit podle svého brokera. Odkud je výchozí hodnota, popisuje metodika.',
    modelLink: 'Metodika ↓',
  },
  dividendTax: {
    title: 'Daň z dividend v USA',
    w8benTitle: 'Co je formulář W-⁠8BEN?',
    w8ben: 'Americký formulář, kterým potvrzujete, že jste daňový rezident jiné země. Vyplňuje se u brokera – neposílá se americkému daňovému úřadu (IRS). Daňovým rezidentům ČR díky smlouvě o zamezení dvojího zdanění snižuje daň z amerických dividend z 30 % na 15 %. Platí do konce třetího kalendářního roku po podpisu, pokud se mezitím nezmění vaše okolnosti.',
    w8benSource: 'Zdroj: IRS – About Form W-⁠8BEN; Instructions for Form W-⁠8BEN (10/2021); smlouva ČR–USA, č. 32/1994 Sb., čl. 10.',
    czTitle: 'Jak se v ČR daní dividendy z USA?',
    cz: 'Zahraniční dividendy jsou v ČR zdanitelným příjmem. Daň zaplacenou v USA lze podle smlouvy o zamezení dvojího zdanění obecně započíst proti české dani. Uschovejte si potvrzení o sražené dani. Jak to vychází ve vaší situaci, ověřte s daňovým poradcem.',
    czSource: 'Zdroj: zákon č. 586/1992 Sb., § 8, § 16a, § 38f; smlouva ČR–USA, č. 32/1994 Sb., čl. 24.',
  },
  kid: {
    title: 'Proč evropští brokeři americká ETF obvykle nenabízejí?',
    body: 'Evropské nařízení PRIIPs vyžaduje, aby prodejce předal drobnému investorovi před nákupem sdělení klíčových informací (KID). Emitenti amerických ETF ho obvykle nevydávají, a tak broker nákup zablokuje. Omezení dopadá na brokera, ne na investora, a netýká se profesionálních klientů.',
    source: 'Zdroj: nařízení (EU) č. 1286/2014, čl. 5 a 13; FAQ Interactive Brokers „PRIIPs regulation“.',
  },
  czSale: {
    title: 'Kdy se v ČR neplatí daň z prodeje?',
    body: 'Příjem z prodeje cenných papírů je osvobozen, pokud mezi nákupem a prodejem uplynuly víc než 3 roky – počítá se u každého nákupu zvlášť. Osvobozený je i tehdy, když vaše celkové příjmy z prodeje cenných papírů za rok nepřesáhnou 100 000 Kč – počítá se prodejní cena, ne zisk. Výjimky platí např. pro cenné papíry v obchodním majetku.',
    source: 'Zdroj: zákon č. 586/1992 Sb., § 4 odst. 1 písm. t) a u) (znění k 1. 8. 2026). Nejde o daňové poradenství.',
  },
}

export const checklist = {
  title: 'Checklist před prvním nákupem',
  items: [
    {
      title: 'Nabízí váš broker fond drobným investorům?',
      body: 'U ETF registrovaných v USA obvykle ne – jejich emitenti zpravidla nevydávají dokument KID, který vyžaduje regulace PRIIPs.',
    },
    {
      title: 'V jaké měně máte účet a kolik stojí směna?',
      body: 'Sazbu najdete v sazebníku brokera. Platí se při každém převodu korun na dolary a zpět.',
    },
    {
      title: 'Máte u brokera vyplněný W-⁠8BEN?',
      body: 'Bez něj se z amerických dividend může strhávat až 30 % místo 15 %. Formulář se vyplňuje u brokera, ne u IRS.',
    },
    {
      title: 'Dividendy se daní i v ČR',
      body: 'Daň zaplacenou v USA lze podle smlouvy o zamezení dvojího zdanění obecně započíst. Uschovejte si potvrzení o sražené dani.',
    },
    {
      title: 'Prodej: 3 roky a 100 000 Kč',
      body: 'Časový test 3 let se počítá u každého nákupu zvlášť. Limit 100 000 Kč za rok se týká prodejních cen, ne zisku.',
    },
  ],
  /** Shown only when the data confirms that every fund distributes. */
  distributing: (count: number) => ({
    title: `Všech ${count} fondů z prověrky dividendy vyplácí`,
    body: 'Žádný z nich je automaticky nereinvestuje – dividendy dostáváte na účet.',
  }),
  adviser: 'Svou situaci ověřte s daňovým poradcem.',
}
