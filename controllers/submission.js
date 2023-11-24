const { Account, Assignment, Submission } = require('../Models/association');
const helper = require('../utils/helper');
 
const { validUserId, getDecryptedCreds, isUUIDv4 } = require('../utils/helper');
//const region = process.env.REGION;
const createNewSubmission = async (req, res) => {
  helper.logger.info('POST - Assignment Submission'); //LOG DATA
  helper.statsdClient.increment('POST_assignmentSubmission'); //METRIC DATA
 
  // Validation 3: Check data types and value ranges
 
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
  if (!req.body.submission_url || typeof req.body.submission_url !== 'string') {
    //console.log('Invalid input');
    helper.logger.error(
      'Bad request-Required submission url missing or it is not String in body Parameters - Validation Check(s) failed. - ',
      req.body
    );
    return res.status(400).json({
      message:
        'Bad request-Required submission url missing or it is not String in body Parameters',
    });
  }
  //Validation for Unwanted Fields
  const allowedFields = ['submission_url'];
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
    const noOfAttempts = existingAssignment.num_of_attempts;
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
      let assignDeadline = existingAssignment.deadline;
      const currentDate = new Date();
      if (ownerCheck !== idValue) {
        helper.logger.error(
          'Forbidden-Assignment belongs to another User-Check(s) failed. - ',
          req.params.id
        );
        return res.status(403).json({
          message: 'Forbidden-Assignment belongs to another User',
        });
      }
 
      if (currentDate > new Date(assignDeadline)) {
        // Submission Deadline has passed
        helper.logger.error(
          'Bad-request-Assignment Submission deadline has passed. - ',
          req.params.id
        );
        return res.status(400).json({
          message: 'Bad-request-Assignment Submission deadline has passed',
        });
      }
    }
 
    const submissionCount = await Submission.count({
      where: {
        assignment_id: id,
      },
    });
    if (submissionCount >= noOfAttempts) {
      helper.logger.error(
        'Bad-request-Assignment Submission attempts exceeded. - ',
        req.params.id
      );
      return res.status(400).json({
        message: 'Bad-request-Assignment Submission attempts exceeded',
      });
    }
    helper.logger.info('Validation Checks Passed');
 
    let newAssignmentSubmission = {
      assignment_id: id,
      submission_url: req.body.submission_url,
    };
    let newSubmission = await Submission.create(newAssignmentSubmission);
    const assignment = await Assignment.findByPk(id, {
      include: {
        model: Account,
        attributes: ['first_name', 'email'],
      },
    });
 
    const accountDetails = assignment.Account;
 
    const AWS = require('aws-sdk');
 
    // Set the region
 
    AWS.config.update({ region: process.env.REGION });
 
    // Create an SNS service object
 
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
 
    // JSON message to publish
 
    const message = {
      name: accountDetails.first_name,
 
      email: accountDetails.email,
 
      url: req.body.submission_url,
    };
 
    // Params for publishing to SNS topic
 
    const params = {
      TopicArn: process.env.TOPIC_ARN,
 
      Message: JSON.stringify(message),
    };
 
    // Publish the message
 
    sns.publish(params, (err, data) => {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log('Message published');
      }
    });
 
    let result = {
      id: newSubmission.id,
      assignment_id: newSubmission.assignment_id,
      submission_url: newSubmission.submission_url,
      submission_date: newSubmission.submission_date,
      submission_updated: newSubmission.submission_updated,
    };
    helper.logger.info('Assignment Submission created successfully - ', result);
    return res.status(201).json({ submission: result });
  } catch (err) {
    helper.logger.error('Assignment Submission create DB Error - ', err);
    return res.status(400).json({ message: 'Bad Request' });
  }
};
 
module.exports = {
  createNewSubmission,
};