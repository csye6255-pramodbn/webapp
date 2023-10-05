const express = require('express');
const router = express.Router();
var helper = require('../utils/helper');
var assignment = require('../controllers/assignment');

router.post('/', helper.aAuthCheck, assignment.createNewAssignment);

router.get('/:id', helper.aAuthCheck, assignment.getAssignment);

router.get('/', helper.aAuthCheck, assignment.getAllAssignments);
router.put('/:id', helper.aAuthCheck, assignment.putAssignmentInfo);

router.delete('/:id', helper.aAuthCheck, assignment.deleteAssignmentInfo);

module.exports = router;
