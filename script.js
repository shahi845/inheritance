// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('.theme-icon');

// Currency Management
const currencySelector = document.getElementById('currency-selector');
const currencyConfig = {
    'USD': { symbol: '$', locale: 'en-US' },
    'INR': { symbol: '₹', locale: 'en-IN' },
    'PKR': { symbol: '₨', locale: 'en-PK' },
    'LKR': { symbol: 'Rs', locale: 'en-LK' },
    'NPR': { symbol: 'Rs', locale: 'ne-NP' },
    'MUR': { symbol: '₨', locale: 'fr-MU' }, // Mauritius
    'SCR': { symbol: '₨', locale: 'en-SC' }, // Seychelles
    'IDR': { symbol: 'Rp', locale: 'id-ID' },
    'MVR': { symbol: 'Rf', locale: 'dv-MV' }
};

// Check for saved theme preference or system default
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';

    if (isDark) {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
});

// Currency Logic
let currentCurrency = localStorage.getItem('currency') || 'USD';
currencySelector.value = currentCurrency;
updateCurrencySymbols(currentCurrency);

currencySelector.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    localStorage.setItem('currency', currentCurrency);
    updateCurrencySymbols(currentCurrency);
    updateNetEstate(); // Recalculate/Reformat
    calculateDistribution(); // Recalculate results if visible
});

function updateCurrencySymbols(currency) {
    const config = currencyConfig[currency];
    const symbols = document.querySelectorAll('.input-wrapper span');
    symbols.forEach(span => {
        // Only update currency symbols, not other labels if any exist in span (though currently only currency symbols are in spans within input-wrapper)
        // Check if it's a currency symbol wrapper (length 1-3 usually)
        if (span.textContent.length <= 3) {
            span.textContent = config.symbol;
        }
    });

    // Update Land Rate Placeholders
    const landRateInputs = document.querySelectorAll('.currency-input-small input');
    // We don't need to update placeholders if they are generic, but if we wanted to:
    // landRateInputs.forEach(input => input.placeholder = `per ...`);
}

function formatCurrency(amount) {
    const config = currencyConfig[currentCurrency];
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currentCurrency
    }).format(amount);
}

// UI Interaction for Net Estate Calculation
const assetInputs = document.querySelectorAll('.asset-input');
const netEstateDisplay = document.getElementById('net-estate');

function updateNetEstate() {
    let total = 0;

    const savings = parseFloat(document.getElementById('savings').value) || 0;
    const business = parseFloat(document.getElementById('business').value) || 0;
    const other = parseFloat(document.getElementById('other').value) || 0;

    // Land calculation
    const landCents = parseFloat(document.getElementById('land-cents').value) || 0;
    const landCentsRate = parseFloat(document.getElementById('land-cents-rate').value) || 0;
    const landAcres = parseFloat(document.getElementById('land-acres').value) || 0;
    const landAcresRate = parseFloat(document.getElementById('land-acres-rate').value) || 0;

    const landValue = (landCents * landCentsRate) + (landAcres * landAcresRate);

    const funeral = parseFloat(document.getElementById('funeral').value) || 0;

    total = savings + business + other + landValue - funeral;

    netEstateDisplay.textContent = formatCurrency(total);

    // Highlight negative net estate
    if (total < 0) {
        document.querySelector('.net-estate-display').classList.add('negative-balance');
    } else {
        document.querySelector('.net-estate-display').classList.remove('negative-balance');
    }

    return total;
}

assetInputs.forEach(input => {
    input.addEventListener('input', updateNetEstate);
});

// Gender Toggle Listener
const genderInputs = document.querySelectorAll('input[name="gender"]');
genderInputs.forEach(input => {
    input.addEventListener('change', () => {
        renderHeirs();
    });
});

