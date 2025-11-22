# ThinkMath – interaktiivinen matematiikan harjoittelusivusto

**ThinkMath** on alakoulun oppilaille suunnattu verkkosovellus, jossa harjoitellaan matematiikan perusteita pelillisten tehtävien avulla.  
Sivusto sisältää kolme erilaista peliä: **Yhteenlasku**, **Vähennyslasku** ja **Vertailutehtävät**, joissa kaikissa on useita vaikeustasoja ja vuorovaikutteisia tehtävätyyppejä.

Sovellus toimii selaimessa ilman rekisteröintiä, eikä se tallenna henkilötietoja – ainoastaan pelitulokset käyttäjän omaan selaimeen (localStorage).

 **Live-demo:**  
https://irina-ge.github.io/matikka-harjoittelu/

**Projektin lähdekoodi:**  
https://github.com/irina-ge/matikka-harjoittelu  

---

## Sisältö

- [Johdanto](#johdanto)
- [Pelit](#pelit)
- [Teknologiat](#teknologiat)
- [Ominaisuudet](#ominaisuudet)
- [Saavutettavuus](#saavutettavuus)
- [Asennusohje](#asennusohje)
- [Lisenssi](#lisenssi)

---

## Johdanto

ThinkMath kehitettiin osana **Yritys- tai hankelähtöinen tuotekehitysprojekti (AMK)** -opintojaksoa.  
Tavoitteena oli suunnitella ja toteuttaa selkeä, visuaalisesti miellyttävä ja saavutettava oppimisympäristö matemaattisten peruslaskutoimitusten harjoitteluun.

Projekti toteutettiin käyttäjälähtöisesti hyödyntäen palvelumuotoilun periaatteita:  
selkeä ohjeistus, yhtenäiset käyttöliittymäkomponentit, lapsiystävällinen visuaalinen ilme ja responsiivinen toimivuus.

---

## Pelit

### **1. Yhteenlasku**
- 3 vaikeustasoa (A, B, C)
- Tehtävätyypit:
  - valitse oikea vastaus,
  - täytä puuttuva luku (drag & drop),
  - valitse oikea lauseke.

### **2. Vähennyslasku – Lukusuora-seikkailu**
- 3 tasoa, joissa eri laskutyypit (a – b, ? – b = c, a – b – c)
- Vastataan valitsemalla oikea kohta lukusuoralla
- Havainnollistaa vähentämistä askel askeleelta

### **3. Vertailutehtävät**
- Pelimuodot:
  - valitse oikea merkki (< > =)
  - kumpi on enemmän?
  - järjestä luvut pienimmästä suurimpaan
- Tasot A–C (luvut, kymmenluvut, lausekkeet)

---

## Teknologiat

Sivusto on toteutettu ilman backend-komponentteja:

- **HTML5**
- **CSS3** (räätälöity pelityyli + Bootstrap 5)
- **JavaScript (vanilla)**
- **GitHub Pages** – julkaisualusta
- **Google Fonts** – Baloo-fontti

---

## Ominaisuudet

- 10 tehtävää jokaisessa pelikierroksessa  
- Tulokset tallentuvat automaattisesti selaimen localStorageen  
- Responsiivinen mobiilituki  
- Lapsiystävällinen väripaletti ja isot painikkeet  
- Yhtenäinen käyttöliittymä kaikissa peleissä  
- Drag & drop -tehtäviä  
- Välitön palaute (“Hienoa ✔ / Väärin ✖”)  
- Saavutettavuus huomioitu (WCAG 2.1)

---

## Saavutettavuus

Lighthouse-analyysin mukaan sivuston saavutettavuus on **94/100**, mikä on erittäin hyvä tulos.  
Toteutettuja saavutettavuustoimia:

- Semanttinen HTML ja ARIA-labelit
- Selkeä kontrastipaletti ja suuret kosketuspainikkeet
- Ruudunlukijayhteensopivuus peruselementeissä
- Visuaalinen ohjeistuskortti jokaisen pelin alussa
- Mobiilikohtaiset vinkit (esim. drag & drop -tehtävissä)

---

## Asennusohje

Lataa tai kloonaa repositorio: git clone https://github.com/irina-ge/matikka-harjoittelu
Avaa haluamasi HTML-tiedosto selaimessa: index.html
Ei vaadi palvelinta tai lisäkirjastoja — toimii suoraan paikallisesti.

---

## Lisenssi

Tämä projekti on julkaistu **MIT-lisenssillä**, ellei muuta ole määritelty.
Koodin ja tyylitiedostot ovat vapaasti käytettävissä opetuskäyttöön.

Sivuston banneri (header-kuva) on luotu **AI-työkalulla Grok (https://grok.com)**  
ja sitä käytetään ainoastaan projektin ei-kaupalliseen oppimistarkoitukseen.

