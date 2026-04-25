import { calculateInheritance } from './engine/calculateInheritance.js';
import { formatResults } from './utils/formatResults.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsBody = document.getElementById('resultsBody');
    const messagesContainer = document.getElementById('messages');
    const scholarMode = document.getElementById('scholarMode');

    scholarMode.addEventListener('change', (e) => {
        if (e.target.checked && !resultsSection.classList.contains('hidden')) {
            messagesContainer.classList.remove('hidden');
        } else {
            messagesContainer.classList.add('hidden');
        }
    });

    resetBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = 0;
        });
        document.getElementById('estateValue').value = '';
        resultsSection.classList.add('hidden');
        messagesContainer.classList.add('hidden');
        document.getElementById('printBtn').classList.add('hidden');
    });

    calculateBtn.addEventListener('click', () => {
        const heirsInput = {};
        const inputs = document.querySelectorAll('.heirs-grid input[type="number"]');
        inputs.forEach(input => {
            heirsInput[input.id] = input.value;
        });

        const estateValue = parseFloat(document.getElementById('estateValue').value) || 0;

        try {
            const { shares, messages } = calculateInheritance(heirsInput);
            const formattedShares = formatResults(shares, estateValue);
            displayResults(formattedShares, messages);
        } catch (error) {
            alert(error.message);
        }
    });

    function displayResults(shares, messages) {
        resultsBody.innerHTML = '';
        messagesContainer.innerHTML = '';
        
        shares.forEach(share => {
            const tr = document.createElement('tr');
            
            let statusClass = '';
            if(share.status.includes('Blocked')) statusClass = 'status-blocked';
            else if (share.status.includes('Residuary')) statusClass = 'status-residuary';
            else statusClass = 'status-sharer';

            tr.innerHTML = `
                <td>${share.name}</td>
                <td>${share.count}</td>
                <td class="${statusClass}">${share.status}</td>
                <td>${share.fracText}</td>
                <td>${share.pctPerPerson > 0 ? share.pctPerPerson.toFixed(2) + '%' : '0%'}</td>
                <td>${share.amountPerPerson !== '-' ? '$' + share.amountPerPerson : '-'}</td>
                <td style="font-size: 0.9em; opacity: 0.8">${share.reason || '-'}</td>
            `;
            resultsBody.appendChild(tr);
        });

        messages.forEach((msg, idx) => {
            const div = document.createElement('div');
            div.className = 'message ' + (msg.includes('Blocked') ? 'warning' : '');
            div.textContent = `${idx + 1}. ${msg}`;
            messagesContainer.appendChild(div);
        });

        resultsSection.classList.remove('hidden');
        if (scholarMode.checked) {
            messagesContainer.classList.remove('hidden');
        } else {
            messagesContainer.classList.add('hidden');
        }
        document.getElementById('printBtn').classList.remove('hidden');
    }
});
