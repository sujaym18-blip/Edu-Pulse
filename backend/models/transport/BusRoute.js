const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    stopName: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String, 
        required: true
    },
    departureTime: {
        type: String, 
        required: true
    }
});

const busRouteSchema = new mongoose.Schema({
    routeNumber: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: String, 
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    stops: [stopSchema]
});

const BusRoute = mongoose.model('BusRoute', busRouteSchema);

module.exports = BusRoute;
