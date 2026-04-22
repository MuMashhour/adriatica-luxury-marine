import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// In production, uploads live on the persistent volume; in dev, inside /public
const dataDir = process.env.DATA_DIR || join(__dirname, '..');
const uploadsDir = isProd ? join(dataDir, 'uploads') : join(__dirname, '../public/uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

// Static files: public assets (site-images, seastorm12, etc.) + uploads
const publicDir = join(__dirname, '../public');
app.use(express.static(publicDir));
// In production, also serve uploads from the data volume
if (isProd) {
    app.use('/uploads', express.static(uploadsDir));
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// --- Image Upload Endpoint ---
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ path: `/uploads/${req.file.filename}` });
});

// Upload multiple images at once
app.post('/api/upload/multiple', upload.array('images', 20), (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const paths = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ paths });
});

// --- Homepage API ---
app.get('/api/homepage', (req, res) => {
    const content = db.prepare('SELECT * FROM homepage_content WHERE id = 1').get();
    res.json(content);
});

app.put('/api/homepage', (req, res) => {
    const fields = [
        'hero_title', 'hero_subtitle', 'hero_image',
        'vision_title', 'vision_text', 'vision_mission', 'vision_vision', 'vision_image',
        'featured_title', 'featured_subtitle',
        'featured_main_name', 'featured_main_price', 'featured_main_length',
        'featured_main_engine', 'featured_main_year', 'featured_main_description',
        'featured_main_image', 'featured_main_colors',
        'featured_card1_title', 'featured_card1_text', 'featured_card1_image',
        'featured_card2_title', 'featured_card2_text', 'featured_card2_image',
        'cta_title', 'cta_text', 'cta_image',
        'footer_description', 'footer_locations',
        'section_hero_enabled', 'section_vision_enabled',
        'section_featured_enabled', 'section_cta_enabled'
    ];
    const set = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => req.body[f] ?? null);
    db.prepare(`UPDATE homepage_content SET ${set} WHERE id = 1`).run(...values);
    res.json({ success: true });
});

// Homepage image upload
app.post('/api/homepage/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { field } = req.body;
    if (!field) return res.status(400).json({ error: 'Missing field name' });
    const path = `/uploads/${req.file.filename}`;
    db.prepare(`UPDATE homepage_content SET ${field} = ? WHERE id = 1`).run(path);
    res.json({ path });
});

// --- Boats API ---
app.get('/api/boats', (req, res) => {
    const boats = db.prepare('SELECT * FROM boats').all();
    const detailed = boats.map(boat => {
        const colors = db.prepare('SELECT * FROM boat_colors WHERE boat_id = ?').all(boat.id);
        const images = db.prepare('SELECT * FROM boat_images WHERE boat_id = ?').all(boat.id);
        return { ...boat, colors, images };
    });
    res.json(detailed);
});

app.get('/api/boats/:id', (req, res) => {
    const boat = db.prepare('SELECT * FROM boats WHERE id = ?').get(req.params.id);
    if (!boat) return res.status(404).json({ error: 'Boat not found' });
    const colors = db.prepare('SELECT * FROM boat_colors WHERE boat_id = ?').all(boat.id);
    const images = db.prepare('SELECT * FROM boat_images WHERE boat_id = ?').all(boat.id);
    res.json({ ...boat, colors, images });
});

