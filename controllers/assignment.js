const { Account, Assignment } = require('../Models/association');

const {
  validUserId,
  getDecryptedCreds,
  isUUIDv4,
  isValidISODATE,
} = require('../utils/helper');

const createNewAssignment = async (req, res) => {
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
    return res.status(400).json({
      message: 'Bad request-Invalid Assignment Parameters or Empty body',
    });
  }

  //Validation1 for JSON
  if (typeof req.body !== 'object') {
    console.log('Invalid input: Request body is not a JSON object');
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
    return res.status(400).json({
      message: 'Bad request-Required Assignment body Parameters are missing',
    });
  }

  try {
    let { userName } = getDecryptedCreds(req.headers.authorization);

    let idValue = await validUserId(userName);
    //Change string to Date

    const deadlineDate = new Date(req.body.deadline);

    const today = new Date();

    //NEW CODE ADDED NOW
    let data = await Account.findByPk(idValue);
    console.log('Account Object' + data);
    if (!data) {
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

    return res
      .status(201)
      .json({ message: 'Assignment created successfully', assignment: result });
  } catch (err) {
    return res.status(400).json({ message: 'Bad Request' });
  }
};

const getAssignment = async (req, res) => {
  if (req._body) {
    return res.status(400).send('Bad Request-Request body present');
  }

  let id = req.params.id;
  const idCheck = isUUIDv4(id);
  if (!idCheck) {
    return res.status(400).json({
      message: 'Bad request- Assignment Id is Incorrect',
    });
  }

  try {
    console.log('Checks passed');
    const existingAssignment = await Assignment.findByPk(id);
    if (!existingAssignment) {
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

    console.log('Assignment fetched successfully');
    return res
      .status(200)
      .json({ message: 'Assignment fetched successfully', assignment: result });
  } catch (err) {
    return res.status(400).json({ message: 'Bad request ' });
  }
};

const getAllAssignments = async (req, res) => {
  console.log('Get all Assignment ');
  if (req._body) {
    return res.status(400).send('Bad Request-Request body present');
  }

  //let id = req.params.id;

  try {
    let { userName } = getDecryptedCreds(req.headers.authorization);

    let idValue = await validUserId(userName);

    let data = await Assignment.findAll();

    if (!data || data.length === 0) {
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

    console.log('Assignments fetched successfully');
    return res.status(200).json({
      message: 'Assignments fetched successfully',
      assignments: results,
    });
  } catch (err) {
    res.status(400).send('Bad Request');
  }
};

const putAssignmentInfo = async (req, res) => {
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
    return res.status(400).json({
      message: 'Bad request-Invalid Assignment Parameters or Empty body',
    });
  }

  // Validation 2: Check if required fields are missing in the request body
  if (
    !req.body.name ||
    !req.body.points ||
    !req.body.num_of_attemps ||
    !req.body.deadline
  ) {
    console.log('Invalid input');
    return res.status(400).json({
      message: 'Bad request-Required Assignment body Parameters are missing',
    });
  }

  //Validation for Query String
  const queryParams = Object.keys(req.query);
  if (queryParams.length > 0) {
    return res.status(400).json({
      message: 'Bad request - Query String not Allowed',
    });
  }

  let id = req.params.id;
  const idCheck = isUUIDv4(id);
  if (!idCheck) {
    return res.status(400).json({
      message: 'Bad request- Assignment Id is Incorrect',
    });
  }
  try {
    // Check if the Assignment with the given ID exists
    const existingAssignment = await Assignment.findByPk(id);
    if (!existingAssignment) {
      return res.status(400).json({
        message: 'Bad Request-Assignment not found',
      });
    } else if (existingAssignment) {
      let { userName } = getDecryptedCreds(req.headers.authorization);
      //console.log('Email of User' + ' ' + userName);
      let idValue = await validUserId(userName);
      let ownerCheck = existingAssignment.accountId;
      if (ownerCheck !== idValue) {
        return res.status(403).json({
          message: 'Forbidden-Assignment belongs to another User',
        });
      }
    }

    const deadlineDate = new Date(req.body.deadline);

    console.log('Checks Passed');
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

    return res.status(204).end();
  } catch (err) {
    res.status(400).send('Bad Request');
  }
};

const deleteAssignmentInfo = async (req, res) => {
  //Validation for delete Assignments

  // Check if the request body is empty
  if (Object.keys(req.body).length > 0) {
    return res.status(400).json({
      message: 'Bad request - Request body not required',
    });
  }

  let id = req.params.id;
  const idCheck = isUUIDv4(id);
  if (!idCheck) {
    return res.status(400).json({
      message: 'Bad request- Assignment Id is Incorrect',
    });
  }
  try {
    // Check if the Assignment with the given ID(UUID4 version) exists
    const existingAssignment = await Assignment.findByPk(id);
    if (!existingAssignment) {
      return res.status(404).json({
        message: 'Bad Request-Assignment not found',
      });
    } else if (existingAssignment) {
      let { userName } = getDecryptedCreds(req.headers.authorization);
      //console.log('Email of User' + ' ' + userName);
      let idValue = await validUserId(userName);
      let ownerCheck = existingAssignment.accountId;
      if (ownerCheck !== idValue) {
        return res.status(403).json({
          message: 'Forbidden-Assignment belongs to another User',
        });
      }
    }
    console.log('Checks Passed');
    // Capture the assignment data before deleting
    const deletedAssignment = { ...existingAssignment.toJSON() };
    // Perform the delete
    await existingAssignment.destroy();
    return res.status(204).end();
  } catch (err) {
    //helper.logger.error("DB Error - ", err);
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
