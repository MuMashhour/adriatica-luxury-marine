import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// In production use DATA_DIR (mounted persistent volume), else local
const dataDir = process.env.DATA_DIR || join(__dirname, '..');
const db = new Database(join(dataDir, 'database.sqlite'));

db.pragma('foreign_keys = ON');

// Create Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS homepage_content (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_image TEXT,
        vision_title TEXT,
        vision_text TEXT,
        vision_mission TEXT,
        vision_vision TEXT,
        vision_image TEXT,
        featured_title TEXT,
        featured_subtitle TEXT,
        featured_main_name TEXT,
        featured_main_price TEXT,
        featured_main_length TEXT,
        featured_main_engine TEXT,
        featured_main_year TEXT,
        featured_main_description TEXT,
        featured_main_image TEXT,
        featured_main_colors TEXT,
        featured_card1_title TEXT,
        featured_card1_text TEXT,
        featured_card1_image TEXT,
        featured_card2_title TEXT,
        featured_card2_text TEXT,
        featured_card2_image TEXT,
        cta_title TEXT,
        cta_text TEXT,
        cta_image TEXT,
        footer_description TEXT,
        footer_locations TEXT
    );

    CREATE TABLE IF NOT EXISTS boats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        price TEXT,
        length TEXT,
        beam TEXT,
        capacity TEXT,
        engine TEXT,
        year TEXT,
        description TEXT,
        main_image TEXT,
        is_authorised_resale INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS boat_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boat_id INTEGER,
        name TEXT,
        hex TEXT,
        FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS boat_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boat_id INTEGER,
        color_name TEXT,
        image_path TEXT,
        FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appraisals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        boat_model TEXT,
        boat_year TEXT,
        condition TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boat_id INTEGER,
        full_name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (boat_id) REFERENCES boats(id)
    );
