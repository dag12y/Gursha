export function getAllRestaurants(req, res) {
    return res.status(200).json({message: 'List of all restaurants'});
}

export function getRestaurantById(req, res) {
    const {id} = req.params;
    return res.status(200).json({message: `Details of restaurant with id ${id}`});
}

export function createRestaurant(req, res) {
    return res.status(201).json({message: 'Restaurant created successfully'});
}

export function updateRestaurant(req, res) {
    const {id} = req.params;
    return res.status(200).json({message: `Restaurant with id ${id} updated successfully`});
}

export function deleteRestaurant(req, res) {
    const {id} = req.params;
    return res.status(200).json({message: `Restaurant with id ${id} deleted successfully`});
}