# Prověrka ETF

Landing page pro porovnání amerických ETF určená českým drobným investorům. Projekt vznikl jako řešení zadání B – Konverzní landing page.

[**Live demo**](https://etf-landing-page-one.vercel.app/)  
[**GitHub:**](https://github.com/wajfy/ETF_LandingPage) 

## 1. Cíl projektu

Cílem bylo vytvořit landing page, která návštěvníkovi rychle poskytne užitečné informace o ETF a následně ho motivuje k získání kompletního srovnání a checklistu výměnou za e-mail.

Hlavními cíli byly:
- rychle vysvětlit, co návštěvník získá;
- nabídnout hodnotu ještě před vyplněním formuláře;
- navrhnout jednoduchý mobilní funnel;
- používat reálná data se zdroji a datem;
- připravit projekt pro nasazení a další měření konverzí.

## 2. Cílová skupina a produktové rozhodnutí

Primární cílovou skupinou jsou čeští drobní investoři, kteří se zajímají o ETF obchodovaná na NYSE a NYSE Arca. Počítám zejména s lidmi, kteří porovnávají známé americké fondy, ale nemusí mít jasno v rozdílech mezi poplatky, dividendami a měnovou konverzí.

zvolil následující přístup:

- **Okamžitá hodnota:** základní porovnání a orientační výpočet jsou dostupné přímo na stránce.
- **Lead magnet:** kompletní srovnání ETF a checklist pro jejich posouzení.
- **Formulář:** pouze e-mailová adresa, bez dalších polí a marketingového souhlasu.
- **Po odeslání:** materiál se odešle e-mailem; demonstrační režim tuto akci pouze simuluje.

Rozhodl jsem se zaměřit na americké ETF a evropské alternativy nepoužívat jako hlavní součást srovnání. Díky tomu zůstává produkt konkrétní a návštěvník porovnává fondy v rámci stejného trhu.

Stránka zároveň upozorňuje na omezení nákupu amerických ETF evropskými retailovými investory. Neprezentuje je jako univerzálně dostupné produkty ani jako investiční doporučení.

## 3. Struktura stránky a důvod pořadí sekcí

1. **Úvodní obrazovka a orientační výpočet**  
   Návštěvník rychle zjistí, co stránka nabízí, a může si prohlédnout konkrétní čísla bez registrace.

2. **Výběr a porovnání ETF**  
   Uživatel může přepínat mezi sedmi fondy. Nejdřív dostane praktickou hodnotu, teprve potom nabídku dalšího materiálu.

3. **Vysvětlení nákladů a důležitých rozdílů**  
   Odděluji průběžný poplatek fondu, jednorázovou měnovou konverzi a americkou srážkovou daň z dividend. Nejde o jednu univerzální položku „celkové náklady“.

4. **Lead magnet a formulář**  
   Po získání kontextu má návštěvník jasnější představu, proč by mohl chtít kompletní srovnání a checklist.

5. **Metodika a zdroje**  
   U finančního tématu považuji za důležité vysvětlit, odkud data pocházejí, k jakému datu platí a jaké mají výpočty limity.

Pořadí vychází z principu: nejdřív ukázat hodnotu, potom vysvětlit souvislosti a až následně žádat o kontakt.

## 4. ETF data a výpočty

Stránka porovnává sedm amerických ETF:

| Ticker | Zaměření | Roční poplatek fondu |
|---|---|---:|
| VOO | S&P 500 | 0,03 % |
| SPY | S&P 500 | 0,0945 % |
| IVV | S&P 500 | 0,03 % |
| SPYM | S&P 500 | 0,02 % |
| VTI | Americký akciový trh | 0,03 % |
| VT | Globální akciový trh | 0,06 % |
| SCHD | Americké dividendové akcie | 0,06 % |

U nákladů rozlišuji:
- průběžný poplatek fondu;
- jednorázovou měnovou konverzi;
- americkou srážkovou daň z dividend.

Výchozí sazba měnové konverze je 0,5 % a návštěvník ji může upravit. Jde o modelový předpoklad, nikoli o univerzální sazbu všech brokerů. Použité sazby a daňové informace mají uvedený zdroj a datum.

Výpočty jsou orientační. Stránka neslouží jako individuální daňové poradenství ani jako doporučení k nákupu konkrétního fondu.

## 5. Očekávaná konverze a A/B testování

Pro první verzi stanovuji **pracovní odhad konverze 3 %** z návštěv landing page na úspěšně přijatý požadavek na e-mailový materiál. Nejde o naměřený ani o ověřený výsledek. 

Při 1 000 návštěvách by to znamenalo přibližně 30 požadavků. Pro vyhodnocení bych sledoval také jednotlivé kroky funnelu, nejen konečný počet e-mailů.

### Hypotézy pro A/B testy

**1. Hodnota na první obrazovce – nejvyšší očekávaný dopad**

Porovnat úvodní obrazovku s okamžitě viditelným výpočtem nákladů proti variantě, která klade větší důraz na samotné porovnání fondů. Hypotéza: konkrétní finanční příklad rychleji vysvětlí přínos stránky a zvýší podíl návštěvníků, kteří pokračují.

**2. Umístění a formulace nabídky lead magnetu**

Porovnat současnou nabídku kompletního srovnání a checklistu s výraznějším vysvětlením, co přesně návštěvník e-mailem získá. Hypotéza: konkrétnější popis materiálu zvýší počet odeslaných formulářů.

**3. Způsob prezentace interaktivního porovnání**

Porovnat současný výběr jednoho fondu s variantou, která více zdůrazňuje přímé rozdíly mezi vybranými ETF. Hypotéza: srozumitelnější srovnání usnadní rozhodování a zvýší zájem o kompletní materiál.

Hypotézy jsou seřazené podle očekávaného dopadu, nikoli podle výsledků experimentů. Žádný A/B test zatím nemá naměřené výsledky. Před testováním bych stanovil primární metriku a zajistil dostatečný počet návštěv.

## 6. Měření funnelu a analytika

Pro měření je připravená vlastní vrstva událostí oddělená od konkrétního analytického poskytovatele.

Plán zahrnuje například:
- `landing_view` – načtení stránky;
- `etf_selected` – změnu vybraného fondu;
- `result_viewed` – zobrazení výsledku;
- `lead_form_viewed` a `lead_form_started` – zobrazení a zahájení formuláře;
- `lead_submitted` – odeslání požadavku;
- `lead_email_accepted` – potvrzení, že Resend zprávu přijal;
- `conversion_rate_changed` – změnu sazby měnové konverze v kalkulačce.

Poslední událost je změna vstupu kalkulačky, nikoli konverzní míra landing page.

Samotná analytická vrstva je implementovaná, ale externí poskytovatel není připojen a produkční měření zůstává vypnuté. Události před souhlasem se nepřenášejí ani zpětně nedoplňují. Před aktivací analytiky je nutné rozhodnout o právním režimu, souhlasu a informacích o zpracování dat.

Bez identifikace návštěvníků lze zatím vyhodnocovat pouze orientační poměr událostí a návštěv načtené stránky. Nelze spolehlivě počítat unikátní návštěvníky napříč návštěvami.

## 7. Technické řešení

Použitý stack:

- React 19 a TypeScript;
- Vite 8;
- Tailwind CSS 4;
- Vitest;
- Vercel pro hosting a serverless API;
- Resend pro odesílání e-mailů.

### Proč nemám samostatný backend?

Projekt má poměrně malý rozsah. Nepotřebuje uživatelské účty, vlastní databázi ani dlouhodobé ukládání leadů. Proto jsem zvolil statický frontend a malý serverless endpoint `api/lead.ts`, který přijímá požadavky formuláře a předává e-maily poskytovateli.

Toto řešení je jednodušší na nasazení i údržbu a odpovídá rozsahu testovací úlohy. Pokud by produkt později potřeboval správu kontaktů, historii požadavků, segmentaci nebo pokročilejší ochranu proti zneužití, architekturu bych rozšířil.

### E-mailová integrace

Integrace Resend je implementovaná a otestovaná také na nasazené verzi. Zprávu jsem úspěšně obdržel do vlastní e-mailové schránky.

## 8. Jak probíhal vývoj s AI

Používal jsem Claude Code jako implementační nástroj a ChatGPT pro produktové rozhodování. Vývoj jsem rozdělil do menších etap, abych mohl průběžně kontrolovat výsledek.

### Jednotlivé fáze

- **Research:** vymezení cílové skupiny, výběr ETF, ověření poplatků, daňových souvislostí a zdrojů.
- **Init a návrh:** příprava technického základu, produktového zadání, struktury stránky a wireframu.
- **M1 – první obrazovka:** návrh vizuálního směru a kontrola mobilního rozložení.
- **M2 – porovnání ETF:** implementace dat, výpočtů, porovnání fondů a vysvětlujících sekcí.
- **M3 – lead flow:** formuláře, validace, serverless endpoint a Resend adapter s mock režimem.
- **M4 – analytika:** události funnelu, ochrana soukromí a příprava na budoucí analytický nástroj.
- **M5 – hardening:** validace, přístupnost, bezpečnostní konfigurace, dokumentace a ověřování sestavení pro Vercel.

Agent dostával úkoly s konkrétním rozsahem, požadavkem na testy a pokynem, aby neměnil již schválená produktová a vizuální rozhodnutí. Po každé etapě jsem kontroloval výstup a před dalšími většími změnami si nechával vysvětlit zjištěné problémy.

### Kde AI chybovala a jak jsem to kontroloval

Nejvýraznější příklad byl Vercel build. Běžné testy, TypeScript kontrola i produkční build procházely, ale první sestavená serverless funkce se nedokázala načíst v Node ESM kvůli relativním importům bez přípon a importu JSON bez potřebného atributu.

Problém jsme odhalili až sestavením přes Vercel CLI a načtením výsledné funkce pod Node 22. Oprava importů a regresní test následně problém zachytily.

Při kontrole formuláře se také ukázalo, že:
- původní mock potvrzení naznačovalo skutečné odeslání e-mailu;
- pole honeypotu mohlo být automaticky vyplněno prohlížečem;
- po chybě při odeslání se ztrácel fokus klávesnice;
- některé části README neodpovídaly aktuální implementaci.

Tyto problémy jsem řešil tak, že jsem výstup AI nepovažoval za hotový jen proto, že agent oznámil úspěšný build. Požadoval jsem konkrétní reprodukci, testy, nebo kontrolu v prohlížeči.

## 9. Testování a ověření

Během vývoje byly průběžně spouštěny testy, typecheck, lint a produkční build. Poslední zaznamenaná sada po úpravě demonstračního potvrzení měla 302 testů a všechny procházely.

Kontroloval jsem mimo jiné:
- výpočty a sdílení dat mezi stránkou a e-mailem
- validaci formuláře a chybové stavy
- opakované požadavky
- mock režim a skutečné odesílání přes Resend
- ochranu proti nechtěnému zveřejnění citlivých údajů
- mobilní rozložení a horizontální přetékání
- sestavení serverless funkce pro Node 22


## 10. Co je hotové a co zbývá

### Hotovo

- Funkční landing page a porovnání sedmi ETF.
- Interaktivní výpočet a vysvětlení jednotlivých nákladů.
- Formulář s minimem polí a e-mailový materiál.
- Integrovaný Resend, ověřený skutečným testovacím e-mailem.
- Mock režim pro bezpečnou demonstraci.
- Implementovaná, ale vypnutá analytická vrstva.
- Testy, build konfigurace a dokumentace postupu obnovy dat.

### Před ostrým provozem zbývá

- Doplnit sdílený rate limit, protože současné limity v paměti serverless instance nejsou dostatečné pro veřejné odesílání e-mailů.
- Ověřit chování Resend při opakování požadavků po definitivních a nejednoznačných chybách.
- Aktualizovat ETF data a všechny související sazby a právní reference.
- Vyřešit identitu provozovatele, informace o ochraně osobních údajů a dobu uchovávání dat.
- Prověřit právní požadavky na veřejné šíření srovnání finančních produktů a případné investiční doporučení.
- Rozhodnout o analytickém poskytovateli a souhlasech před aktivací měření.

## 11. Lokální spuštění

Po naklonování repozitáře:

```bash
npm install
npm run dev
```

Další příkazy a požadované environment variables jsou uvedené v `.env.example` a v dokumentaci projektu.
