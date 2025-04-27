const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    spotify_artist_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genre: { type: String },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artist', artistSchema);