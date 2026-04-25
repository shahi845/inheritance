import { fixedShareRules } from '../data/shafiiRules.js';
import { fraction, addFractions } from '../utils/fractions.js';
import { capitalize } from '../utils/formatResults.js';

export function assignFixedShares(heirs, context) {
    let shares = [];
    let sumFractions = fraction(0, 1);

    for (const ruleKey in fixedShareRules) {
        const rule = fixedShareRules[ruleKey];
        if (rule.eligible({ heirs, context })) {
            const frac = rule.share({ heirs, context });
            if (frac) {
                let name = capitalize(ruleKey);
                if (ruleKey === 'maternalSiblings') {
                    name = 'Maternal Sibling(s)';
                } else if (ruleKey === 'paternalSister') {
                    name = 'Paternal Half-Sister';
                }
                
                let count = heirs[ruleKey] || 1;
                if (ruleKey === 'maternalSiblings') {
                    count = heirs.maternalBrother + heirs.maternalSister;
                }

                shares.push({
                    heir: ruleKey,
                    name,
                    count,
                    baseShare: frac,
                    adjustedShare: frac,
                    status: 'Sharer',
                    reason: ''
                });

                sumFractions = addFractions(sumFractions, frac);
            }
        }
    }

    return { shares, sumFractions };
}
