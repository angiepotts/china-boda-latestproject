<?php
// Fetch car makes based on category_id from PostgreSQL
require_once 'config.php';
setHeaders();

try {
    $pdo = getDBConnection();
    
    $categoryId = isset($_GET['category_id']) ? $_GET['category_id'] : null;
    
    if (!$categoryId) {
        http_response_code(400);
        echo json_encode(['error' => 'category_id parameter is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT id, make_name as name FROM vehicle_makes WHERE category_id = :category_id ORDER BY make_name");
    $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
    $stmt->execute();
    
    $makes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($makes);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching makes: ' . $e->getMessage()]);
}
?>

