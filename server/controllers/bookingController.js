import Booking from "../models/Booking"

// Function to check availability of car for a given date
export const checkAvailability = async (car, pickupDate, returnDate ) => {
    const bookings = await Booking.find({
        car, 
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate}
    })
    return bookings.length === 0;
}

