import { normalizeInput } from './normalizeInput.js';
import { validateInput } from './validateInput.js';
import { buildContext } from './buildContext.js';
import { applyBlocking } from './applyBlocking.js';
import { assignFixedShares } from './assignFixedShares.js';
import { applyAwl } from './applyAwl.js';
import { assignResiduaries } from './assignResiduaries.js';
import { applyRadd } from './applyRadd.js';
import { capitalize } from '../utils/formatResults.js';

export function calculateInheritance(rawInput) {
    const heirs = normalizeInput(rawInput);
    validateInput(heirs);
    const context = buildContext(heirs);
    applyBlocking(heirs, context);

    let { shares, sumFractions } = assignFixedShares(heirs, context);
    sumFractions = applyAwl(shares, sumFractions, context);

    let prevSharesLength = shares.length;
    shares = assignResiduaries(shares, heirs, sumFractions, context);
    let hasResiduaries = shares.length > prevSharesLength || shares.some(s => s.status.includes('Residuary'));

    if (!hasResiduaries) {
        shares = applyRadd(shares, sumFractions, context);
    }

    for (const key in heirs) {
        if (heirs[key] > 0 && context.blocked[key]) {
            shares.push({
                heir: key,
                name: capitalize(key),
                count: heirs[key],
                baseShare: { num: 0, den: 1 },
                adjustedShare: { num: 0, den: 1 },
                status: 'Blocked',
                reason: ''
            });
        }
    }

    return { shares, messages: context.messages };
}
