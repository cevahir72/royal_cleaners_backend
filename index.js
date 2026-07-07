const app = require('./app');
const syncDatabase = require('./config/sync');

const PORT = process.env.PORT || 3000;

async function start() {
  console.log('[SERVER] Başlatılıyor...');

  await syncDatabase();

  app.listen(PORT, () => {
    console.log(`[SERVER] API çalışıyor -> http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[SERVER] Başlatma hatası:', err.message);
  process.exit(1);
});
