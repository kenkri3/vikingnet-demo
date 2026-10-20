# Retningslinjer for demosider

Målet er at hver demo skal se ut som en ferdig, påkostet nettside — ikke som en
mal med ny logo. Les dette før du skriver én linje. Reglene er ikke pynt:
`kit/qa.html` måler dem, og en demo som ikke består, blir ikke lenket.

## Fire arketyper — velg én, og velg ulikt forrige demo

| Arketype | Passer | Typografi | Palett | Hero |
|---|---|---|---|---|
| **Redaksjonell** | advokat, rådgivning, regnskap, konsulent | Serif display + nøytral sans | Varm off-white, blekk, én dyp aksent | Stort, rolig overskriftfelt med luft og én bredde-følelse |
| **Industriell** | bygg, anlegg, transport, industri | Kondensert sans, store tall | Betonggrå, stål, sikkerhetsgul eller -oransje | Fullbredde foto med mørkt slør og hard venstrejustert tekst |
| **Varm/håndverk** | verksted, håndverker, gård, lokalmat | Rund serif + humanistisk sans | Jordfarger, leire, lin, grønt | Splittet: tekst venstre, nærbilde av arbeid høyre |
| **Klinisk/rolig** | helse, tannlege, terapi, velvære | Geometrisk sans, mye luft | Hvit, kjølig grå, én myk aksent | Mye tomrom, sentrert eller asymmetrisk tekst, ett stille bilde |

**Unikhetskravet:** to demoer skal ikke dele både palett, hero-form og
seksjonsrekkefølge. Sjekk de nyeste mappene i repoet før du velger.

## Sidens anatomi (varier rekkefølgen, men ha med det som gir mening)

1. Header med logo, tre–fire lenker og én tydelig handling.
2. Hero: hvem de er, hva de gjør, for hvem — på under 12 ord i overskriften.
3. Bevis: tall de selv oppgir, sertifiseringer, år i drift, kunder de nevner.
4. Tjenester/produkter: tre til seks, hver med én konkret setning.
5. Prosess eller «slik jobber vi»: tre steg, nummerert.
6. Om/mennesker: bare ekte navn og roller fra deres egen side.
7. Kontakt: skjema (mailto-fallback), telefon, adresse, åpningstider.
8. Footer: org.nr, adresse, e-post, årstall.

## Innhold — absolutt

- Bare fakta fra deres egen nettside eller Enhetsregisteret. Ingen oppdiktede
  tall, kunder, sitater, ansatte eller priser.
- Mangler vi et faktum, fjerner vi setningen. Vi dikter ikke.
- Norsk med korrekte æ, ø, å. Aldri engelsk der kunden er norsk.
- Ingen «Demo laget av …» i footer, ingen lorem, ingen plassholdernavn.
- Bilder av mennesker: bare deres egne, og bare med navn de selv oppgir.
  Ellers viser vi rollekort uten ansikt. Aldri stockbilde som navngitt person.

## Én interaksjon som viser programvare

Hver demo skal ha minst én ting brukeren kan gjøre, ikke bare lese:

- **Booking:** velg tjeneste → dato → ledig tid → bekreftelse (client-side).
- **Chat:** en liten, ærlig demobot som svarer på priser, åpningstider og booking
  med svar hentet fra deres egen side. Merkes som skisse.
- **Kalkulator:** regn ut pris eller besparelse med deres egne publiserte satser.
- **Søknad/skjemaflyt:** steg for steg med oppsummering før innsending.

Alt client-side. Ingen backend, ingen innsamling av data.

## Tekniske krav

- `lang="nb"`, `<title>`, `meta description`, Open Graph-bilde og -tittel.
- `base.css` → `theme.css` → `styles.css`, i den rekkefølgen.
- Maks to fontfamilier. `display=swap`, `preconnect` hvis Google Fonts.
- Alle bilder: `alt`, `width`, `height`, `loading="lazy"` under folden.
- Hero-bilde ≤ 250 kB, hele siden ≤ 1,5 MB.
- Ingen horisontal scroll i 360, 390, 768, 1024 eller 1440 px.
- Trykkflater ≥ 44 px. Skjemafelt 16 px font (hindrer iOS-zoom).
- Tastaturfokus synlig. Kontrast minst AA.
- `prefers-reduced-motion` respekteres.

## Før publisering

1. `python -m http.server` eller tilsvarende i repo-roten.
2. Åpne `kit/qa.html?side=<slug>` og se at alle fem bredder er PASS.
3. `node demo-verify.mjs <slug>` i aichat-ops — 200 på alt, ingen malrester.
4. Ta skjermbilde av forsiden i 390 og 1440 px og se på det. Ødelagt bilde,
   avkuttet tekst eller feil motiv er stopp.
5. Først da committes mappen og lenken brukes i en e-post.
