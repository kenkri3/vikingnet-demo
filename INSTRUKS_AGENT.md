# Masterinstruks for Vikingnet Demoside-agenter

Denne instruksen definerer standarder, absolutte krav og kvalitetskriterier for alle AI-agenter som oppretter, oppgraderer eller vedlikeholder demosider i Vikingnet-porteføljen. 

---

## 1. Grunnprinsipper og Formål
En demoside skal fungere som et salgsfremmende innsalg overfor en reell bedriftseier. Siden må umiddelbart gi et førsteklasses, profesjonelt inntrykk av bedriftens merkevare.

* **Null feil:** Ingen skrapede CMS-rester, ingen feilplasserte bransjetekster og ingen uleselige logoer.
* **Autentisitet:** Ekte bilder fra bedriftens faktiske drift og relevante tjenestebeskrivelser.
* **Full responsivitet:** Perfekt visning på mobil, nettbrett, PC og 4K/TV.

---

## 2. Absolutte Krav til Eksklusjoner (Blacklist)
Før noe arbeid påbegynnes eller endringer gjøres, må listen over **ekskluderte bedrifter** respekteres 100 %.
* **182 bedrifter er strengt ekskludert:** Dette inkluderer bedrifter som allerede er kontaktet per e-post (f.eks. `catosbetongsaging`, samt de opprinnelige 158 + 11 variantene).
* **Regel:** Ingen filer i ekskluderte kataloger skal noensinne modifiseres, slettes, overskrives eller inkluderes i stikkprøver/kampanjer.
* Hold alltid en oppdatert `excluded_dirs.json` og valider mot denne før skriptkjøring.

---

## 3. Innholdsvask og Tekstkvalitet (Zero-Junk Rule)
Mange demosider genereres med utgangspunkt i rått skrapet innhold. Agenten **må** utføre en grundig vask:

### Ting som ALLTID skal fjernes:
1. **Nettbutikk- og søke-rester:**
   * Tekster som *«Søk etter produkter ×»*, *«Handlekurv 0 kr»*, *«Du har ingen produkter i handlekurven»*, *«Betal med Klarna»*.
2. **Avbrutte cookie-bannere:**
   * F.eks. *«Derfor benytter vi cookies for å sikre at du får en best mulig...»* som slutter midt i en setning.
3. **Navigasjonsbruddstykker:**
   * *«Skip to content»*, *«Meny. Home Kroner & Broer»*, rå piler (`-->`), font-ikoner (f.eks. ``), uformaterte telefonnumre i brødtekst.
4. **Feilplassert bransjeinnhold:**
   * Tekst fra en annen bedrift (f.eks. biltakst-tekst på en luftrenser-side, eller rørleggertekst på et regnskapskontor).
5. **Spesifikke varenummer som tjenestetitler:**
   * Unngå spesifikke kjemikalier eller deler (f.eks. *«Melpool Muli Floc GEL-pad»*) som overskrift på et tjenestekort. Bruk kategorinavn som *«Vannpleie & bassengkjemi»*.
6. **Tegnsett- og entitetsfeil:**
   * Rettelser av `&amp;nbsp;`, doble mellomrom i firmanavn (*«AB Bil&nbsp; AS»*), og feil som *«V i tilbyr»*.

### Krav til tjenestekort og verdier:
* **4 veldefinerte tjenestekort:** Hvert kort skal ha et logisk nummer (`01`–`04`), en presis tittel med stor forbokstav (ikke blokkbokstaver), en profesjonell ingress (2 linjer), en handlingslenke (`Be om tilbud →`), og et **relevant bilde**.
* **4 distinkte verdier:** I `.verdier` skal det alltid være 4 overskrifter (`<h3>`) med forklarende tekst (`<p>`) som fremhever reell kundeverdi (f.eks. *Punktlig levering*, *Fagmessig kompetanse*, *Garantier*, *Personlig oppfølging*).
* **Kontaktskjema:** `<select name="type">` skal inneholde de nøyaktig samme 4 tjenestene som kortene, pluss «Annet».

---

## 4. Bildebruk og Visuell Relevans
En av de vanligste feilene er bruk av irrelevante eller tilfeldige bilder.

* **Relevansregel:** 
  * Et kort om *Tannkroner* må vise en tannkrone eller laboratoriearbeid – aldri en tilfeldig resepsjon eller kontorblokk.
  * Et kort om *Massasjebad* må vise et spabad – ikke en kaffekopp.
  * Et kort om *Budtjenester* må vise varebil/transport – ikke et kontorlandskap.
* **Hent autentiske bilder:** 
  * Lån faktiske bilder fra bedriftens eksisterende nettside dersom tilgjengelig (`img/live-foto-*` eller `img/01-...` til `img/12-...`).
  * Sjekk alltid at bildekilden faktisk eksisterer på disk (aldri pek til en fil som gir 404).
* **Ingen tomme kort:** Alle kort skal ha bilde (`<div class="kort__bilde"><img ...></div>`). Ingen kort skal mangle bildefelt.

---

## 5. Header- og Logo-kontrast (Kontrastregelen)
Teksten eller logoen i headeren (`.topp`) må **aldri** bli usynlig.

