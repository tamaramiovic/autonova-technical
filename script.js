
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
        'aria-label',
        isOpen ? 'Zatvori meni' : 'Otvori meni'
    );
});

navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navigation.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otvori meni');
    });
});

const inspectionData = [
    {
        id: 'brakes',
        title: 'KOČIONI SISTEM',
        description: 'Provera efikasnosti kočenja i ispravnosti kočionog sistema vozila.'
    },
    {
        id: 'lights',
        title: 'SVETLOSNA SIGNALIZACIJA',
        description: 'Kontrola ispravnosti i podešenosti svetala, pokazivača pravca i ostale svetlosne signalizacije.'
    },
    {
        id: 'tires',
        title: 'PNEUMATICI',
        description: 'Provera stanja pneumatika, dubine šare, odgovarajućih dimenzija i vidljivih oštećenja.'
    },
    {
        id: 'exhaust',
        title: 'IZDUVNI SISTEM',
        description: 'Provera stanja izduvnog sistema i kontrola emisije izduvnih gasova.'
    },
    {
        id: 'steering',
        title: 'UPRAVLJANJE I OSLANJANJE',
        description: 'Provera upravljačkog mehanizma, spojeva i elemenata sistema oslanjanja.'
    }
];

const inspectionSection = document.querySelector('.inspection-section');
const inspectionPoints = document.querySelectorAll('.car-point');
const inspectionTitle = document.querySelector('#inspection-title');
const inspectionDescription = document.querySelector('#inspection-description');
const inspectionLabel = document.querySelector('.inspection-info-label');
const inspectionProgress = document.querySelector('.progress-fill');
const inspectionCurrent = document.querySelector('.inspection-progress > span:first-child');

let activeInspection = 0;

function showInspection(index) {
    activeInspection = (index + inspectionData.length) % inspectionData.length;

    const item = inspectionData[activeInspection];
    const number = String(activeInspection + 1).padStart(2, '0');

    inspectionTitle.textContent = item.title;
    inspectionDescription.textContent = item.description;
    inspectionLabel.textContent = `DIGITAL INSPECTION / ${number}`;
    inspectionCurrent.textContent = number;
    inspectionProgress.style.width =
        `${((activeInspection + 1) / inspectionData.length) * 100}%`;

    inspectionPoints.forEach(point => {
        const isActive = point.dataset.inspection === item.id;
        point.classList.toggle('active', isActive);
        point.setAttribute('aria-pressed', String(isActive));
    });
}

inspectionPoints.forEach(point => {
    point.addEventListener('click', () => {
        const index = inspectionData.findIndex(
            item => item.id === point.dataset.inspection
        );
        if (index !== -1) showInspection(index);
    });
});

document.querySelector('#inspection-next').addEventListener('click', () => {
    showInspection(activeInspection + 1);
});

document.querySelector('#inspection-prev').addEventListener('click', () => {
    showInspection(activeInspection - 1);
});

const inspectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            inspectionSection.classList.add('in-view');
            inspectionObserver.unobserve(inspectionSection);
        }
    });
}, { threshold: 0.25 });

inspectionObserver.observe(inspectionSection);
showInspection(0);

const registrationForm = document.getElementById('registration-form');

const currencyFormatter = new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 0
});

registrationForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const cc = Number(document.getElementById('vehicle-cc').value);
    const kw = Number(document.getElementById('vehicle-kw').value);
    const year = Number(document.getElementById('vehicle-year').value);
    const fuel = document.getElementById('vehicle-fuel').value;

    const currentYear = new Date().getFullYear();

    if (
        !Number.isFinite(cc) ||
        !Number.isFinite(kw) ||
        !Number.isInteger(year) ||
        cc < 500 ||
        cc > 8000 ||
        kw <= 0 ||
        kw > 1000 ||
        year < 1980 ||
        year > currentYear ||
        !fuel
    ) {
        document.getElementById('registration-message').textContent =
            'Proverite unete podatke i pokušajte ponovo.';
        return;
    }

    const baseCost = 10000;
    const powerCost = Math.round(kw * 110);
    const capacityCost = Math.floor(cc / 100) * 180;
    const total = baseCost + powerCost + capacityCost;

    document.getElementById('registration-total').textContent =
        currencyFormatter.format(total);

    document.getElementById('result-base').textContent =
        currencyFormatter.format(baseCost);

    document.getElementById('result-power').textContent =
        currencyFormatter.format(powerCost);

    document.getElementById('result-capacity').textContent =
        currencyFormatter.format(capacityCost);

    document.getElementById('registration-message').textContent =
        `Demonstracioni obračun za vozilo iz ${year}. godine. Prikaz nije zvanična cena registracije.`;

    document.querySelector('.calculator-result').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
});

const registrationGuides = {
  renewal: {
    title: 'PRODUŽENJE REGISTRACIJE',
    description: 'Pregled osnovnih koraka za produženje registracije vozila koje je već registrovano u Srbiji.',
    items: [
      'Pripremite saobraćajnu dozvolu i identifikacioni dokument.',
      'Obavite redovni tehnički pregled vozila.',
      'Obezbedite obavezno osiguranje od autoodgovornosti.',
      'Izmirite propisane takse i naknade.',
      'Završite postupak produženja registracije kod ovlašćenog pružaoca usluge ili nadležnog organa.'
    ]
  },
  first: {
    title: 'PRVA REGISTRACIJA',
    description: 'Osnovni vodič za vozilo koje se prvi put registruje u Srbiji.',
    items: [
      'Pripremite dokaz o vlasništvu i identifikacioni dokument.',
      'Proverite da li je potrebna dodatna dokumentacija o poreklu vozila, uvozu ili homologaciji.',
      'Obavite odgovarajući tehnički pregled.',
      'Ugovorite obavezno osiguranje.',
      'Izmirite propisane obaveze i podnesite dokumentaciju za registraciju i izdavanje oznaka.'
    ]
  },
  ownership: {
    title: 'PROMENA VLASNIKA',
    description: 'Pregled osnovnih koraka prilikom prenosa vlasništva nad vozilom.',
    items: [
      'Pripremite odgovarajući ugovor ili drugi dokaz o sticanju vlasništva.',
      'Obezbedite potrebne identifikacione dokumente.',
      'Proverite poreske obaveze i potrebne dokaze o njihovom izmirenju.',
      'Pripremite saobraćajnu dozvolu i ostalu dokumentaciju za konkretan slučaj.',
      'Podnesite zahtev za promenu podataka kod nadležnog organa.'
    ]
  }
};

const registrationButtons = document.querySelectorAll('.registration-option');
const registrationGuideTitle = document.getElementById('registration-guide-title');
const registrationGuideDescription = document.getElementById('registration-guide-description');
const registrationGuideItems = document.getElementById('registration-guide-items');

function renderRegistrationGuide(type) {
  const guide = registrationGuides[type];

  if (!guide || !registrationGuideTitle || !registrationGuideDescription || !registrationGuideItems) {
    return;
  }

  registrationGuideTitle.textContent = guide.title;
  registrationGuideDescription.textContent = guide.description;
  registrationGuideItems.replaceChildren();

  guide.items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'registration-guide-item';

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');

    const description = document.createElement('p');
    description.textContent = item;

    row.append(number, description);
    registrationGuideItems.appendChild(row);
  });

  registrationButtons.forEach(button => {
    const active = button.dataset.type === type;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

registrationButtons.forEach(button => {
  button.addEventListener('click', () => {
    renderRegistrationGuide(button.dataset.type);
  });
});

renderRegistrationGuide('renewal');
