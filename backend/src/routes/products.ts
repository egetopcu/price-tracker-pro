import 'dotenv/config';
import express, { Router, type Request, type Response } from 'express';
import { Pool } from 'pg';
import { saveProductandPrice , productExists} from '../productRepository';

const router = Router();


router.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


//router.get('/ping', (req, res) => res.send('pong'));


router.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:productid', async (req: Request, res: Response) => {
  const {productid}= req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products where product_id = $1',
    [productid]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'url is required' });
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    if (await productExists(url)) {
      return res.status(409).json({ error: 'URL already exists' });
    }
    await saveProductandPrice(url)
    res.status(201).json({ message: 'URL added', url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save URL' });
  }

});




export default router;