// Populate Heirs
const heirsContainer = document.getElementById('heirs-container');
const heirCategories = [
    {
        title: "Spouse",
        heirs: [
            // Visibility controlled by gender
            { id: 'husband', label: 'Husband', type: 'checkbox', gender: 'female' },
            { id: 'wife', label: 'Wives', type: 'number', max: 4, gender: 'male' }
        ]
    },
    {
        title: "Parents & Grandparents",
        heirs: [
            { id: 'father', label: 'Father', type: 'checkbox' },
            { id: 'father_father', label: 'Father of Father', type: 'checkbox' },
            { id: 'mother', label: 'Mother', type: 'checkbox' },
            { id: 'father_mother', label: 'Paternal Grandmother', type: 'checkbox' },
            { id: 'mother_father', label: 'Mother of Father', type: 'checkbox' },
            { id: 'mother_mother', label: 'Maternal Grandmother', type: 'checkbox' }
        ]
    },
    {
        title: "Children & Grandchildren",
        heirs: [
            { id: 'son', label: 'Son', type: 'number' },
            { id: 'son_son', label: 'Son of Son', type: 'number' },
            { id: 'daughter', label: 'Daughter ', type: 'number' },
            { id: 'son_daughter', label: "Son's Daughter ", type: 'number' }
        ]
    },
    {
        title: "Siblings",
        heirs: [
            { id: 'maternal_brother', label: 'Maternal Brother', type: 'number' },
            { id: 'maternal_sister', label: 'Maternal Sister', type: 'number' },
            { id: 'full_brother', label: 'Real Brother', type: 'number' },
            { id: 'full_sister', label: 'Real Sister', type: 'number' },
            { id: 'paternal_brother', label: 'Paternal Brother', type: 'number' },
            { id: 'paternal_sister', label: 'Paternal Sister', type: 'number' }
        ]
    },
    {
        title: "Consanguine",
        heirs: [
            { id: 'consanguine_male', label: 'Consanguine male', type: 'number' }
        ]
    },
    {
        title: "Distant Kindred",
        heirs: [
            { id: 'distant_kindred', label: 'Distant Kindred relatives', type: 'number' }
        ]
    }
];

