const { City } = require('country-state-city');
const cities = City.getCitiesOfCountry('AU');
if (cities.length > 0) {
    console.log('City Keys:', Object.keys(cities[0]));
    console.log('Sample City:', JSON.stringify(cities[0], null, 2));
}