### Matematisk kontrastkrav:
Forskjellen i lysstyrke mellom headerens bakgrunn ($B_{bak}$) og logoens/tekstens farge ($B_{logo}$) skal være **$\ge 70$**:
$$B = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

### Regler for logoer:
1. **SVG-logoer:**
   * Mange logoer eksporteres opprinnelig for mørk bakgrunn med `.cls-1{fill:#fff;}`. 
   * **På lys header:** SVG-fyll/strek **må** endres til bedriftens mørke profilfarge (`var(--blekk)` / f.eks. `#111827`, `#003143`).
   * **På mørk header:** SVG-fyll/strek settes til lys kontrastfarge (`var(--blekk)` / `#ffffff`).
2. **Transparente PNG-logoer:**
   * Hvite logo-piksler på transparent bakgrunn blir usynlige på lys header.
   * Konverter hvite/lyse piksler til bedriftens `--blekk`-farge via bildebehandling (bevar nøyaktig alfakanal for myke anti-aliased kanter).
3. **Merketekst (`.merke`):**
   * Skal alltid arve eller eksplisitt styles med `color: var(--blekk)`.
   * Skal inneholde bedriftens faktiske navn, ikke generiske slagord.

---

## 6. Responsiv Arkitektur (Alle Skjermtyper)
Alle sider skal tilpasses følgende fire skjermklasser via standard CSS:

| Enhet | Skjermbredde | Krav til layout og typografi |
| :--- | :--- | :--- |
| **Mobil** | 320px – 640px | 1-kolonne kortrutenett (`grid-template-columns: 1fr`). Minimum 44x44px trykkflater på knapper/lenker. Fast minimum 16px fontstørrelse på inputs for å unngå automatisk zooming i iOS Safari. Skjul desktop-knapper i topp; bruk ren mobilmeny. |
| **Nettbrett / Pad** | 641px – 1024px | 2-kolonne balansert rutenett (`repeat(2, 1fr)`). Tilpasset horisontal padding (1.5rem–2rem) og jevn flyt. |
| **PC / Laptop** | 1025px – 1920px | 3- og 4-kolonners visning med jevnhøye kort (`display: flex; flex-direction: column`). Full desktop-meny i topp. |
| **TV / 4K / Storskjerm** | 1920px+ | Maksimal container-bredde (`max-width: 1540px`) sentrert i viewport så innholdet ikke strekker seg uleselig bredt ut. Flytende skalert typografi (`clamp()`). Tydelig `:focus-visible` med 3px outline for tastatur- og fjernkontrollnavigasjon. |

---

## 7. Regler for Lokal Utvikling og Portbruk
* **Port 3000 er strengt forbudt:** Bruk aldri port 3000 for lokal testing eller servere.
* **Bruk godkjent port:** Standard port for lokal forhåndsvisning er **`http://localhost:8080/`**.
* **Kjøring:** Serveren skal kjøre som en fler-trådet lokal HTTP-server som støtter parallelle forespørsler og umiddelbar levering av statiske filer.

---

## 8. Uttak av Stikkprøver (Kvalitetssikring)
Når brukeren ber om stikkprøver:
1. **Aldri velg alfabetisk:** Ikke plukk de fire første mappene (`a-bil`, `a-stab`, etc.).
2. **Spredning:** Velg tilfeldige kandidater fra vidt forskjellige bransjer (f.eks. én håndverker, én transportør, én helse/velvære, én bilforhandler/butikk).
3. **Pre-inspeksjon før levering:** Agenten må *først* inspisere og rette de 4 sidene (vaske tekster, sjekke bilder, verifisere logo i header og teste at port 8080 returnerer HTTP 200) før linkene presenteres for brukeren.

---

## 9. GitHub-leveranse og Versjonskontroll
* Alle fullførte endringer skal pushes til GitHub på repositoryets `main`-branch:
  `https://github.com/kenkri3/vikingnet-demo.git`
* **Commits:** Strukturerte og beskrivende commit-meldinger på norsk som spesifiserer nøyaktig hva som er utbedret (f.eks. *«Kvalitetssikring: Korrigert fargekontrast for header-logoer (SVG og PNG) på tvers av alle nettsider»*).
* Verifiser alltid remote SHA via Git eller MCP etter push.

---

## 10. Agentens Sjekkliste før Godkjenning
Før en oppgave markeres som ferdig, må agenten kunne krysse av for følgende:

- [ ] Er alle 182 ekskluderte mapper urørt?
- [ ] Er alle skrapede tekstrester (handlekurver, søk, avbrutte cookies) 100 % fjernet?
- [ ] Er det 4 ryddige tjenestekort med relevante, autentiske bilder?
- [ ] Er header-logoen og bedriftsnavnet fullt synlig med solid kontrast på både forside og samtlige undersider?
- [ ] Skalerer layouten plettfritt fra 320px mobil til 4K storskjerm?
- [ ] Kjører testserveren på port 8080 (og IKKE port 3000)?
- [ ] Er alle endringer kommitert og pushet til GitHub `main`?
