<?php
// Search for batteries based on category, make, and model
require_once 'config.php';
setHeaders();

try {
    $pdo = getDBConnection();
    
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $categoryId = isset($data['category_id']) ? $data['category_id'] : null;
    $makeId = isset($data['make_id']) ? $data['make_id'] : null;
    $modelId = isset($data['model_id']) ? $data['model_id'] : null;
    
    if (!$categoryId || !$makeId || !$modelId) {
        http_response_code(400);
        echo json_encode(['error' => 'category_id, make_id, and model_id are required']);
        exit;
    }
    
    // Select only essential fields: id, name, specifications, price
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            specifications,
            price
        FROM batteries
        WHERE category_id = :category_id AND make_id = :make_id AND model_id = :model_id
        ORDER BY id ASC
    ");
    
    $stmt->execute([
        ':category_id' => $categoryId,
        ':make_id' => $makeId,
        ':model_id' => $modelId
    ]);
    
    $batteries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response - only essential fields
    $formattedBatteries = array_map(function($battery) {
        $result = [
            'id' => $battery['id'],
            'name' => $battery['name'],
            'battery_name' => $battery['name']
        ];
        
        // Add specifications only if column exists and has value
        if (isset($battery['specifications']) && !empty($battery['specifications'])) {
            $result['specifications'] = $battery['specifications'];
            $result['specs'] = $battery['specifications'];
        }
        
        // Add price only if column exists and has value
        if (isset($battery['price']) && $battery['price'] && $battery['price'] > 0) {
            $result['price'] = number_format((float)$battery['price'], 2) . ' TZS';
        } else {
            $result['price'] = 'Contact for price';
        }
        
        return $result;
    }, $batteries);
    
    echo json_encode(['batteries' => $formattedBatteries]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>

