const { City } = require('country-state-city');
const cities = City.getCitiesOfCountry('AU');
console.log(`Total cities in AU: ${cities.length}`);
const sydney = cities.find(c => c.name === 'Sydney');
console.log('Found Sydney?', !!sydney);
if (sydney) console.log(JSON.stringify(sydney, null, 2));
