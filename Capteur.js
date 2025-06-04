const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const uri =
  "";
const client = new MongoClient(uri);

// Connexion à MongoDB
async function connectDb() {
  await client.connect();
  return client.db("Smart_sensor");
}

async function ajouterAlerte() {
  const db = await connectDb();
  await db.collection("measurements").insertOne(mesure);
  await client.close();
}

//ajouterAlerte();
// Endpoint pour les dernières mesures
app.get("/api/mesures", async (req, res) => {
  const db = await connectDb();
  const mesures = await db
    .collection("measurements")
    .find({})
    .sort({ timestamp: -1 })
    .toArray();
  res.json(mesures);
});

// Nombre total de capteurs
app.get("/api/capteurs/count", async (req, res) => {
  const db = await connectDb();
  const count = await db.collection("sensors").countDocuments();
  res.json({ count });
});
//delete last capteurs
app.delete("/api/capteurs/dernier-lot", async (req, res) => {
  try {
    const db = await connectDb();
    // On trie les capteurs par ordre décroissant (les plus récents d'abord)
    const derniersCapteurs = await db
      .collection("sensors")
      .find({})
      .sort({ _id: -1 }) // ObjectId contient la date de création
      .limit(10000)
      .toArray();

    const idsASupprimer = derniersCapteurs.map((doc) => doc._id);

    // Suppression
    const result = await db
      .collection("sensors")
      .deleteMany({ _id: { $in: idsASupprimer } });

    res.json({ message: `${result.deletedCount} capteurs supprimés.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur lors de la suppression." });
  }
});
app.get("/api/capteurs/repartition", async (req, res) => {
  const db = await connectDb();
  const aggregation = await db
    .collection("sensors")
    .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
    .toArray();

  const repartition = {
    température: 0,
    humidité: 0,
    pression: 0,
  };

  aggregation.forEach((item) => {
    if (repartition.hasOwnProperty(item._id)) {
      repartition[item._id] = item.count;
    }
  });

  res.json(repartition);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
