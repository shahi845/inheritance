import { blockingRules, blockingReasons } from '../data/shafiiRules.js';
import { capitalize } from '../utils/formatResults.js';

export function applyBlocking(heirs, context) {
    const blocked = {};

    for (const heir in blockingRules) {
        blocked[heir] = blockingRules[heir]({ heirs, context });
        if (blocked[heir] && heirs[heir] > 0) {
            context.messages.push(`${capitalize(heir)} is blocked by ${blockingReasons[heir] || 'closer relatives'}.`);
        }
    }
    
    // special logic for maternal sisters combined
    if (!blocked.maternalBrother && blocked.maternalSister && heirs.maternalBrother > 0 && heirs.maternalSister > 0) {
        // if maternal sister is blocked, it means they are both blocked if blocked by descendants.
        // The original logic just grouped them. We handled this in fixedShareRules.
    }

    context.blocked = blocked;
    return blocked;
}
