export function createReservation(req,res){
    return res.status(201).json({message: 'Reservation created successfully'});
}

export function getMyReservations(req,res){
    return res.status(200).json({message: 'List of my reservations'});
}

export function cancelReservation(req,res){
    return res.status(200).json({message: 'Reservation cancelled successfully'});
}

export function getRestaurantReservations(req,res){
    return res.status(200).json({message: 'List of reservations for the restaurant'});
}

export function updateReservationStatus(req,res){
    return res.status(200).json({message: 'Reservation status updated successfully'});
}