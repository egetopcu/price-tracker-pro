import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';


const app: Express = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PRODUCTS_FILE: string = path.join(import.meta.dirname, 'scraperProducts.json');

app.get('/products/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/products/:productid', async (req: Request, res: Response) => {
  const {productid}= req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products where product_id = $1');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/prices', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
              COALESCE(json_agg(r.*) FILTER (WHERE r.product_id IS NOT NULL), '[]') AS prices
       FROM products p
       LEFT JOIN prices r ON r.product_id = p.product_id
       GROUP BY p.product_id
       ORDER BY p.product_id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/prices/:productid', async (req: Request, res: Response) => {
  const {productid}= req.params;
  try{
    const { rows } = await pool.query(
      `SELECT p.*,
              COALESCE(json_agg(r.*) FILTER (WHERE r.product_id IS NOT NULL), '[]') AS prices
       FROM products p
       LEFT JOIN prices r ON r.product_id = p.product_id
       WHERE p.product_id = $1
       GROUP BY p.product_id`,
      [productid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/productlatestprice/:productid', async (req: Request, res: Response) => {
  const {productid}= req.params;
  try{
    const { rows } = await pool.query(
      `SELECT p.*,
            to_json(r.*) AS latest_price
      FROM products p
      LEFT JOIN LATERAL (
      SELECT *
      FROM prices
      WHERE prices.product_id = p.product_id
      ORDER BY created_at DESC
      LIMIT 1
      ) r ON true
      WHERE p.product_id = $1`,
      [productid]
      );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.post('/', (req: Request, res: Response) => {
  res.send('POST request to the homepage');
});





app.post('/products', async (req: Request, res: Response) => {
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




app.listen(4000);