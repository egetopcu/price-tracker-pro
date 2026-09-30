import 'dotenv/config';
import express, { Router, type Request, type Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';

const router = Router();


router.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PRODUCTS_FILE: string = path.join(import.meta.dirname, 'scraperProducts.json');





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


router.post('/', (req: Request, res: Response) => {
  res.send('POST request to the homepage');
});



router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url); // throws if not a valid URL
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const urls: string[] = JSON.parse(data);

    if (urls.includes(url)) {
      return res.status(409).json({ error: 'URL already exists' });
    }

    urls.push(url);
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(urls, null, 2));

    res.status(201).json({ message: 'URL added', urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save URL' });
  }
});

router.post('/addproduct', async (req: Request, res: Response) => {

  

});




export default router;