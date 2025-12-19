<?php
// Fetch all vehicle categories from PostgreSQL
require_once 'config.php';
setHeaders();

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->query("SELECT id, category_name as name FROM vehicle_categories ORDER BY category_name");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($categories);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching categories: ' . $e->getMessage()]);
}
?>