`);

// Migrate: add new homepage columns if they don't exist
const newHomepageColumns = [
    ['hero_image', 'TEXT'],
    ['vision_image', 'TEXT'],
    ['featured_title', 'TEXT'],
    ['featured_subtitle', 'TEXT'],
    ['featured_main_name', 'TEXT'],
    ['featured_main_price', 'TEXT'],
    ['featured_main_length', 'TEXT'],
    ['featured_main_engine', 'TEXT'],
    ['featured_main_year', 'TEXT'],
    ['featured_main_description', 'TEXT'],
    ['featured_main_image', 'TEXT'],
    ['featured_main_colors', 'TEXT'],
    ['featured_card1_title', 'TEXT'],
    ['featured_card1_text', 'TEXT'],
    ['featured_card1_image', 'TEXT'],
    ['featured_card2_title', 'TEXT'],
    ['featured_card2_text', 'TEXT'],
    ['featured_card2_image', 'TEXT'],
    ['cta_image', 'TEXT'],
    ['footer_description', 'TEXT'],
    ['footer_locations', 'TEXT'],
    ['section_hero_enabled', 'INTEGER DEFAULT 1'],
    ['section_vision_enabled', 'INTEGER DEFAULT 1'],
    ['section_featured_enabled', 'INTEGER DEFAULT 1'],
    ['section_cta_enabled', 'INTEGER DEFAULT 1'],
];

const existingColumns = db.pragma('table_info(homepage_content)').map(c => c.name);
for (const [col, type] of newHomepageColumns) {
    if (!existingColumns.includes(col)) {
        db.exec(`ALTER TABLE homepage_content ADD COLUMN ${col} ${type}`);
    }
}

// Seed homepage content if empty
const homeContent = db.prepare('SELECT COUNT(*) as count FROM homepage_content').get();
if (homeContent.count === 0) {
    db.prepare(`
        INSERT INTO homepage_content (
            id, hero_title, hero_subtitle,
            vision_title, vision_text, vision_mission, vision_vision,
            featured_title, featured_subtitle,
            featured_main_name, featured_main_price, featured_main_length, featured_main_engine, featured_main_year, featured_main_description,
            featured_main_colors,
            featured_card1_title, featured_card1_text,
            featured_card2_title, featured_card2_text,
            cta_title, cta_text,
            footer_description, footer_locations
        ) VALUES (
            1, 'Elevate Your Story.', '',
            'Setting the Gold Standard in Marine Resale',
            'Adriatica was born from a passion for the sea and a commitment to transparency. We don''t just facilitate transactions; we curate transitions into new lifestyles.',
            'To provide a seamless, authoritative platform where trust and luxury converge for boat buyers and sellers across the Red Sea.',
            'Becoming the undisputed concierge for high-end marine vessels in the Middle East, anchored in heritage and innovation.',
            'Featured Vessels', 'Authorised resale selections from Seastorm & Regal.',
            'Seastorm 36X', '$285,000', '36 ft', 'Twin 300HP', '2023',
            'Engineered for the challenging waters of the Red Sea, the 36X combines raw power with an elegant mahogany-finished deck and state-of-the-art navigation.',
            '#001e40,#94a3b8,#004f56,#48626e',
            'Regal LX Series', 'Redefining the standard for coastal day boats with unparalleled upholstery and social layouts.',
            'Craftmanship Focus', 'Every authorised resale vessel undergoes a 120-point technical inspection by our master mariners.',
            'Ready to list your vessel?', 'Join Egypt''s most exclusive maritime network. We connect serious sellers with qualified international buyers.',
            'Premium Marine Brokerage', 'El Gouna | Hurghada | Cairo'
        )
    `).run();
}

// Seed boats if empty
const boatCount = db.prepare('SELECT COUNT(*) as count FROM boats').get();
if (boatCount.count === 0) {
    const s12 = db.prepare(`
        INSERT INTO boats (name, brand, price, length, beam, capacity, engine, year, description, main_image)
        VALUES ('SeaStorm 12', 'Seastorm', '$285,000', '12 ft', '5.4 ft', '4', 'Varies', '2023', 'A masterclass in modern Norwegian engineering. Forged from nearly indestructible HPLC...', '/seastorm12/SeaStorm 12 Advantage black 1.jpg')
    `).run();

    const s12Id = s12.lastInsertRowid;
    const colors12 = [
        { name: 'Black', hex: '#0a0a0a' },
        { name: 'White', hex: '#cfcfcf' },
        { name: 'Grey', hex: '#808080' },
        { name: 'Red', hex: '#8b0000' },
        { name: 'Yellow', hex: '#ffcc00' },
        { name: 'Lime', hex: '#32cd32' },
    ];
    colors12.forEach(c => {
        db.prepare('INSERT INTO boat_colors (boat_id, name, hex) VALUES (?, ?, ?)').run(s12Id, c.name, c.hex);
        db.prepare('INSERT INTO boat_images (boat_id, color_name, image_path) VALUES (?, ?, ?)').run(s12Id, c.name, `/seastorm12/SeaStorm 12 Advantage ${c.name.toLowerCase()} 1.jpg`);
    });

    const s17 = db.prepare(`
        INSERT INTO boats (name, brand, price, length, beam, capacity, engine, year, description, main_image)
        VALUES ('SeaStorm 17', 'Seastorm', 'Inquire', '17 ft', '6.9 ft', '6', 'Up to 60HP', '2024', 'The Ultimate Multi-Role Vessel. Double-walled HDPE construction...', '/assets/seastorm/17green.jpg')
    `).run();

    const s17Id = s17.lastInsertRowid;
    const colors17 = [
        { name: 'Green', hex: '#2d5a27' },
        { name: 'Grey', hex: '#808080' },
        { name: 'Red', hex: '#8b0000' },
        { name: 'White', hex: '#f0f0f0' },
    ];
    colors17.forEach(c => {
        db.prepare('INSERT INTO boat_colors (boat_id, name, hex) VALUES (?, ?, ?)').run(s17Id, c.name, c.hex);
        db.prepare('INSERT INTO boat_images (boat_id, color_name, image_path) VALUES (?, ?, ?)').run(s17Id, c.name, `/assets/seastorm/17${c.name.toLowerCase()}.jpg`);
    });
}

export default db;
