document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsBody = document.getElementById('resultsBody');
    const messagesContainer = document.getElementById('messages');

    // Utility: Parse Input
    function getVal(id) {
        const val = parseInt(document.getElementById(id).value, 10);
        return isNaN(val) ? 0 : Math.max(0, val);
    }

    resetBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            if(input.id === 'husband' || input.id === 'father' || input.id === 'grandfather' || input.id === 'mother' || input.id === 'wife') {
                input.value = 0;
            } else {
                input.value = 0;
            }
        });
        document.getElementById('estateValue').value = '';
        resultsSection.classList.add('hidden');
        document.getElementById('printBtn').classList.add('hidden');
    });

    calculateBtn.addEventListener('click', () => {
        // Collect Inputs
        const heirs = {
            husband: Math.min(getVal('husband'), 1),
            wife: Math.min(getVal('wife'), 4),
            father: Math.min(getVal('father'), 1),
            mother: Math.min(getVal('mother'), 1),
            grandfather: Math.min(getVal('grandfather'), 1),
            grandmother: Math.min(getVal('grandmother'), 2),
            son: getVal('son'),
            daughter: getVal('daughter'),
            grandson: getVal('grandson'),
            granddaughter: getVal('granddaughter'),
            brother: getVal('brother'),
            sister: getVal('sister'),
            paternalBrother: getVal('paternalBrother'),
            paternalSister: getVal('paternalSister'),
            maternalBrother: getVal('maternalBrother'),
            maternalSister: getVal('maternalSister'),
            uncle: getVal('uncle')
        };

        const estateValue = parseFloat(document.getElementById('estateValue').value) || 0;

        const results = calculateInheritance(heirs);
        displayResults(results, estateValue);
    });

    function calculateInheritance(h) {
        let shares = [];
        let messages = [];

        // Derived states
        const hasChildren = h.son > 0 || h.daughter > 0 || h.grandson > 0 || h.granddaughter > 0;
        const hasMaleChildren = h.son > 0 || h.grandson > 0;
        const siblingsCount = h.brother + h.sister + h.paternalBrother + h.paternalSister + h.maternalBrother + h.maternalSister;
        const hasSiblings = siblingsCount >= 2;

        let totalFraction = 0;

        // Blocking Logic (Hajb)
        let blocked = {
            grandfather: h.father > 0,
            grandmother: h.mother > 0 || h.father > 0, // Father blocks paternal GM, Mother blocks all GMs
            grandson: h.son > 0,
            granddaughter: h.son > 0 || h.daughter >= 2,
            brother: h.son > 0 || h.grandson > 0 || h.father > 0 || h.grandfather > 0,
            sister: h.son > 0 || h.grandson > 0 || h.father > 0 || h.grandfather > 0,
            paternalBrother: h.son > 0 || h.grandson > 0 || h.father > 0 || h.grandfather > 0 || h.brother > 0 || (h.sister > 0 && h.daughter > 0),
            paternalSister: h.son > 0 || h.grandson > 0 || h.father > 0 || h.grandfather > 0 || h.brother > 0 || h.sister >= 2,
            maternalBrother: h.son > 0 || h.grandson > 0 || h.daughter > 0 || h.granddaughter > 0 || h.father > 0 || h.grandfather > 0,
            maternalSister: h.son > 0 || h.grandson > 0 || h.daughter > 0 || h.granddaughter > 0 || h.father > 0 || h.grandfather > 0,
            uncle: h.son > 0 || h.grandson > 0 || h.father > 0 || h.grandfather > 0 || h.brother > 0 || h.paternalBrother > 0
        };

        // Add blocked messages
        for (let key in blocked) {
            if (blocked[key] && h[key] > 0) {
                let reason = "closer relatives";
                if (key === 'grandfather') reason = "Father";
                else if (key === 'brother') reason = "Son/Father";
                else if (key === 'uncle') reason = "Son/Brother";
                else if (key === 'grandmother') reason = "Mother/Father";
                else if (key === 'granddaughter') reason = "Daughter";
                else if (key === 'paternalSister') reason = "Sister";
                else if (key === 'maternalSister') reason = "Sister";
                else if (key === 'maternalBrother') reason = "Sister";
                else if (key === 'paternalBrother') reason = "Sister";
                else if (key === 'grandson') reason = "Son";
                else if (key === 'granddaughter') reason = "Daughter";
                else if (key === 'brother') reason = "Son/Father";
                else if (key === 'sister') reason = "Son/Father";
                else if (key === 'paternalBrother') reason = "Son/Father";
                else if (key === 'paternalSister') reason = "Son/Father";
                else if (key === 'maternalBrother') reason = "Son/Father";
                else if (key === 'maternalSister') reason = "Son/Father";
                else if (key === 'uncle') reason = "Son/Father";
                else if (key === 'grandmother') reason = "Mother/Father";
                else if (key === 'grandfather') reason = "Father";
                messages.push(`${capitalize(key)} is blocked by ${reason}.`);
            }
        }

        // Apply Sharers (Fixed Portions)
        
        // Husband
        if (h.husband > 0) {
            let frac = hasChildren ? (1/4) : (1/2);
            addShare(shares, 'Husband', 1, frac, 'Sharer');
            totalFraction += frac;
        }

        // Wife
        if (h.wife > 0) {
            let frac = hasChildren ? (1/8) : (1/4);
            addShare(shares, 'Wife', h.wife, frac, 'Sharer');
            totalFraction += frac;
        }

        // Mother
        if (h.mother > 0) {
            let frac = 0;
            if (hasChildren || hasSiblings) {
                frac = 1/6;
            } else if (h.father > 0 && (h.husband > 0 || h.wife > 0)) {
                // Gharāwiyyatayn case: Spouse + Parents
                let spouseFrac = h.husband > 0 ? (1/2) : (1/4); // No children
                frac = (1 - spouseFrac) * (1/3);
                messages.push(`Gharāwiyyatayn rule applied: Mother receives 1/3 of the remainder after spouse's share.`);
            } else {
                frac = 1/3;
            }
            addShare(shares, 'Mother', 1, frac, 'Sharer');
            totalFraction += frac;
        }

        // Grandmother (if not blocked)
        if (h.grandmother > 0 && !blocked.grandmother) {
            let frac = 1/6;
            addShare(shares, 'Grandmother', h.grandmother, frac, 'Sharer');
            totalFraction += frac;
        }

        // Father
        let fatherIsResiduary = false;
        if (h.father > 0) {
            if (hasMaleChildren) {
                let frac = 1/6;
                addShare(shares, 'Father', 1, frac, 'Sharer');
                totalFraction += frac;
            } else if (hasChildren) { // Only daughters
                let frac = 1/6;
                addShare(shares, 'Father', 1, frac, 'Sharer + Residuary');
                totalFraction += frac;
                fatherIsResiduary = true;
            } else {
                fatherIsResiduary = true;
            }
        }

        // Grandfather (if not blocked)
        let grandfatherIsResiduary = false;
        if (h.grandfather > 0 && !blocked.grandfather) {
            if (hasMaleChildren) {
                let frac = 1/6;
                addShare(shares, 'Grandfather', 1, frac, 'Sharer');
                totalFraction += frac;
            } else if (hasChildren) {
                let frac = 1/6;
                addShare(shares, 'Grandfather', 1, frac, 'Sharer + Residuary');
                totalFraction += frac;
                grandfatherIsResiduary = true;
            } else {
                grandfatherIsResiduary = true;
            }
        }

        // Daughters (if no sons, they are sharers)
        if (h.daughter > 0 && h.son === 0) {
            let frac = h.daughter === 1 ? (1/2) : (2/3);
            addShare(shares, 'Daughter', h.daughter, frac, 'Sharer');
            totalFraction += frac;
        }

        // Granddaughters (if no sons/daughters/grandsons, they are sharers)
        if (h.granddaughter > 0 && !blocked.granddaughter && h.grandson === 0) {
            let frac = h.granddaughter === 1 ? (1/2) : (2/3);
            // Special rule: if 1 daughter gets 1/2, granddaughter(s) get 1/6 to make 2/3
            if (h.daughter === 1) {
                frac = 1/6;
            }
            addShare(shares, 'Granddaughter', h.granddaughter, frac, 'Sharer');
            totalFraction += frac;
        }

        // Sisters (if no brothers, no children, no father/grandfather)
        if (h.sister > 0 && !blocked.sister && h.brother === 0 && h.daughter === 0 && h.granddaughter === 0) {
            let frac = h.sister === 1 ? (1/2) : (2/3);
            addShare(shares, 'Full Sister', h.sister, frac, 'Sharer');
            totalFraction += frac;
        }

        // Maternal Siblings
        if (h.maternalBrother > 0 && !blocked.maternalBrother) {
            let totalMaternal = h.maternalBrother + (blocked.maternalSister ? 0 : h.maternalSister);
            let frac = totalMaternal === 1 ? (1/6) : (1/3);
            addShare(shares, 'Maternal Sibling(s)', totalMaternal, frac, 'Sharer');
            totalFraction += frac;
            // Mark sister as blocked since we combined them
            blocked.maternalSister = true; 
        } else if (h.maternalSister > 0 && !blocked.maternalSister) {
            let frac = h.maternalSister === 1 ? (1/6) : (1/3);
            addShare(shares, 'Maternal Sister', h.maternalSister, frac, 'Sharer');
            totalFraction += frac;
        }


        // Handle 'Awl (over-subscription)
        if (totalFraction > 1) {
            messages.push(`'Awl applied: Total shares exceeded 100%. Shares reduced proportionally.`);
            shares.forEach(s => {
                s.fraction = s.fraction / totalFraction;
            });
            totalFraction = 1;
        }

        // Residuaries (Takes remainder)
        let remainder = 1 - totalFraction;

        if (remainder > 0.0001) {
            let residuaryFound = false;

            // 1. Descendants
            if (h.son > 0) {
                residuaryFound = true;
                let maleUnits = h.son * 2;
                let femaleUnits = h.daughter;
                let totalUnits = maleUnits + femaleUnits;

                if (h.son > 0) {
                    addShare(shares, 'Son', h.son, (remainder * maleUnits) / totalUnits, 'Residuary');
                }
                if (h.daughter > 0) {
                    addShare(shares, 'Daughter (with Son)', h.daughter, (remainder * femaleUnits) / totalUnits, 'Residuary');
                    messages.push(`Rule applied: Male gets double the female share (Each Son = 2 shares, Each Daughter = 1 share).`);
                }
                remainder = 0;
            } 
            else if (h.grandson > 0 && !blocked.grandson) {
                residuaryFound = true;
                let maleUnits = h.grandson * 2;
                let femaleUnits = h.granddaughter;
                let totalUnits = maleUnits + femaleUnits;

                addShare(shares, 'Grandson', h.grandson, (remainder * maleUnits) / totalUnits, 'Residuary');
                if (h.granddaughter > 0) {
                    addShare(shares, 'Granddaughter (with Grandson)', h.granddaughter, (remainder * femaleUnits) / totalUnits, 'Residuary');
                    messages.push(`Rule applied: Male gets double the female share (Each Grandson = 2 shares, Each Granddaughter = 1 share).`);
                }
                remainder = 0;
            }

            // 2. Ascendants (Father / Grandfather)
            if (!residuaryFound && fatherIsResiduary) {
                residuaryFound = true;
                // If father already had a share, add to it
                let existing = shares.find(s => s.name === 'Father');
                if (existing) {
                    existing.fraction += remainder;
                    existing.status = 'Sharer + Residuary';
                } else {
                    addShare(shares, 'Father', 1, remainder, 'Residuary');
                }
                remainder = 0;
            }
            if (!residuaryFound && grandfatherIsResiduary) {
                residuaryFound = true;
                let existing = shares.find(s => s.name === 'Grandfather');
                if (existing) {
                    existing.fraction += remainder;
                    existing.status = 'Sharer + Residuary';
                } else {
                    addShare(shares, 'Grandfather', 1, remainder, 'Residuary');
                }
                remainder = 0;
            }

            // 3. Siblings
            if (!residuaryFound && h.brother > 0 && !blocked.brother) {
                residuaryFound = true;
                let maleUnits = h.brother * 2;
                let femaleUnits = h.sister;
                let totalUnits = maleUnits + femaleUnits;

                addShare(shares, 'Full Brother', h.brother, (remainder * maleUnits) / totalUnits, 'Residuary');
                if (h.sister > 0) {
                    addShare(shares, 'Full Sister (with Brother)', h.sister, (remainder * femaleUnits) / totalUnits, 'Residuary');
                    messages.push(`Rule applied: Male gets double the female share (Each Brother = 2 shares, Each Sister = 1 share).`);
                }
                remainder = 0;
            }
            // Sisters with Daughters (Asabah ma'a al-ghayr)
            if (!residuaryFound && h.sister > 0 && !blocked.sister && (h.daughter > 0 || h.granddaughter > 0)) {
                residuaryFound = true;
                addShare(shares, 'Full Sister (with Daughter)', h.sister, remainder, 'Residuary');
                remainder = 0;
            }

            // 4. Uncles
            if (!residuaryFound && h.uncle > 0 && !blocked.uncle) {
                residuaryFound = true;
                addShare(shares, 'Paternal Uncle', h.uncle, remainder, 'Residuary');
                remainder = 0;
            }

            // Radd (Redistribution)
            if (remainder > 0.0001 && shares.length > 0) {
                // Radd goes to non-spouse sharers only
                let nonSpouseSharers = shares.filter(s => s.name !== 'Husband' && s.name !== 'Wife' && s.status.includes('Sharer'));
                
                if (nonSpouseSharers.length > 0) {
                    messages.push(`Radd applied: Remainder redistributed among non-spouse sharers.`);
                    let sharersFrac = nonSpouseSharers.reduce((sum, s) => sum + s.fraction, 0);
                    nonSpouseSharers.forEach(s => {
                        s.fraction += (s.fraction / sharersFrac) * remainder;
                    });
                } else {
                    // If only spouse is left, remainder goes to Bayt al-Mal
                    messages.push(`No non-spouse sharers or residuaries exist. Remaining estate goes to Bayt al-Māl (Public Treasury).`);
                    addShare(shares, 'Bayt al-Māl (Public Treasury)', 1, remainder, 'Public Treasury');
                }
            }
        }

        // Add blocked to list with 0 share
        for (let key in h) {
            if (h[key] > 0 && blocked[key]) {
                addShare(shares, capitalize(key), h[key], 0, 'Blocked');
            }
        }

        return { shares, messages };
    }

    function addShare(shares, name, count, fraction, status) {
        shares.push({ name, count, fraction, status });
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }

    function displayResults(data, estateValue) {
        resultsBody.innerHTML = '';
        messagesContainer.innerHTML = '';
        
        let totalPctCheck = 0;

        data.shares.sort((a, b) => b.fraction - a.fraction).forEach(share => {
            const tr = document.createElement('tr');
            
            let statusClass = '';
            if(share.status.includes('Blocked')) statusClass = 'status-blocked';
            else if (share.status.includes('Residuary')) statusClass = 'status-residuary';
            else statusClass = 'status-sharer';

            const perPersonFraction = share.count > 0 ? (share.fraction / share.count) : 0;
            const pctPerPerson = perPersonFraction * 100;
            const amountPerPerson = estateValue > 0 ? (estateValue * perPersonFraction).toFixed(2) : '-';

            let fracText = '-';
            if (share.fraction > 0) {
                // approximate fraction for display
                const denom = Math.round(1 / share.fraction);
                if (denom > 0 && Math.abs(share.fraction - (1/denom)) < 0.01) {
                    fracText = `1/${denom} ${share.count > 1 ? '(Total)' : ''}`;
                } else if (Math.abs(share.fraction - (2/3)) < 0.01) {
                    fracText = `2/3 ${share.count > 1 ? '(Total)' : ''}`;
                } else {
                    fracText = share.fraction.toFixed(4);
                }
            }

            tr.innerHTML = `
                <td>${share.name}</td>
                <td>${share.count}</td>
                <td class="${statusClass}">${share.status}</td>
                <td>${share.fraction > 0 ? fracText : '0'}</td>
                <td>${pctPerPerson > 0 ? pctPerPerson.toFixed(2) + '%' : '0%'}</td>
                <td>${amountPerPerson !== '-' ? '$' + amountPerPerson : '-'}</td>
            `;
            resultsBody.appendChild(tr);
        });

        data.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'message ' + (msg.includes('blocked') ? 'warning' : '');
            div.textContent = msg;
            messagesContainer.appendChild(div);
        });

        resultsSection.classList.remove('hidden');
        document.getElementById('printBtn').classList.remove('hidden');
    }
});

