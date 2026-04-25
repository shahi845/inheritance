import { defaultHeirs } from '../data/heirs.js';

export function normalizeInput(raw) {
    const heirs = { ...defaultHeirs };
    for (const key in heirs) {
        if (raw[key] !== undefined) {
            let val = parseInt(raw[key], 10);
            if (isNaN(val) || val < 0) val = 0;
            
            // Apply clamps
            if (key === 'husband' || key === 'father' || key === 'grandfather' || key === 'mother') {
                val = Math.min(val, 1);
            } else if (key === 'wife') {
                val = Math.min(val, 4);
            } else if (key === 'grandmother') {
                val = Math.min(val, 2);
            }
            heirs[key] = val;
        }
    }
    return heirs;
}
