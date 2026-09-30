import 'dotenv/config';
import express, { Router, type Request, type Response } from 'express';
import path from 'path';
import { Pool } from 'pg';

const router = Router();


router.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PRODUCTS_FILE: string = path.join(import.meta.dirname, 'scraperProducts.json');

router.get('/', async (req: Request, res: Response) => {
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

router.get('/:productid', async (req: Request, res: Response) => {
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

router.get('/latestprice/:productid', async (req: Request, res: Response) => {
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
  
  

export default router;