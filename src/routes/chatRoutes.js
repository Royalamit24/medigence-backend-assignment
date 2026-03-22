const express = require('express');
const router = express.Router();
const  supabase  = require('../config/database');
const { authorizeRole } = require('../middleware/authMiddleware');

// ✅ Get messages by room
router.get('/:roomId', authorizeRole(['doctor', 'patient']), async (req, res) => {
  try {
    const { roomId } = req.params;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;