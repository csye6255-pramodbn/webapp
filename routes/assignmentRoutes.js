const express = require('express');
const router = express.Router();
var helper = require('../utils/helper');
var assignment = require('../controllers/assignment');

router.post('/', helper.aAuthCheck, assignment.createNewAssignment);
router.post('/*', helper.invalidPath);
router.get('/:id', helper.aAuthCheck, assignment.getAssignment);
//router.get('/*', helper.invalidPath);
router.get('/', helper.aAuthCheck, assignment.getAllAssignments);
router.put(
  '/:id',
  helper.aAuthCheck,
  helper.checkQueryParams,
  assignment.putAssignmentInfo
);
router.put('/*', helper.invalidPath);
router.delete('/:id', helper.aAuthCheck, assignment.deleteAssignmentInfo);
router.delete('/*', helper.invalidPath);

module.exports = router;