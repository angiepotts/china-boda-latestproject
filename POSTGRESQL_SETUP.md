# PostgreSQL Database Connection Setup

## 📋 Requirements

1. **PostgreSQL** installed on your PC
2. **PHP** with PostgreSQL extension enabled
3. **Database** named `vehicle_db` created
4. **Tables** created: `categories`, `makes`, `models`, `batteries`

## 🔧 Configuration Steps

### 1. Update Database Credentials

Open `api/config.php` and update these values:

```php
define('DB_HOST', 'localhost');        // Usually 'localhost'
define('DB_NAME', 'vehicle_db');       // Your database name
define('DB_USER', 'postgres');         // Your PostgreSQL username
define('DB_PASS', '1234');             // Your PostgreSQL password (CHANGE THIS!)
define('DB_PORT', '5432');             // Usually '5432'
```

### 2. Enable PostgreSQL Extension in PHP

Make sure PHP has PostgreSQL extension enabled:

1. Open `php.ini` file
2. Find and uncomment (remove `;`) this line:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   ```
3. Restart your web server (Apache/XAMPP/WAMP)

### 3. Test Database Connection

Create a test file `api/test_connection.php`:

```php
<?php
require_once 'config.php';
try {
    $pdo = getDBConnection();
    echo json_encode(['message' => 'Database connection successful!']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

Visit: `http://localhost/your-project/api/test_connection.php`

### 4. Database Schema

Make sure your database has these tables:

#### Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
```

#### Makes Table
```sql
CREATE TABLE makes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

#### Models Table
```sql
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    make_id INTEGER NOT NULL,
    FOREIGN KEY (make_id) REFERENCES makes(id) ON DELETE CASCADE
);
```

#### Batteries Table
```sql
CREATE TABLE batteries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL,
    make_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL,
    specifications TEXT,
    price DECIMAL(10,2),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (make_id) REFERENCES makes(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);
```

## 🚀 How It Works

1. **User opens battery finder form** → `loadCategories()` fetches categories from database
2. **User selects category** → `loadMakes()` fetches makes for that category
3. **User selects make** → `loadModels()` fetches models for that make
4. **User clicks "FIND BATTERY"** → `findBattery()` searches batteries in database
5. **Results displayed** → Shows batteries matching the selected category, make, and model

## 📝 API Endpoints

- `GET ./api/categories.php` - Get all categories
- `GET ./api/makes.php?category_id=X` - Get makes for category
- `GET ./api/models.php?make_id=X` - Get models for make
- `POST ./api/battery_search.php` - Search batteries

## ⚠️ Troubleshooting

### Error: "Database connection failed"
- Check PostgreSQL is running
- Verify credentials in `api/config.php`
- Check PostgreSQL port (default: 5432)

### Error: "Class 'PDO' not found"
- Enable `pdo_pgsql` extension in `php.ini`
- Restart web server

### Error: "No batteries found"
- Check if data exists in `batteries` table
- Verify `category_id`, `make_id`, `model_id` match your selections

### CORS Errors
- Make sure you're accessing via web server (not `file://`)
- Check `setHeaders()` function in `api/config.php`

## ✅ Testing

1. Open website in browser
2. Click "FIND YOUR BATTERY" button
3. Select Category → Make → Model
4. Click "FIND BATTERY"
5. Results should show batteries from your PostgreSQL database

