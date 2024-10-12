function convertToNgPerUl(value, unit) {
    switch (unit) {
        case 'µg/mL':
            return value * 1000; // µg/mL to ng/µL
        case 'mg/mL':
            return value * 1000000; // mg/mL to ng/µL
        default:
            return value; // ng/µL stays as ng/µL
    }
}

function drawGraph(stockVolume, diluentVolume, step) {
    const canvas = document.getElementById('dilutionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

    // Draw the container for the total volume
    ctx.fillStyle = '#D3D3D3';  // Light grey for the container
    ctx.fillRect(50, 50, 300, 200);

    // Draw the stock DNA volume
    const stockHeight = (stockVolume / (stockVolume + diluentVolume)) * 200; // Scaled to fit canvas
    ctx.fillStyle = '#4CAF50';  // Green for stock DNA
    ctx.fillRect(50, 250 - stockHeight, 300, stockHeight);

    // Draw the diluent volume
    const diluentHeight = (diluentVolume / (stockVolume + diluentVolume)) * 200; // Scaled to fit canvas
    ctx.fillStyle = '#2196F3';  // Blue for diluent
    ctx.fillRect(50, 250 - stockHeight - diluentHeight, 300, diluentHeight);

    // Label the volumes
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Step ${step}:`, 10, 30);
    ctx.fillText(`Stock DNA: ${stockVolume.toFixed(2)} µL`, 60, 270);
    ctx.fillText(`Diluent: ${diluentVolume.toFixed(2)} µL`, 60, 290);
}

function calculateDilution() {
    let initialConcentration = parseFloat(document.getElementById('initialConcentration').value);
    let targetConcentration = parseFloat(document.getElementById('targetConcentration').value);
    let finalVolume = parseFloat(document.getElementById('finalVolume').value);
    let initialUnit = document.getElementById('initialUnit').value;
    let targetUnit = document.getElementById('targetUnit').value;
    let dilutionSteps = parseInt(document.getElementById('dilutionSteps').value);

    if (isNaN(initialConcentration) || isNaN(targetConcentration) || isNaN(finalVolume)) {
        document.getElementById('output').innerHTML = "Please enter valid numbers.";
        return;
    }

    // Convert concentrations to ng/µL for consistent calculations
    initialConcentration = convertToNgPerUl(initialConcentration, initialUnit);
    targetConcentration = convertToNgPerUl(targetConcentration, targetUnit);

    if (targetConcentration >= initialConcentration) {
        document.getElementById('output').innerHTML = "Target concentration must be lower than current concentration.";
        return;
    }

    if (dilutionSteps === 1) {
        // One-Step Dilution Calculation
        let volumeOfStock = (targetConcentration * finalVolume) / initialConcentration;
        let volumeOfDiluent = finalVolume - volumeOfStock;

        document.getElementById('output').innerHTML =
            `For One-Step Dilution:<br>` +
            `Add <strong>${volumeOfStock.toFixed(2)} µL</strong> of stock DNA and ` +
            `<strong>${volumeOfDiluent.toFixed(2)} µL</strong> of diluent (water or buffer).`;

        // Draw graphical representation for One-Step Dilution
        drawGraph(volumeOfStock, volumeOfDiluent, 1);

    } else if (dilutionSteps === 2) {
        // Two-Step Dilution Calculation (assume first dilution is half-way concentration)
        let intermediateConcentration = (initialConcentration + targetConcentration) / 2;

        // Step 1: First dilution to intermediate concentration
        let volumeOfStockStep1 = (intermediateConcentration * finalVolume) / initialConcentration;
        let volumeOfDiluentStep1 = finalVolume - volumeOfStockStep1;

        // Step 2: Second dilution from intermediate concentration to target concentration
        let volumeOfStockStep2 = (targetConcentration * finalVolume) / intermediateConcentration;
        let volumeOfDiluentStep2 = finalVolume - volumeOfStockStep2;

        document.getElementById('output').innerHTML =
            `For Two-Step Dilution:<br>` +
            `Step 1: Dilute stock DNA to intermediate concentration of ` +
            `<strong>${intermediateConcentration.toFixed(2)} ng/µL</strong>:<br>` +
            `Add <strong>${volumeOfStockStep1.toFixed(2)} µL</strong> of stock DNA and ` +
            `<strong>${volumeOfDiluentStep1.toFixed(2)} µL</strong> of diluent.<br><br>` +

            `Step 2: Dilute the intermediate solution to the target concentration:<br>` +
            `Add <strong>${volumeOfStockStep2.toFixed(2)} µL</strong> of intermediate solution and ` +
            `<strong>${volumeOfDiluentStep2.toFixed(2)} µL</strong> of diluent.`;

        // Draw graphical representation for Two-Step Dilution (first step)
        drawGraph(volumeOfStockStep1, volumeOfDiluentStep1, 1);

        // Delay for second step visualization (optional)
        setTimeout(() => {
            drawGraph(volumeOfStockStep2, volumeOfDiluentStep2, 2);
        }, 2000);
    }
}