function renderHeirs() {
    heirsContainer.innerHTML = '';
    const currentGender = document.querySelector('input[name="gender"]:checked').value;

    heirCategories.forEach(category => {
        // Filter heirs based on gender if specified
        const visibleHeirs = category.heirs.filter(heir => !heir.gender || heir.gender === currentGender);

        if (visibleHeirs.length === 0) return;

        const categorySection = document.createElement('div');
        categorySection.className = 'heir-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.title;
        categorySection.appendChild(categoryTitle);

        const grid = document.createElement('div');
        grid.className = 'heirs-grid';

        visibleHeirs.forEach(heir => {
            const div = document.createElement('div');
            div.className = 'heir-card';

            const header = document.createElement('div');
            header.className = 'heir-header';

            const name = document.createElement('span');
            name.className = 'heir-name';
            name.textContent = heir.label;

            header.appendChild(name);

            let input;
            if (heir.type === 'number') {
                input = document.createElement('div');
                input.className = 'input-wrapper';
                const maxAttr = heir.max ? `max="${heir.max}"` : '';
                input.innerHTML = `
                    <input type="number" id="${heir.id}" class="asset-input heir-input" min="0" ${maxAttr} value="0" placeholder="Count">
                `;
            } else {
                input = document.createElement('div');
                input.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="${heir.id}" class="heir-input" style="width: 20px; height: 20px; accent-color: var(--primary);">
                    <label for="${heir.id}" style="margin:0; cursor:pointer;" class="checkbox-label">Eligible</label>
                </div>
             `;
            }

            div.appendChild(header);
            div.appendChild(input);
            grid.appendChild(div);
        });

        categorySection.appendChild(grid);
        heirsContainer.appendChild(categorySection);
    });
}

renderHeirs();


// --- CALCULATION ENGINE ---

function getHeirCount(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    if (el.type === 'checkbox') return el.checked ? 1 : 0;
    return parseInt(el.value) || 0;
}

document.getElementById('calculate-btn').addEventListener('click', calculateDistribution);

function calculateDistribution() {
    const totalEstate = updateNetEstate();
    const gender = document.querySelector('input[name="gender"]:checked').value; // 'male' or 'female' (deceased)

    // 1. Gather Counts
    const h = getHeirCount('husband');
    const w = getHeirCount('wife');

    // Parents
    const f = getHeirCount('father');
    const m = getHeirCount('mother');

    // Grandparents
    const ff = getHeirCount('father_father');
    const fm = getHeirCount('father_mother');
    const mm = getHeirCount('mother_mother');

    // Descendants
    const s = getHeirCount('son');
    const d = getHeirCount('daughter');
    const ss = getHeirCount('son_son');
    const sd = getHeirCount('son_daughter');

    // Siblings
    const rb = getHeirCount('full_brother');
    const rs = getHeirCount('full_sister');
    const mb = getHeirCount('maternal_brother');
    const ms = getHeirCount('maternal_sister');
    const pb = getHeirCount('paternal_brother');
    const ps = getHeirCount('paternal_sister');

    // Derived States
    const hasKids = (s > 0) || (d > 0) || (ss > 0) || (sd > 0);
    const hasMaleDescendant = (s > 0) || (ss > 0);
    const hasBrethren = (rb + rs + mb + ms + pb + ps + (getHeirCount('consanguine_male') || 0)) >= 2;

    let shares = []; // { name, shareFraction, type: 'fixed' | 'residue', count }

    // --- STEP 1: FIXED SHARES (Zary al-Furud) ---

    // 1. Husband
    if (gender === 'female' && h > 0) {
        if (!hasKids) {
            shares.push({ id: 'husband', name: 'Husband', share: 1 / 2, type: 'fixed', count: 1 });
        } else {
            shares.push({ id: 'husband', name: 'Husband', share: 1 / 4, type: 'fixed', count: 1 });
        }
    }

    // 2. Wife
    if (gender === 'male' && w > 0) {
        // Wives share the fixed portion equally
        let totalWifeShare = 0;
        if (!hasKids) {
            totalWifeShare = 1 / 4;
        } else {
            totalWifeShare = 1 / 8;
        }

        // Display as group
        shares.push({ id: 'wife', name: 'Wives', share: totalWifeShare, type: 'fixed', count: w });
    }

    // 3. Father
    if (f > 0) {
        if (hasMaleDescendant) {
            shares.push({ id: 'father', name: 'Father', share: 1 / 6, type: 'fixed', count: 1 });
        } else if (hasKids) {
            shares.push({ id: 'father', name: 'Father', share: 1 / 6, type: 'fixed_plus_residue', count: 1 });
        }
    }

    // 4. Mother
    if (m > 0) {
        if (hasKids || hasBrethren) {
            shares.push({ id: 'mother', name: 'Mother', share: 1 / 6, type: 'fixed', count: 1 });
        } else {
            // Umariyyatain Check
            const spouseExists = (gender === 'female' && h > 0) || (gender === 'male' && w > 0);

            if (spouseExists && f > 0 && !hasBrethren && !hasKids) {
                if (h > 0) {
                    shares.push({ id: 'mother', name: 'Mother', share: 1 / 6, type: 'fixed', count: 1, note: 'Umariyyatain' });
                } else {
                    shares.push({ id: 'mother', name: 'Mother', share: 1 / 4, type: 'fixed', count: 1, note: 'Umariyyatain' });
                }
            } else {
                shares.push({ id: 'mother', name: 'Mother', share: 1 / 3, type: 'fixed', count: 1 });
            }
        }
    }

    // 5. Grandfather (Father's Father)
    if (ff > 0 && f === 0) {
        if (hasMaleDescendant) {
            shares.push({ id: 'father_father', name: 'Grandfather (Father side)', share: 1 / 6, type: 'fixed', count: 1 });
        } else if (hasKids) {
            shares.push({ id: 'father_father', name: 'Grandfather (Father side)', share: 1 / 6, type: 'fixed_plus_residue', count: 1 });
        }
    }

    // 6. Grandmothers
    let fm_eligible = (fm > 0 && f === 0 && m === 0);
    let mm_eligible = (mm > 0 && m === 0);

    if (m > 0) {
        fm_eligible = false;
        mm_eligible = false;
    }
    if (f > 0) {
        fm_eligible = false;
    }

    if (fm_eligible && mm_eligible) {
        shares.push({ id: 'grandmothers', name: 'Grandmothers (shared)', share: 1 / 6, type: 'fixed', count: 2 });
    } else if (fm_eligible) {
        shares.push({ id: 'father_mother', name: 'Paternal Grandmother', share: 1 / 6, type: 'fixed', count: 1 });
    } else if (mm_eligible) {
        shares.push({ id: 'mother_mother', name: 'Maternal Grandmother', share: 1 / 6, type: 'fixed', count: 1 });
    }

    // 7. Daughters
    if (d > 0 && s === 0) {
        if (d === 1) {
            shares.push({ id: 'daughter', name: 'Daughter', share: 1 / 2, type: 'fixed', count: 1 });
        } else {
            shares.push({ id: 'daughter', name: 'Daughters', share: 2 / 3, type: 'fixed', count: d });
        }
    }

    // 8. Son's Daughters (SD)
    if (sd > 0 && s === 0) {
        let excludedByDaughters = (d >= 2) && (ss === 0);

        if (!excludedByDaughters) {
            if (d === 1) {
                shares.push({ id: 'son_daughter', name: "Son's Daughters", share: 1 / 6, type: 'fixed', count: sd });
            } else if (d === 0) {
                if (sd === 1) {
                    shares.push({ id: 'son_daughter', name: "Son's Daughter", share: 1 / 2, type: 'fixed', count: 1 });
                } else {
                    shares.push({ id: 'son_daughter', name: "Son's Daughters", share: 2 / 3, type: 'fixed', count: sd });
                }
            }
        }
    }

    // 9. Maternal Siblings
    const excludedByRootOrBranch = (hasKids || f > 0 || ff > 0);
    if (!excludedByRootOrBranch && (mb > 0 || ms > 0)) {
        const totalMaternal = mb + ms;
        if (totalMaternal === 1) {
            shares.push({ id: 'maternal_sibling', name: "Maternal Sibling", share: 1 / 6, type: 'fixed', count: 1 });
        } else {
            shares.push({ id: 'maternal_sibling', name: "Maternal Siblings", share: 1 / 3, type: 'fixed', count: totalMaternal });
        }
    }

    // --- STEP 2: RESIDUE (Asaba) --
    let totalFixed = shares.reduce((acc, curr) => acc + curr.share, 0);

    let residue = 1 - totalFixed;

    let residues = [];
    let taken = false;

    // 1. Son & Daughter
    if (s > 0) {
        residues.push({ id: 'son', name: 'Sons', count: s, weight: 2 });
        if (d > 0) residues.push({ id: 'daughter', name: 'Daughters', count: d, weight: 1 });
        taken = true;
    }

    // 2. Son's Son & Son's Daughter
    if (!taken && ss > 0) {
        residues.push({ id: 'son_son', name: "Son's Sons", count: ss, weight: 2 });
        if (sd > 0) residues.push({ id: 'son_daughter', name: "Son's Daughters", count: sd, weight: 1 });
        taken = true;
    }

    // 3. Father
    if (!taken && f > 0) {
        residues.push({ id: 'father', name: 'Father', count: 1, weight: 1 });
        taken = true;
    }

    // 4. Grandfather
    if (!taken && ff > 0 && f === 0) {
        residues.push({ id: 'father_father', name: 'Grandfather', count: 1, weight: 1 });
        taken = true;
    }

    // 5. Real Siblings
    const rb_excluded = (s > 0 || ss > 0 || f > 0 || ff > 0);

    if (!taken && !rb_excluded) {
        if (rb > 0) {
            residues.push({ id: 'full_brother', name: 'Real Brothers', count: rb, weight: 2 });
            if (rs > 0) residues.push({ id: 'full_sister', name: 'Real Sisters', count: rs, weight: 1 });
            taken = true;
        } else if (rs > 0) {
            if (d > 0 || sd > 0) {
                residues.push({ id: 'full_sister', name: 'Real Sisters (Residue w/ D)', count: rs, weight: 1 });
                taken = true;
            } else {
                if (rs === 1) shares.push({ id: 'full_sister', name: 'Real Sister', share: 1 / 2, type: 'fixed', count: 1 });
                else shares.push({ id: 'full_sister', name: 'Real Sisters', share: 2 / 3, type: 'fixed', count: rs });

                totalFixed = shares.reduce((acc, curr) => acc + curr.share, 0);
                residue = 1 - totalFixed;
            }
        }
    }

    // --- STEP 3: FINAL CALCULATIONS ---

    // Handle Awl
    if (totalFixed > 1) {
        shares.forEach(share => {
            share.finalShare = share.share / totalFixed;
        });
        residue = 0;
    } else {
        shares.forEach(share => {
            share.finalShare = share.share;
        });
    }

    // Handle Residue
    let residueShares = [];
    if (taken && residue > 0) {
        let totalParts = 0;
        residues.forEach(r => totalParts += (r.count * r.weight));

        residues.forEach(r => {
            let shareOfResidue = (r.count * r.weight) / totalParts;
            residueShares.push({
                id: r.id,
                name: r.name,
                finalShare: residue * shareOfResidue,
                type: 'residue'
            });
        });
    } else if (!taken && totalFixed < 1 && totalFixed > 0) {
        // Radd
        const spouses = shares.filter(s => s.id === 'husband' || s.id === 'wife');
        const bloods = shares.filter(s => s.id !== 'husband' && s.id !== 'wife');

        const spouseShareTotal = spouses.reduce((sum, s) => sum + s.share, 0);
        const bloodShareTotal = bloods.reduce((sum, s) => sum + s.share, 0);

        if (bloodShareTotal > 0) {
            let remainder = 1 - spouseShareTotal;
            bloods.forEach(s => {
                s.finalShare = (s.share / bloodShareTotal) * remainder;
            });
        }
    }

    // Combine
    const allResults = [...shares, ...residueShares];

    // Render
    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    resultsTable.innerHTML = '';

    let consolidated = {};
    allResults.forEach(r => {
        if (!consolidated[r.name]) {
            consolidated[r.name] = { ...r, finalShare: 0 };
        }
        consolidated[r.name].finalShare += r.finalShare;
    });

    for (let name in consolidated) {
        const item = consolidated[name];
        if (item.finalShare <= 0.0001) continue;

        const tr = document.createElement('tr');
        const value = item.finalShare * totalEstate;

        tr.innerHTML = `
            <td>${name}</td>
            <td>${item.finalShare.toFixed(4)}</td>
            <td>${(item.finalShare * 100).toFixed(2)}%</td>
            <td>${formatCurrency(value)}</td>
        `;
        resultsTable.appendChild(tr);
    }

    // --- CHART GENERATION ---
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '<canvas id="distribution-chart"></canvas>';
    const ctx = document.getElementById('distribution-chart').getContext('2d');

    // Prepare data
    const labels = [];
    const data = [];
    const backgroundColors = [];

    // Sort for better viz (descending)
    const sortedItems = Object.values(consolidated).sort((a, b) => b.finalShare - a.finalShare);

    // Palette
    const palette = ['#0088cc', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#fd7e14', '#20c997', '#e83e8c'];

    sortedItems.forEach((item, index) => {
        if (item.finalShare <= 0.0001) return;
        labels.push(item.name);
        data.push((item.finalShare * 100).toFixed(2));
        backgroundColors.push(palette[index % palette.length]);
    });

    if (window.inheritanceChart) {
        window.inheritanceChart.destroy();
    }

    window.inheritanceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: (body.getAttribute('data-theme') === 'dark') ? '#e2e8f0' : '#1e293b'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });

    document.getElementById('results-panel').classList.remove('hidden');
    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth' });
}

// Initial Render
renderHeirs();
updateNetEstate();

