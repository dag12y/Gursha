export function getTablesByRestaurant(req, res) {
    const { restaurantId } = req.params;
    res.send(`Get all tables for restaurant ${restaurantId}`);
}

export function createTable(req, res) {
    res.send('Create a new table');
}

export function updateTable(req, res) {
    const { id } = req.params;
    res.send(`Update table with id ${id}`);
}

export function deleteTable(req, res) {
    const { id } = req.params;
    res.send(`Delete table with id ${id}`);
}