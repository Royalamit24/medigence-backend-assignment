const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Onboarding routes
router.post('/onboarding/save-draft', authorizeRole(['patient']), patientController.saveDraft);
router.get('/onboarding/draft', authorizeRole(['patient']), patientController.getDraft);
router.get('/onboarding/progress', authorizeRole(['patient']), patientController.getOnboardingProgress);
router.post('/onboarding/submit', authorizeRole(['patient']), patientController.submitOnboarding);

// Patient profile
router.get('/profile', authorizeRole(['patient']), patientController.getProfile);

// Get assigned doctor
router.get('/doctor', authorizeRole(['patient']), patientController.getAssignedDoctor);

module.exports = router;
