const { Account, Assignment, Submission } = require('../Models/association');
const helper = require('../utils/helper');
const path = require('path');

const { validUserId, getDecryptedCreds, isUUIDv4 } = require('../utils/helper');
const snsRegion = process.env.SNS_REGION;
const snsTopicArn = process.env.TOPIC_ARN;
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


  // Validate if submission_url is a valid URL
  // 3. url validator
  // Define regular expressions for validation
  const urlPattern = /^(http|https):\/\/.*$/;
  const zipExtensionPattern = /\.zip$/;


  // Check if the URL starts with "http" or "https"
  if (!urlPattern.test(req.body.submission_url)) {
    helper.logger.error('Invalid URL format.', req.body.submission_url);
    return res.status(400).json({ message: 'Invalid URL format.' });
  }


  // Check if the URL ends with ".zip"
  const fileExtension = path.extname(req.body.submission_url);
  if (!zipExtensionPattern.test(fileExtension.toLowerCase())) {
    helper.logger.error(
      'The URL does not have a .zip extension.',
      req.body.submission_url
    );
    return res
      .status(400)
      .json({ error: 'The URL does not have a .zip extension.' });
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
      let assignDeadline = existingAssignment.deadline;
      const currentDate = new Date();


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
    let { userName } = getDecryptedCreds(req.headers.authorization);


    const account = await Account.findOne({
      where: { email: userName },
      attributes: ['first_name'], // Only fetch the 'firstName' attribute
    });

    // Check if the account exists
    let userFirstName = '';
    if (account) {
      // Access the first name from the retrieved account
      const firstName = account.getDataValue('first_name');
      userFirstName = firstName;
    }
    // Import the AWS SDK
    const AWS = require('aws-sdk');
    // Set the region
    AWS.config.update({ region: snsRegion });

    // Create an SNS service object
    const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

    // Write the logic to get the data from the body and Basic Auth <name>, <email>, <url>
    // JSON message to publish
    const message = {
      name: userFirstName,


      email: userName,


      url: req.body.submission_url,
    };

    // Params for publishing to SNS topic
    const params = {
      TopicArn: snsTopicArn,

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