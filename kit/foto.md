# Bilder i demosider

Ekte fotografier, riktig motiv, riktig beskåret. Et feil bilde er verre enn
ingen bilde — en tom plass ser ut som en skisse, et galt motiv ser ut som vi
ikke har lest nettsiden deres.

## Rekkefølgen

1. **Deres egne bilder først.** Ligger det brukbare bilder på nettsiden deres,
   bruk dem. Last ned til `img/`, ikke lenk til deres server.
2. **Unsplash for resten.** Last ned til `img/` — demoen skal ikke avhenge av
   eksterne lenker som kan endre seg.

## Unsplash-oppskrift

```
https://images.unsplash.com/photo-<id>?w=1600&q=80&auto=format&fit=crop
```

- `w=1600` for hero og store flater, `w=900` for kort og sidebilder.
- Last ned med `Invoke-WebRequest -Uri <url> -OutFile img/<navn>.jpg`.
- **Bruk bare en ID du vet er ekte.** Unsplash er bot-beskyttet, så du kan ikke
  søke opp ID-er. Gjett aldri en ID — da får du 404 og en tom plass.
- Har du ingen verifisert ID: bruk prospektets egne bilder, eller et bilde som
  allerede ligger i repoet (`galik/img`, `nordiccare/img`, `roi-division/img` …)
  og som ikke er brukt i en av de nyeste demoene.
- **Åpne bildet og se på det før du bruker det** (`read_image`). Sjekk motiv,
  beskæring og at det ikke inneholder logoer eller gjenkjennelige ansikter.
- Filnavn med innhold: `hero.jpg`, `verksted.jpg`, `mote.jpg` — ikke `bilde1.jpg`.

## Motivrege

- Bygg og anlegg: ekte anlegg, maskiner, arbeid på plass. Ikke dressfolk i møte.
- Advokat og rådgivning: dokumenter, hender, rolige kontorer — ikke hammer.
- Helse: hender, lys, ro. Aldri stetoskop-klisjé rett i kamera.
- Servering: mat og rom i bruk. Ikke tomme bord med tente lys.
- Teknologi: skjermer med ekte arbeid, ikke blå Abstract-kuler.

## Folk

- **Aldri stockbilder som navngitte ansatte.** Skal demoen vise teamet, bruk
  deres egne portretter med navn de selv oppgir. Ellers: rollekort uten bilde.
- Ansikter i bakgrunnen av et arbeidsbilde er greit; en navngitt person er det ikke.

## Teknisk

- `alt` på hvert bilde — beskriv motivet, ikke «bilde».
- `width` og `height` på hvert bilde (hindrer layouthopp).
- `loading="lazy"` under folden, `fetchpriority="high"` på hero.
- Hero ≤ 250 kB, hele siden ≤ 1,5 MB. Komprimer med `-q 80` og riktig bredde.
- `object-fit: cover` med en definert høyde/aspekt — aldri strukket bilde.
