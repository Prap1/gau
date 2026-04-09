const fs = require('fs');
const dir = './src/redux';
const tasks = [
    {f: 'treatmentSlice.ts', state: 'treatments', fetch: 'fetchTreatments'},
    {f: 'visitorSlice.ts', state: 'visitors', fetch: 'fetchVisitors'},
    {f: 'donorSlice.ts', state: 'donors', fetch: 'fetchDonors'},
    {f: 'medicineSlice.ts', state: 'medicines', fetch: 'fetchMedicines'},
    {f: 'inventorySlice.ts', state: 'foodStocks', fetch: 'fetchFoodStocks'},
    {f: 'medicineUsageSlice.ts', state: 'usages', fetch: 'fetchMedicineUsages'},
    {f: 'diseaseSlice.ts', state: 'diseases', fetch: 'fetchDiseases'},
    {f: 'symptomSlice.ts', state: 'symptoms', fetch: 'fetchSymptoms'},
    {f: 'medicalStoreSlice.ts', state: 'medicalStores', lineIsSingle: true, fetch: 'fetchMedicalStores'},
    {f: 'userSlice.ts', state: 'users', fetch: 'fetchUsers'}
];

tasks.forEach(t => {
    let p = dir + '/' + t.f;
    if(!fs.existsSync(p)) return;
    
    let lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
    let insidePending = false;
    for(let i = 0; i < lines.length; i++) {
        if(lines[i].includes(`.addCase(${t.fetch}.pending`)) {
            // Check if it's on the same line
            if (lines[i].includes('state.loading = true')) {
                   lines[i] = lines[i].replace('state.loading = true', `if (state.${t.state}.length === 0) state.loading = true`);
            } else {
                insidePending = true;
            }
        } else if(insidePending) {
            if(lines[i].includes('state.loading = true')) {
                lines[i] = lines[i].replace('state.loading = true', `if (state.${t.state}.length === 0) state.loading = true`);
                insidePending = false;
            }
            if(lines[i].includes('}')) {
                insidePending = false;
            }
        }
    }
    fs.writeFileSync(p, lines.join('\n'));
});
