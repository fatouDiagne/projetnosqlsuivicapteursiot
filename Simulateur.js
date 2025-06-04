const { MongoClient } = require('mongodb');
const { MONGODB_URI, DB_OPTIONS } = require('./dbconfig'); // Même import
const uri = "";

// Configuration des capteurs
const SITES = ['Usine Nord', 'Usine Sud', 'Usine Est'];
const TYPES = ['température', 'humidité', 'pression'];

async function simulate() {
  const client = new MongoClient(uri);
  await client.connect();
  
  // Génération de 10 000 capteurs
  const sensors = Array.from({ length: 10000 }, (_, i) => ({
    capteur_id: `SENS${10000 + i}`,
    site: SITES[Math.floor(Math.random() * SITES.length)],
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    seuil_min: Math.random() * 20 + 10,  // Valeurs aléatoires
    seuil_max: Math.random() * 30 + 40
  }));

  // Insertion initiale
  await client.db().collection('sensors').insertMany(sensors);

  // Génération de mesures toutes les 10 secondes
  setInterval(async () => {
    const batch = sensors.map(sensor => ({
      capteur_id: sensor.capteur_id,
      timestamp: new Date(),
      valeur: getRandomValue(sensor.type),
      site: sensor.site,
      type: sensor.type
    }));
    
    await client.db().collection('measurements').insertMany(batch);
    console.log(`${batch.length} mesures insérées`);
  }, 10000);
}

function getRandomValue(type) {
  // Retourne des valeurs réalistes selon le type
  switch(type) {
    case 'température': return Math.random() * 30 + 10;  // 10-40°C
    case 'humidité': return Math.random() * 70 + 20;     // 20-90%
    case 'pression': return Math.random() * 300 + 900;   // 900-1200 hPa
  }
}

simulate().catch(console.error); 
