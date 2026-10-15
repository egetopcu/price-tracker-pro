import 'dotenv/config';
import { app } from './app';
import { startDailyScrape } from './dailyScraper'

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startDailyScrape();
  });