const { Country } = require('country-state-city');
const countries = Country.getAllCountries();
console.log(`Total countries: ${countries.length}`);
if (countries.length > 0) {
    console.log('First 5 countries:', JSON.stringify(countries.slice(0, 5), null, 2));
}
