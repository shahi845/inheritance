export function validateInput(heirs) {
    if (heirs.husband > 0 && heirs.wife > 0) {
        throw new Error("Invalid input: Cannot have both husband and wife as heirs.");
    }
}