app.post('/api/boats', (req, res) => {
    const { name, brand, price, length, beam, capacity, engine, year, description, main_image, is_authorised_resale } = req.body;
    const result = db.prepare(`
        INSERT INTO boats (name, brand, price, length, beam, capacity, engine, year, description, main_image, is_authorised_resale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, brand, price, length, beam, capacity, engine, year, description, main_image, is_authorised_resale ?? 1);
    res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/boats/:id', (req, res) => {
    const { name, brand, price, length, beam, capacity, engine, year, description, main_image, is_authorised_resale } = req.body;
    db.prepare(`
        UPDATE boats SET name=?, brand=?, price=?, length=?, beam=?, capacity=?, engine=?, year=?, description=?, main_image=?, is_authorised_resale=?
        WHERE id=?
    `).run(name, brand, price, length, beam, capacity, engine, year, description, main_image, is_authorised_resale ?? 1, req.params.id);
    res.json({ success: true });
});

app.delete('/api/boats/:id', (req, res) => {
    // Clean up uploaded images for this boat
    const images = db.prepare('SELECT image_path FROM boat_images WHERE boat_id = ?').all(req.params.id);
    images.forEach(img => {
        if (img.image_path?.startsWith('/uploads/')) {
            const filePath = join(uploadsDir, img.image_path.replace('/uploads/', ''));
            try { unlinkSync(filePath); } catch {}
        }
    });
    db.prepare('DELETE FROM boats WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Upload boat main image
app.post('/api/boats/:id/upload-main', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const path = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE boats SET main_image = ? WHERE id = ?').run(path, req.params.id);
    res.json({ path });
});

// --- Boat Colors ---
app.get('/api/boats/:id/colors', (req, res) => {
    const colors = db.prepare('SELECT * FROM boat_colors WHERE boat_id = ?').all(req.params.id);
    res.json(colors);
});

app.post('/api/boats/:id/colors', (req, res) => {
    const { name, hex } = req.body;
    const result = db.prepare('INSERT INTO boat_colors (boat_id, name, hex) VALUES (?, ?, ?)').run(req.params.id, name, hex);
    res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/colors/:colorId', (req, res) => {
    const { name, hex } = req.body;
    db.prepare('UPDATE boat_colors SET name = ?, hex = ? WHERE id = ?').run(name, hex, req.params.colorId);
    res.json({ success: true });
});

app.delete('/api/colors/:colorId', (req, res) => {
    // Clean up images for this color
    const colorRow = db.prepare('SELECT * FROM boat_colors WHERE id = ?').get(req.params.colorId);
    if (colorRow) {
        const images = db.prepare('SELECT * FROM boat_images WHERE boat_id = ? AND color_name = ?').all(colorRow.boat_id, colorRow.name);
        images.forEach(img => {
            if (img.image_path?.startsWith('/uploads/')) {
                const filePath = join(uploadsDir, img.image_path.replace('/uploads/', ''));
                try { unlinkSync(filePath); } catch {}
            }
        });
        db.prepare('DELETE FROM boat_images WHERE boat_id = ? AND color_name = ?').run(colorRow.boat_id, colorRow.name);
    }
    db.prepare('DELETE FROM boat_colors WHERE id = ?').run(req.params.colorId);
    res.json({ success: true });
});

// --- Boat Images ---
app.get('/api/boats/:id/images', (req, res) => {
    const { color } = req.query;
    let images;
    if (color) {
        images = db.prepare('SELECT * FROM boat_images WHERE boat_id = ? AND color_name = ?').all(req.params.id, color);
    } else {
        images = db.prepare('SELECT * FROM boat_images WHERE boat_id = ?').all(req.params.id);
    }
    res.json(images);
});

app.post('/api/boats/:id/images', upload.array('images', 20), (req, res) => {
    const { color_name } = req.body;
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const inserted = req.files.map(file => {
        const path = `/uploads/${file.filename}`;
        const result = db.prepare('INSERT INTO boat_images (boat_id, color_name, image_path) VALUES (?, ?, ?)').run(req.params.id, color_name, path);
        return { id: result.lastInsertRowid, path };
    });
    res.json({ success: true, images: inserted });
});

app.delete('/api/images/:imageId', (req, res) => {
    const image = db.prepare('SELECT * FROM boat_images WHERE id = ?').get(req.params.imageId);
    if (image?.image_path?.startsWith('/uploads/')) {
        const filePath = join(uploadsDir, image.image_path.replace('/uploads/', ''));
        try { unlinkSync(filePath); } catch {}
    }
    db.prepare('DELETE FROM boat_images WHERE id = ?').run(req.params.imageId);
    res.json({ success: true });
});

// --- Appraisals API ---
app.get('/api/appraisals', (req, res) => {
    const appraisals = db.prepare('SELECT * FROM appraisals ORDER BY created_at DESC').all();
    res.json(appraisals);
});

app.post('/api/appraisals', (req, res) => {
    const { full_name, email, phone, boat_model, boat_year, condition, description } = req.body;
    const result = db.prepare(`
        INSERT INTO appraisals (full_name, email, phone, boat_model, boat_year, condition, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(full_name, email, phone, boat_model, boat_year, condition, description);
    res.json({ success: true, id: result.lastInsertRowid });
});

// --- Inquiries API ---
app.get('/api/inquiries', (req, res) => {
    const inquiries = db.prepare(`
        SELECT inquiries.*, boats.name as boat_name
        FROM inquiries
        JOIN boats ON inquiries.boat_id = boats.id
        ORDER BY inquiries.created_at DESC
    `).all();
    res.json(inquiries);
});

app.post('/api/inquiries', (req, res) => {
    const { boat_id, full_name, email, message } = req.body;
    const result = db.prepare(`
        INSERT INTO inquiries (boat_id, full_name, email, message)
        VALUES (?, ?, ?, ?)
    `).run(boat_id, full_name, email, message);
    res.json({ success: true, id: result.lastInsertRowid });
});

// In production, serve the built React app for all non-API routes
if (isProd) {
    const distDir = join(__dirname, '../dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
        res.sendFile(join(distDir, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
