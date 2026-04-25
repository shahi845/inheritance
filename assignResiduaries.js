import { residuaryPriority } from '../data/heirs.js';
import { fraction, subtractFractions, compareFractions, addFractions } from '../utils/fractions.js';

export function assignResiduaries(shares, heirs, sumFractions, context) {
    if (compareFractions(sumFractions, fraction(1, 1)) >= 0) {
        return shares; // No residue left
    }

    let remainder = subtractFractions(fraction(1, 1), sumFractions);

    const addResiduaryShares = (maleKey, femaleKey, maleName, femaleName) => {
        let maleCount = heirs[maleKey] || 0;
        let femaleCount = heirs[femaleKey] || 0;
        
        let maleUnits = maleCount * 2;
        let femaleUnits = femaleCount;
        let totalUnits = maleUnits + femaleUnits;

        if (totalUnits > 0) {
            if (maleCount > 0) {
                shares.push({
                    heir: maleKey,
                    name: maleName,
                    count: maleCount,
                    baseShare: fraction(remainder.num * maleUnits, remainder.den * totalUnits),
                    adjustedShare: fraction(remainder.num * maleUnits, remainder.den * totalUnits),
                    status: 'Residuary'
                });
            }
            if (femaleCount > 0) {
                shares.push({
                    heir: femaleKey,
                    name: femaleName,
                    count: femaleCount,
                    baseShare: fraction(remainder.num * femaleUnits, remainder.den * totalUnits),
                    adjustedShare: fraction(remainder.num * femaleUnits, remainder.den * totalUnits),
                    status: 'Residuary'
                });
                context.messages.push(`Rule applied: Male gets double the female share (Each ${maleName} = 2 shares, Each ${femaleName} = 1 share).`);
            }
            return true;
        }
        return false;
    };

    // 1. Descendants
    if (heirs.son > 0 || heirs.daughter > 0) {
        if (addResiduaryShares('son', 'daughter', 'Son', 'Daughter (with Son)')) return shares;
    }
    if ((heirs.grandson > 0 || heirs.granddaughter > 0) && !context.blocked.grandson) {
         if (addResiduaryShares('grandson', 'granddaughter', 'Grandson', 'Granddaughter (with Grandson)')) return shares;
    }

    // 2. Ascendants
    if (heirs.father > 0) {
        let existing = shares.find(s => s.heir === 'father');
        if (existing) {
            existing.status = 'Sharer + Residuary';
            existing.baseShare = addFractions(existing.baseShare, remainder);
            existing.adjustedShare = existing.baseShare;
        } else {
            shares.push({
                heir: 'father',
                name: 'Father',
                count: 1,
                baseShare: remainder,
                adjustedShare: remainder,
                status: 'Residuary'
            });
        }
        return shares;
    }
    
    if (heirs.grandfather > 0 && !context.blocked.grandfather) {
        let existing = shares.find(s => s.heir === 'grandfather');
        if (existing) {
            existing.status = 'Sharer + Residuary';
            existing.baseShare = addFractions(existing.baseShare, remainder);
            existing.adjustedShare = existing.baseShare;
        } else {
            shares.push({
                heir: 'grandfather',
                name: 'Grandfather',
                count: 1,
                baseShare: remainder,
                adjustedShare: remainder,
                status: 'Residuary'
            });
        }
        return shares;
    }

    // 3. Siblings
    if ((heirs.brother > 0 || heirs.sister > 0) && !context.blocked.brother) {
        if (heirs.brother > 0) {
            if (addResiduaryShares('brother', 'sister', 'Full Brother', 'Full Sister (with Brother)')) return shares;
        } else if (heirs.sister > 0 && context.hasFemaleDescendants) {
            shares.push({
                heir: 'sister',
                name: 'Full Sister (with Descendants)',
                count: heirs.sister,
                baseShare: remainder,
                adjustedShare: remainder,
                status: 'Residuary'
            });
            return shares;
        }
    }
    
    // 4. Uncles
    if (heirs.uncle > 0 && !context.blocked.uncle) {
        shares.push({
            heir: 'uncle',
            name: 'Paternal Uncle',
            count: heirs.uncle,
            baseShare: remainder,
            adjustedShare: remainder,
            status: 'Residuary'
        });
        return shares;
    }

    return shares;
}