const FARAID_RULES = `
1. Foundational Principles
Inheritance is a divine system
Shares are fixed by revelation, not human choice
Automatic transfer of estate
Happens immediately after death
No heir can be deprived unjustly
🔷 2. Order of Estate Distribution

Before inheritance is divided:

Step 1: Funeral expenses
Step 2: Debts repayment
Step 3: Execution of will (Wasiyyah)
Maximum: 1/3 of estate
Cannot be given to legal heirs (without consent)
Step 4: Distribution to heirs
🔷 3. Causes of Inheritance

A person inherits due to:

Marriage (Nikāḥ)
Blood relation (Nasab)
(Classically) Loyalty (Walā’)
🔷 4. Conditions for Inheritance

All must be fulfilled:

Death of the deceased is confirmed
Heir is alive at time of death
Relationship is legally valid
🔷 5. Barriers to Inheritance (موانع)

A person is disqualified if:

❌ Murder of the deceased
❌ Difference of religion (in classical rulings)
❌ Slavery (historical context)
🔷 6. Categories of Heirs
🔹 1. Sharers (ذوو الفروض)

Receive fixed shares

🔹 2. Residuaries (عصبة)

Receive remaining estate

🔹 3. Distant Kindred (ذوو الأرحام)

Only inherit if above two are absent

🔷 7. Fixed Shares (Core Fractions)

Only these fractions exist:

1/2
1/4
1/8
2/3
1/3
1/6

👉 No other fractions are original shares

🔷 8. Detailed Share Rules
🔹 Husband
1/2 → no children
1/4 → with children
🔹 Wife (one or more)
1/4 → no children
1/8 → with children
🔹 Mother
1/3 → no children, no siblings
1/6 → with children or siblings
🔹 Father
1/6 → with children
Residuary → if no children
🔹 Daughter
1/2 → single
2/3 → multiple
Residuary → with son
🔹 Son
Always residuary
🔷 9. Residuary Rules (ʿAṣabah)

Types:

By themselves (sons, fathers)
By others (daughter with son)
With others (sisters with daughters)
🔷 10. Core Rule of Distribution

Male = 2 × Female (in same level residuary)

🔷 11. Blocking Rules (Ḥajb)
🔹 Complete Blocking (Ḥajb Ḥirmān)

Heir is fully excluded

Examples:

Son blocks brothers
Father blocks grandfather
🔹 Partial Blocking (Ḥajb Nuqṣān)

Share is reduced

Examples:

Mother: 1/3 → 1/6
🔷 12. Special Doctrines
🔹 1. ‘Awl (عول)

When shares exceed 100%

👉 All shares are proportionally reduced

🔹 2. Radd (رد)

When estate remains after sharers

👉 Returned to sharers (except spouse in many opinions)

🔹 3. Taʿṣīb (تعصيب)

Conversion into residuary

🔹 4. Tashīḥ (Correction)

Adjusting fractions to whole numbers

🔷 13. Special Cases
🔹 1. Kalālah

Person dies with:

No father
No children

Special rules apply

🔹 2. Mushtarakah (Joint case)

Complex sibling distribution case

🔹 3. Gharāwiyyatān (Two famous cases)

Special rulings involving parents + spouse

🔷 14. Rules for Multiple Heirs
Multiple wives → share equally
Multiple daughters → share equally
Sons & daughters → 2:1 ratio
🔷 15. Grandparent Rules
Grandfather acts like father (if father absent)
Grandmother gets 1/6 (if mother absent)
🔷 16. Sibling Rules
🔹 Full siblings

Stronger than half-siblings

🔹 Maternal siblings
1/6 (one)
1/3 (multiple)
🔷 17. Key Mathematical Rules
Work with common denominators
Convert shares into integers
Always distribute residue last
🔷 18. General Priority Order
Sharers
Residuaries
Distant relatives
🔷 19. Important Legal Maxims
“Closer relative excludes distant relative”
“No inheritance without valid cause”
“Fixed shares must be honored first”
`;

