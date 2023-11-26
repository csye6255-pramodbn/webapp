const { Account, Assignment, Submission } = require('../Models/association');
  const helper = require('../utils/helper');
 
  const {
    validUserId,
    getDecryptedCreds,
    isUUIDv4,
    isValidISODATE,
  } = require('../utils/helper');
 
  const createNewAssignment = async (req, res) => {
    helper.logger.info('POST - Assignment'); //LOG DATA
    helper.statsdClient.increment('POST_assignment'); //METRIC DATA
 
    // Validation 3: Check data types and value ranges
    if (
      typeof req.body.name !== 'string' ||
      !Number.isInteger(req.body.points) ||
      req.body.points < 1 ||
      req.body.points > 100 ||
      !Number.isInteger(req.body.num_of_attemps) ||
      req.body.num_of_attemps < 1 ||
      req.body.num_of_attemps > 100 ||
      !isValidISODATE(req.body.deadline)
    ) {
      //console.log('Invalid input');
      helper.logger.error(
        'Bad request-Invalid Assignment Parameters or Empty body-Validation Check(s) failed. - ',
        req.body
      );
      return res.status(400).json({
        message: 'Bad request-Invalid Assignment Parameters or Empty body',
      });
    }
 
    //Validation1 for JSON
    if (typeof req.body !== 'object') {
      helper.logger.error(
        'Bad request: Request body must be a JSON object- Validation Check(s) failed. - ',
        req.body
      );
      //console.log('Invalid input: Request body is not a JSON object');
      return res.status(400).json({
        message: 'Bad request: Request body must be a JSON object',
      });
    }
 
    // Validation 2: Check if required fields are missing in the request body
    if (
      !req.body.name ||
      !req.body.points ||
      !req.body.num_of_attemps ||
      !req.body.deadline
    ) {
      //console.log('Invalid input');
      helper.logger.error(
        'Bad request-Required Assignment body Parameters are missing- Validation Check(s) failed. - ',
        req.body
      );
      return res.status(400).json({
        message: 'Bad request-Required Assignment body Parameters are missing',
      });
    }
    //Validation for Unwanted Fields
    const allowedFields = ['name', 'points', 'num_of_attemps', 'deadline'];
    const requestKeys = Object.keys(req.body);
 
    // Check if any unwanted fields are present in the request body
    const unwantedFields = requestKeys.filter(
      (key) => !allowedFields.includes(key)
    );
 
    if (unwantedFields.length > 0) {
      helper.logger.error(
        'Bad request - Unwanted fields in request body-Validation Check(s) failed. - ',
        req.body
      );
      return res.status(400).json({
        message: 'Bad request - Unwanted fields in request body',
        unwantedFields: unwantedFields,
      });
    }
    //Validation for Query String
    const queryParams = Object.keys(req.query);
    if (queryParams.length > 0) {
      helper.logger.error(
        'Bad request - Query String not Allowed-Validation Check(s) failed. - ',
        req.body
      );
      return res.status(400).json({
        message: 'Bad request - Query String not Allowed',
      });
    }
 
    try {
      //Validation 4 already exists for Specific User
      let { userName } = getDecryptedCreds(req.headers.authorization);
      //console.log('Email of User' + ' ' + userName);
      let idValue = await validUserId(userName);
      //console.log('User id' + ' ' + idValue);
 
      let assignmentObj = await Assignment.findOne({
        where: {
          accountId: idValue, // Add this condition to check for the specific user
          name: req.body.name,
          points: req.body.points,
          num_of_attempts: req.body.num_of_attemps,
          deadline: new Date(req.body.deadline), // Convert to Date for comparison
        },
      });
 
      if (assignmentObj) {
        helper.logger.error(
          'Bad request-This Assignment details already exists for Specific User-Validation Check(s) failed. - ',
          req.body
        );
        return res.status(400).json({
          message:
            'Bad request-This Assignment details already exists for Specific User.',
        });
      }
 
      //Change string to Date
      const deadlineDate = new Date(req.body.deadline);
 
      const today = new Date();
      if (deadlineDate <= today) {
        helper.logger.error(
          'Bad request - Deadline date must be in the future- Validation Check(s) failed. - ',
          req.body
        );
        return res.status(400).json({
          message: 'Bad request - Deadline date must be in the future',
        });
      }
 
      let data = await Account.findByPk(idValue);
      //console.log('Account Object' + data);
      if (!data) {
        helper.logger.error(
          'User not found-Validation Check(s) failed. - ',
          req.body
        );
        return res.status(404).json({
          message: 'User not found',
        });
      }
      let newAssignment = {
        name: req.body.name,
        points: req.body.points,
        num_of_attempts: req.body.num_of_attemps,
        deadline: deadlineDate,
      };
      helper.logger.info('Validation Checks Passed.');
      let assignment = await data.createAssignment(newAssignment);
 
      let result = {
        id: assignment.id,
        name: assignment.name,
        points: assignment.points,
        num_of_attempts: assignment.num_of_attempts,
        deadline: assignment.deadline.toISOString(),
        assignment_created: assignment.assignment_created,
        assignment_updated: assignment.assignment_updated,
      };
      helper.logger.info('Assignment created successfully - ', result);
      return res
        .status(201)
        .json({ message: 'Assignment created successfully', assignment: result });
    } catch (err) {
      helper.logger.error('Assignment create DB Error - ', err);
      return res.status(400).json({ message: 'Bad Request' });
    }
  };
 
  const getAssignment = async (req, res) => {
    //console.log('Get Assignment with ID');
    helper.logger.info('GET - Assignment');
    helper.statsdClient.increment('GET_assignment');
 
    if (req._body) {
      helper.logger.error(
        'Bad Request-Request body present- Validation Check(s) failed.',
        req.body
      );
      return res.status(400).send('Bad Request-Request body present');
    }
 
    let id = req.params.id;
    const idCheck = isUUIDv4(id);
    if (!idCheck) {
      helper.logger.error(
        'Bad request- Assignment Id is Incorrect- Validation Check(s) failed -',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request- Assignment Id is Incorrect',
      });
    }
 
    //Validation for Query String
    const queryParams = Object.keys(req.query);
    if (queryParams.length > 0) {
      helper.logger.error(
        'Bad request - Query String not Allowed- Validation Check(s) failed.-',
        queryParams
      );
      return res.status(400).json({
        message: 'Bad request - Query String not Allowed',
      });
    }
 
    try {
      //console.log('Checks passed');
      helper.logger.info('Validation Checks Passed');
 
      const existingAssignment = await Assignment.findByPk(id);
      if (!existingAssignment) {
        helper.logger.error(
          'Bad Request-Assignment not found-Validation Check(s) failed.',
          req.params.id
        );
 
        return res.status(200).json({});
      }
      let result = {
        id: existingAssignment.dataValues.id,
        name: existingAssignment.dataValues.name,
        points: existingAssignment.dataValues.points,
        num_of_attempts: existingAssignment.dataValues.num_of_attempts,
        deadline: existingAssignment.dataValues.deadline,
        assignment_created: existingAssignment.assignment_created,
        assignment_updated: existingAssignment.assignment_updated,
      };
 
      //console.log('Assignment fetched successfully');
      helper.logger.info('Assignment fetched successfully.-', result);
      return res
        .status(200)
        .json({ message: 'Assignment fetched successfully', assignment: result });
    } catch (err) {
      helper.logger.error('GET Assignment DB Error - ', err);
      return res.status(400).json({ message: 'Bad request ' });
    }
  };
 
  const getAllAssignments = async (req, res) => {
    //console.log('Get all Assignment ');
    helper.logger.info('GET - Assignments');
    helper.statsdClient.increment('GET_assignments');
 
    if (req._body) {
      helper.logger.error(
        'Bad Request-Request body present-Validation Check(s) failed.'
      );
      return res.status(400).send('Bad Request-Request body present');
    }
 
    //Validation for Query String
    const queryParams = Object.keys(req.query);
    if (queryParams.length > 0) {
      helper.logger.error(
        'Bad request - Query String not Allowed-Check(s) failed.',
        queryParams
      );
      return res.status(400).json({
        message: 'Bad request - Query String not Allowed',
      });
    }
    //let id = req.params.id;
 
    try {
      // helper.logger.info('Checks Passed.');
      helper.logger.info('Validation Checks Passed.');
      let { userName } = getDecryptedCreds(req.headers.authorization);
      //console.log('Email of User' + ' ' + userName);
      let idValue = await validUserId(userName);
      //RECENT CANGE START COMMENTED
      //let idValue = await validUserId(userName);
      //RECENT CHNAGE END COMMENTED
      //const account = await Account.findOne({ where: { email: userName } });
      //console.log('User Id' + idValue);
      let data = await Assignment.findAll();
      //console.log('length' + data.length);
      if (!data || data.length === 0) {
        helper.logger.error(
          'Bad Request-Assignments not found-Validation Check(s) failed.'
        );
        return res.status(200).json({});
      }
      let results = data.map((item) => ({
        id: item.dataValues.id,
        name: item.dataValues.name,
        points: item.dataValues.points,
        num_of_attempts: item.dataValues.num_of_attempts,
        deadline: item.dataValues.deadline,
        assignment_created: item.dataValues.assignment_created,
        assignment_updated: item.dataValues.assignment_updated,
      }));
      //helper.logger.info('Product Successfully fetched');
      //console.log('Assignments fetched successfully');
      helper.logger.info('Assignments fetched successfully', results);
      return res.status(200).json({
        message: 'Assignments fetched successfully',
        assignments: results,
      });
    } catch (err) {
      // helper.logger.error('DB Error - ', err);
      // res.status(400).send('Bad Request');
      helper.logger.error('GET all Assignments DB Error - ', err);
      res.status(400).send('Bad Request');
    }
  };
 
  const putAssignmentInfo = async (req, res) => {
    helper.logger.info('PUT- Assignment');
    helper.statsdClient.increment('PUT_assignment');
 
    //Validation for Assignments
    // Validation 3: Check data types and value ranges
    if (
      typeof req.body.name !== 'string' ||
      !Number.isInteger(req.body.points) ||
      req.body.points < 1 ||
      req.body.points > 100 ||
      !Number.isInteger(req.body.num_of_attemps) ||
      req.body.num_of_attemps < 1 ||
      req.body.num_of_attemps > 100 ||
      !isValidISODATE(req.body.deadline)
    ) {
      //console.log('Invalid input');
      helper.logger.error(
        'Bad request-Invalid Assignment Parameters or Empty body- Validation Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request-Invalid Assignment Parameters or Empty body',
      });
    }
 
    //Validation1 for JSON
    if (typeof req.body !== 'object') {
      //console.log('Invalid input: Request body is not a JSON object');
      helper.logger.error(
        'Bad request: Request body must be a JSON object-Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request: Request body must be a JSON object',
      });
    }
 
    // Validation 2: Check if required fields are missing in the request body
    if (
      !req.body.name ||
      !req.body.points ||
      !req.body.num_of_attemps ||
      !req.body.deadline
    ) {
      //console.log('Invalid input');
      helper.logger.error(
        'Bad request-Required Assignment body Parameters are missing-Validation Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
      return res.status(400).json({
        message: 'Bad request-Required Assignment body Parameters are missing',
      });
    }
    //Validation for Unwanted Fields
    const allowedFields = ['name', 'points', 'num_of_attemps', 'deadline'];
    const requestKeys = Object.keys(req.body);
 
    // Check if any unwanted fields are present in the request body
    const unwantedFields = requestKeys.filter(
      (key) => !allowedFields.includes(key)
    );
 
    if (unwantedFields.length > 0) {
      helper.logger.error(
        'Bad request - Unwanted fields in request body-Validation Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request - Unwanted fields in request body',
        unwantedFields: unwantedFields,
      });
    }
 
    //Validation for Query String
    const queryParams = Object.keys(req.query);
    if (queryParams.length > 0) {
      helper.logger.error(
        'Bad request - Query String not Allowed-Validation Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request - Query String not Allowed',
      });
    }
 
    let id = req.params.id;
    const idCheck = isUUIDv4(id);
    if (!idCheck) {
      helper.logger.error(
        'Bad request- Assignment Id is Incorrect-Validation Check(s) failed. - ',
        req.params.id
      );
      return res.status(400).json({
        message: 'Bad request- Assignment Id is Incorrect',
      });
    }
    try {
      // Check if the Assignment with the given ID exists
      const existingAssignment = await Assignment.findByPk(id);
      if (!existingAssignment) {
        helper.logger.error(
          'Bad Request-Assignment not found-Validation Check(s) failed. - ',
          req.params.id
        );
        return res.status(400).json({
          message: 'Bad Request-Assignment not found',
        });
      } else if (existingAssignment) {
        let { userName } = getDecryptedCreds(req.headers.authorization);
        //console.log('Email of User' + ' ' + userName);
        let idValue = await validUserId(userName);
        let ownerCheck = existingAssignment.accountId;
        if (ownerCheck !== idValue) {
          helper.logger.error(
            'Forbidden-Assignment belongs to another User-Check(s) failed. - ',
            req.params.id
          );
          return res.status(403).json({
            message: 'Forbidden-Assignment belongs to another User',
          });
        }
      }
 
      const deadlineDate = new Date(req.body.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        helper.logger.error(
          'Bad request - Deadline date must be in the future-Check(s) failed. - ',
          req.body.deadline,
          'Assignment Id-',
          req.params.id
        );
 
        return res.status(400).json({
          message: 'Bad request - Deadline date must be in the future',
        });
      }
      //console.log('Checks Passed');
      helper.logger.info('Validation Checks Passed');
      // Perform the update
      await Assignment.update(
        {
          name: req.body.name,
          points: req.body.points,
          num_of_attempts: req.body.num_of_attemps,
          deadline: deadlineDate,
        },
        {
          where: {
            id: id,
          },
        }
      );
      helper.logger.info('Assignment updated successfully', {
        AssignmentId: req.params.id,
        UpdatedData: {
          name: req.body.name,
          points: req.body.points,
          num_of_attempts: req.body.num_of_attemps,
          deadline: deadlineDate.toISOString(),
        },
      });
      return res.status(204).end();
    } catch (err) {
      helper.logger.error('Assignment update DB Error - ', err);
      res.status(400).send('Bad Request');
    }
  };
 
  const deleteAssignmentInfo = async (req, res) => {
    helper.logger.info('DELETE- Assignment');
    helper.statsdClient.increment('DELETE_assignment');
 
    //Validation for delete Assignments
 
    // Check if the request body is empty
    if (Object.keys(req.body).length > 0) {
      helper.logger.error(
        'Bad request - Request body not required-Check(s) failed. - ',
        req.body,
        'Assignment Id-',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request - Request body not required',
      });
    }
 
    let id = req.params.id;
    const idCheck = isUUIDv4(id);
    if (!idCheck) {
      helper.logger.error(
        'Bad request- Assignment Id is Incorrect-Check(s) failed. - ',
        req.params.id
      );
 
      return res.status(400).json({
        message: 'Bad request- Assignment Id is Incorrect',
      });
    }
    try {
      // Check if the Assignment with the given ID(UUID4 version) exists
      const existingAssignment = await Assignment.findByPk(id);
      if (!existingAssignment) {
        helper.logger.error(
          'Bad Request-Assignment not found-Check(s) failed. - ',
          req.params.id
        );
 
        return res.status(404).json({
          message: 'Bad Request-Assignment not found',
        });
      } else if (existingAssignment) {
        // Check if there are submissions associated with this assignment
        const submissionsCount = await Submission.count({
          where: { assignment_id: existingAssignment.id },
        });
 
        if (submissionsCount > 0) {
          helper.logger.error(
            'Bad Request - Cannot delete assignment with associated submissions.'
          );
 
          return res.status(400).json({
            message:
              'Bad Request - Cannot delete assignment with associated submissions.',
          });
        }
 
        let { userName } = getDecryptedCreds(req.headers.authorization);
        //console.log('Email of User' + ' ' + userName);
        let idValue = await validUserId(userName);
        let ownerCheck = existingAssignment.accountId;
        if (ownerCheck !== idValue) {
          helper.logger.error(
            'Forbidden-Assignment belongs to another User-Check(s) failed. - ',
            id
          );
 
          return res.status(403).json({
            message: 'Forbidden-Assignment belongs to another User',
          });
        }
      }
      //console.log('Checks Passed');
      helper.logger.info('Validation Checks Passed');
      // Capture the assignment data before deleting
      const deletedAssignment = { ...existingAssignment.toJSON() };
      // Perform the delete
      await existingAssignment.destroy();
      helper.logger.info(
        `Assignment deleted successfully - Assignment ID: ${req.params.id}`
      );
      return res.status(204).end();
    } catch (err) {
      //helper.logger.error("DB Error - ", err);
      helper.logger.error('Assignment delete DB Error - ', err);
      res.status(400).send('Bad Request');
    }
  };
 
  module.exports = {
    createNewAssignment,
    getAssignment,
    getAllAssignments,
    putAssignmentInfo,
    deleteAssignmentInfo,
  };