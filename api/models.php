<?php
// Fetch car models based on make_id from PostgreSQL
require_once 'config.php';
setHeaders();

try {
    $pdo = getDBConnection();
    
    $makeId = isset($_GET['make_id']) ? $_GET['make_id'] : null;
    
    if (!$makeId) {
        http_response_code(400);
        echo json_encode(['error' => 'make_id parameter is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT id, model_name as name FROM vehicle_models WHERE make_id = :make_id ORDER BY model_name");
    $stmt->bindParam(':make_id', $makeId, PDO::PARAM_INT);
    $stmt->execute();
    
    $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($models);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching models: ' . $e->getMessage()]);
}
?>

