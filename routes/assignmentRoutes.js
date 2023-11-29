const express = require('express');
const router = express.Router();
var helper = require('../utils/helper');
var assignment = require('../controllers/assignment');
var submission = require('../controllers/submission');

router.post('/', helper.aAuthCheck, assignment.createNewAssignment);
//router.post('/*', helper.invalidPath);
router.get('/:id', helper.aAuthCheck, assignment.getAssignment);
//router.get('/*', helper.invalidPath);
router.get('/', helper.aAuthCheck, assignment.getAllAssignments);
router.put(
  '/:id',
  helper.aAuthCheck,
  helper.checkQueryParams,
  assignment.putAssignmentInfo
);
//assignment 9
router.post(
  '/:id/submission',
  helper.aAuthCheck,
  helper.checkQueryParams,
  submission.createNewSubmission
);
router.post('/:id/submission/*', helper.invalidPath);
router.get('/:id/submission/', helper.invalidPath);
router.get('/:id/submission/*', helper.invalidPath);
router.put('/*', helper.invalidPath, helper.invalidPath);
router.delete('/:id', helper.aAuthCheck, assignment.deleteAssignmentInfo);
router.delete('/*', helper.invalidPath);

module.exports = router;