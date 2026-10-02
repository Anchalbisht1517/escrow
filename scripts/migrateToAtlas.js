import mongoose from 'mongoose';
import 'dotenv/config';

// Define local source URI and Atlas target URI
const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/escrow';
const ATLAS_URI =
  process.argv[2] ||
  process.env.ATLAS_URI ||
  (process.env.MONGO_URI?.startsWith('mongodb+srv://') ? process.env.MONGO_URI : null);

if (!ATLAS_URI) {
  console.error('\n❌ Error: Atlas Connection String missing!');
  console.log('\nPlease run the command providing your Atlas connection string:');
  console.log('node scripts/migrateToAtlas.js "mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/escrow"\n');
  process.exit(1);
}

async function migrate() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Data Migration to MongoDB Atlas...');
  console.log(`📥 Source (Local): ${LOCAL_URI}`);
  console.log(`📤 Destination (Atlas): ${ATLAS_URI.replace(/:([^:@]+)@/, ':****@')}`);
  console.log('----------------------------------------------------\n');

  let localConn;
  let atlasConn;

  try {
    console.log('⏳ Connecting to Local MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local DB.');

    console.log('⏳ Connecting to MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas.\n');

    const collections = await localConn.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('⚠️  No collections found in local database.');
      process.exit(0);
    }

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      console.log(`🔄 Migrating collection: "${colName}"...`);
      const docs = await localConn.db.collection(colName).find({}).toArray();

      if (docs.length > 0) {
        await atlasConn.db.collection(colName).deleteMany({});
        await atlasConn.db.collection(colName).insertMany(docs);
        console.log(`  └─ ✅ Successfully copied ${docs.length} documents into "${colName}".`);
      } else {
        console.log(`  └─ ⚠️ Collection "${colName}" is empty. Skipped.`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now update your .env file with your Atlas connection string.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    process.exit(0);
  }
}

migrate();
