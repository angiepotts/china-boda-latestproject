<?php
// Test PostgreSQL Database Connection
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    // Test query
    $stmt = $pdo->query("SELECT version()");
    $version = $stmt->fetchColumn();
    
    // Check if tables exist
    $tables = ['vehicle_categories', 'vehicle_makes', 'vehicle_models', 'batteries'];
    $existingTables = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = '$table'
        )");
        if ($stmt->fetchColumn()) {
            $existingTables[] = $table;
        }
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful!',
        'postgresql_version' => $version,
        'database' => DB_NAME,
        'existing_tables' => $existingTables,
        'required_tables' => $tables,
        'all_tables_exist' => count($existingTables) === count($tables)
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

