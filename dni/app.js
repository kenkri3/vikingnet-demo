/* DNI — demointeraksjon.
   Alt kjører lokalt i nettleseren. Ingen data sendes, ingenting lagres. */

(function () {
  'use strict';

  var reduserBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  };

  /* ---------------- Mobilmeny ---------------- */

  var meny = document.getElementById('meny');
  var menyKnapp = document.getElementById('menuBtn');

  if (meny && menyKnapp) {
    var setMeny = function (open) {
      meny.classList.toggle('is-open', open);
      menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    menyKnapp.addEventListener('click', function () {
      setMeny(!meny.classList.contains('is-open'));
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && meny.classList.contains('is-open')) {
        setMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMeny(false);
    });
  }

  /* ---------------- Provisjoneringsskisse ---------------- */

  var form = document.getElementById('provForm');
  var velgKommuner = document.getElementById('antallKommuner');
  var velgTeam = document.getElementById('antallTeam');
  var velgAnsatte = document.getElementById('antallAnsatte');
  var sumTekst = document.getElementById('provSum');
  var kjorKnapp = document.getElementById('provRun');
  var nullKnapp = document.getElementById('provReset');
  var liste = document.getElementById('provList');
  var loggBoks = document.getElementById('provLog');
  var tilstand = document.getElementById('provState');
  var meter = document.getElementById('provMeter');
  var fyll = document.getElementById('provFill');
  var tallKontoer = document.getElementById('tallKontoer');
  var tallTeam = document.getElementById('tallTeam');
  var tallKanaler = document.getElementById('tallKanaler');

  if (form && liste && kjorKnapp && nullKnapp) {
    var kjoring = 0;
    var kjorer = false;

    var lesValg = function () {
      var kommuner = parseInt(velgKommuner.value, 10);
      var team = parseInt(velgTeam.value, 10);
      var ansatte = parseInt(velgAnsatte.value, 10);
      return {
        kommuner: kommuner,
        team: team,
        ansatte: ansatte,
        kontoer: kommuner * team * ansatte,
        teamTotalt: kommuner * team,
        kanaler: kommuner * team * 3
      };
    };

    var formater = function (n) {
      return n.toLocaleString('nb-NO');
    };

    var oppdaterSum = function () {
      if (kjorer) return;
      var v = lesValg();
      sumTekst.textContent =
        v.kommuner + (v.kommuner === 1 ? ' kommune' : ' kommuner') +
        ' · ' + v.teamTotalt + ' team · ' + formater(v.kontoer) + ' kontoer';
    };

    var settTilstand = function (tekst, klasse) {
      tilstand.className = 'panel__state' + (klasse ? ' ' + klasse : '');
      tilstand.innerHTML = '<span class="live" aria-hidden="true"></span>' + tekst;
    };

    var settMeter = function (prosent) {
      fyll.style.width = prosent + '%';
      meter.setAttribute('aria-valuenow', String(Math.round(prosent)));
    };

    var nullstillTall = function () {
      tallKontoer.textContent = '0';
      tallTeam.textContent = '0';
      tallKanaler.textContent = '0';
    };

    var leggTilLinje = function (tag, melding, tidTekst) {
      var li = document.createElement('li');
      var tid = document.createElement('span');
      var merke = document.createElement('span');
      var tekst = document.createElement('span');

      tid.className = 'log__t';
      tid.textContent = tidTekst;
      merke.className = 'log__tag';
      merke.textContent = tag;
      tekst.className = 'log__msg';
      tekst.textContent = melding;

      li.appendChild(tid);
      li.appendChild(merke);
      li.appendChild(tekst);
      liste.appendChild(li);
      loggBoks.scrollTop = loggBoks.scrollHeight;
      return li;
    };

    var tomListe = function () {
      liste.textContent = '';
    };

    var avslutt = function (tekst, klasse) {
      kjorer = false;
      kjorKnapp.disabled = false;
      kjorKnapp.textContent = 'Kjør provisjonering';
      nullKnapp.textContent = 'Nullstill';
      velgKommuner.disabled = false;
      velgTeam.disabled = false;
      velgAnsatte.disabled = false;
      settTilstand(tekst, klasse);
      oppdaterSum();
    };

    var start = async function () {
      var v = lesValg();
      var id = ++kjoring;
      var steg = 0;
      var totalSteg = v.kommuner * 6;
      var sekunder = 0;
      var kontoer = 0;
      var team = 0;
      var kanaler = 0;
      var pause = reduserBevegelse ? 60 : 150;

      kjorer = true;
      kjorKnapp.disabled = true;
      kjorKnapp.textContent = 'Kjører …';
      nullKnapp.textContent = 'Avbryt';
      velgKommuner.disabled = true;
      velgTeam.disabled = true;
      velgAnsatte.disabled = true;
      settTilstand('Kjører', 'is-running');
      tomListe();
      nullstillTall();
      settMeter(0);

      var skriv = async function (tag, melding) {
        sekunder += 0.3 + Math.random() * 0.5;
        await sleep(pause);
        if (id !== kjoring) return false;
        leggTilLinje(tag, melding, '+' + sekunder.toFixed(1).replace('.', ',') + ' s');
        steg += 1;
        settMeter((steg / totalSteg) * 100);
        return true;
      };

      for (var k = 1; k <= v.kommuner; k += 1) {
        var navn = 'Kommune ' + String(k).padStart(2, '0');
        var perKommune = v.team * v.ansatte;
        var grupper = Math.round(perKommune * 0.75);

        if (!(await skriv('HR', navn + ' · HR-kilde tilkoblet (CSV + webhook)'))) return;
        if (!(await skriv('SQL', navn + ' · SELECT * FROM Employees WHERE Hired = true → ' + perKommune + ' rader'))) return;
        if (!(await skriv('ENTRA', navn + ' · ' + perKommune + ' kontoer opprettet med UPN fra navnemal'))) return;

        kontoer += perKommune;
        tallKontoer.textContent = formater(kontoer);

        if (!(await skriv('RBAC', navn + ' · ' + grupper + ' gruppetildelinger etter stilling'))) return;
        if (!(await skriv('TEAMS', navn + ' · ' + v.team + ' team opprettet · ' + v.team * 3 + ' kanaler'))) return;

        team += v.team;
        kanaler += v.team * 3;
        tallTeam.textContent = formater(team);
        tallKanaler.textContent = formater(kanaler);

        if (!(await skriv('LOGG', navn + ' · ' + (perKommune + v.team) + ' hendelser skrevet til revisjonslogg'))) return;
      }

      if (id !== kjoring) return;

      var ferdig = document.createElement('li');
      ferdig.className = 'log__done';
      ferdig.textContent = 'Fullført · ' + steg + ' steg · 0 feil ';
      var tidsbruk = document.createElement('span');
      tidsbruk.textContent = '· simulert på ' + sekunder.toFixed(1).replace('.', ',') + ' s';
      ferdig.appendChild(tidsbruk);
      liste.appendChild(ferdig);
      loggBoks.scrollTop = loggBoks.scrollHeight;

      settMeter(100);
      avslutt('Fullført', 'is-done');
      kjorKnapp.textContent = 'Kjør igjen';
    };

    var nullstill = function () {
      kjoring += 1;
      kjorer = false;
      tomListe();
      var tom = document.createElement('li');
      tom.className = 'log__empty';
      tom.textContent = 'Velg omfang og trykk «Kjør provisjonering» for å se flyten.';
      liste.appendChild(tom);
      nullstillTall();
      settMeter(0);
      avslutt('Klar', '');
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!kjorer) start();
    });

    nullKnapp.addEventListener('click', function () {
      if (kjorer) {
        kjoring += 1;
        settMeter(0);
        avslutt('Avbrutt', '');
      } else {
        nullstill();
      }
    });

    velgKommuner.addEventListener('change', oppdaterSum);
    velgTeam.addEventListener('change', oppdaterSum);
    velgAnsatte.addEventListener('change', oppdaterSum);

    oppdaterSum();
  }

  /* ---------------- Kontaktskjema (mailto) ---------------- */

  var kontaktSkjema = document.getElementById('kontaktForm');
  var kontaktStatus = document.getElementById('kontaktStatus');

  if (kontaktSkjema && kontaktStatus) {
    kontaktSkjema.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!kontaktSkjema.reportValidity()) return;

      var navn = document.getElementById('feltNavn').value.trim();
      var epost = document.getElementById('feltEpost').value.trim();
      var virksomhet = document.getElementById('feltVirksomhet').value.trim();
      var melding = document.getElementById('feltMelding').value.trim();

      var emne = 'Henvendelse fra ' + navn + (virksomhet ? ' · ' + virksomhet : '');
      var kropp = [
        'Navn: ' + navn,
        'E-post: ' + epost,
        virksomhet ? 'Virksomhet: ' + virksomhet : '',
        '',
        melding
      ].join('\r\n');

      window.location.href =
        'mailto:salg@dni.no?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(kropp);

      kontaktStatus.textContent =
        'E-postklienten din åpnes med meldingen ferdig utfylt. Kommer den ikke opp, skriv til salg@dni.no.';
      kontaktStatus.classList.add('is-done');
    });
  }

})();
