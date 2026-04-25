import { fraction } from '../utils/fractions.js';

export const blockingRules = {
    grandfather: ({ heirs }) => heirs.father > 0,
    grandmother: ({ heirs }) => heirs.mother > 0 || heirs.father > 0,
    grandson: ({ heirs }) => heirs.son > 0,
    granddaughter: ({ heirs }) => heirs.son > 0 || heirs.daughter >= 2,
    brother: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.father > 0 || heirs.grandfather > 0,
    sister: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.father > 0 || heirs.grandfather > 0,
    paternalBrother: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.father > 0 || heirs.grandfather > 0 || heirs.brother > 0 || (heirs.sister > 0 && (heirs.daughter > 0 || heirs.granddaughter > 0)),
    paternalSister: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.father > 0 || heirs.grandfather > 0 || heirs.brother > 0 || heirs.sister >= 2 || (heirs.sister > 0 && (heirs.daughter > 0 || heirs.granddaughter > 0)),
    maternalBrother: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.daughter > 0 || heirs.granddaughter > 0 || heirs.father > 0 || heirs.grandfather > 0,
    maternalSister: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.daughter > 0 || heirs.granddaughter > 0 || heirs.father > 0 || heirs.grandfather > 0,
    uncle: ({ heirs }) => heirs.son > 0 || heirs.grandson > 0 || heirs.father > 0 || heirs.grandfather > 0 || heirs.brother > 0 || heirs.paternalBrother > 0 || (heirs.sister > 0 && (heirs.daughter > 0 || heirs.granddaughter > 0))
};

export const blockingReasons = {
    grandfather: "Father",
    grandmother: "Mother/Father",
    grandson: "Son",
    granddaughter: "Daughter (if 2+) or Son",
    brother: "Son/Grandson/Father/Grandfather",
    sister: "Son/Grandson/Father/Grandfather",
    paternalBrother: "Brother, Sister (with Descendant), or closer relative",
    paternalSister: "Brother, Sister (if 2+ or with Descendant), or closer relative",
    maternalBrother: "Descendant or Ascendant Male",
    maternalSister: "Descendant or Ascendant Male",
    uncle: "Brother or closer relative"
};

export const fixedShareRules = {
    husband: {
        eligible: ({ heirs }) => heirs.husband === 1,
        share: ({ context }) => context.hasDescendants ? fraction(1, 4) : fraction(1, 2)
    },
    wife: {
        eligible: ({ heirs }) => heirs.wife > 0,
        share: ({ context }) => context.hasDescendants ? fraction(1, 8) : fraction(1, 4)
    },
    mother: {
        eligible: ({ heirs }) => heirs.mother === 1,
        share: ({ context, heirs }) => {
            if (context.hasDescendants || context.siblingCount >= 2) return fraction(1, 6);
            if (heirs.father > 0 && (heirs.husband > 0 || heirs.wife > 0)) {
                // Gharāwiyyatayn
                if (heirs.husband > 0) return fraction(1, 6); // 1/3 of remainder (1/2)
                if (heirs.wife > 0) return fraction(1, 4);   // 1/3 of remainder (3/4)
            }
            return fraction(1, 3);
        }
    },
    grandmother: {
        eligible: ({ heirs, context }) => heirs.grandmother > 0 && !context.blocked.grandmother,
        share: () => fraction(1, 6)
    },
    father: {
        eligible: ({ heirs, context }) => heirs.father === 1,
        share: ({ context }) => {
            if (context.hasMaleDescendants) return fraction(1, 6);
            if (context.hasDescendants) return fraction(1, 6); // Sharer + Residuary
            return null; // Residuary only
        }
    },
    grandfather: {
        eligible: ({ heirs, context }) => heirs.grandfather === 1 && !context.blocked.grandfather,
        share: ({ context }) => {
            if (context.hasMaleDescendants) return fraction(1, 6);
            if (context.hasDescendants) return fraction(1, 6); // Sharer + Residuary
            return null; // Residuary only
        }
    },
    daughter: {
        eligible: ({ heirs }) => heirs.daughter > 0 && heirs.son === 0,
        share: ({ heirs }) => heirs.daughter === 1 ? fraction(1, 2) : fraction(2, 3)
    },
    granddaughter: {
        eligible: ({ heirs, context }) => heirs.granddaughter > 0 && heirs.grandson === 0 && !context.blocked.granddaughter,
        share: ({ heirs }) => {
            if (heirs.daughter === 1) return fraction(1, 6); // To complete 2/3
            return heirs.granddaughter === 1 ? fraction(1, 2) : fraction(2, 3);
        }
    },
    sister: {
        eligible: ({ heirs, context }) => heirs.sister > 0 && !context.blocked.sister && heirs.brother === 0 && !context.hasDescendants,
        share: ({ heirs }) => heirs.sister === 1 ? fraction(1, 2) : fraction(2, 3)
    },
    paternalSister: {
        eligible: ({ heirs, context }) => heirs.paternalSister > 0 && !context.blocked.paternalSister && heirs.paternalBrother === 0 && !context.hasDescendants,
        share: ({ heirs }) => {
            if (heirs.sister === 1) return fraction(1, 6); // To complete 2/3
            return heirs.paternalSister === 1 ? fraction(1, 2) : fraction(2, 3);
        }
    },
    maternalSiblings: {
        eligible: ({ heirs, context }) => {
            const count = (context.blocked.maternalBrother ? 0 : heirs.maternalBrother) + (context.blocked.maternalSister ? 0 : heirs.maternalSister);
            return count > 0;
        },
        share: ({ heirs, context }) => {
            const count = (context.blocked.maternalBrother ? 0 : heirs.maternalBrother) + (context.blocked.maternalSister ? 0 : heirs.maternalSister);
            return count === 1 ? fraction(1, 6) : fraction(1, 3);
        }
    }
};
