const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/postgres');

// Define the Account model
const Account = sequelize.define(
  'Account',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  {
    createdAt: 'account_created',
    updatedAt: 'account_updated',
    freezeTableName: true,
  }
);

// Define the Assignment model
const Assignment = sequelize.define(
  'Assignment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    num_of_attempts: { type: DataTypes.INTEGER, allowNull: false },
    deadline: { type: DataTypes.DATE, allowNull: false },
  },
  {
    createdAt: 'assignment_created',
    updatedAt: 'assignment_updated',
    freezeTableName: true,
  }
);

// Define the association between Account and Assignment
Account.hasMany(Assignment, { foreignKey: 'accountId' });
Assignment.belongsTo(Account, { foreignKey: 'accountId' });

module.exports = { Account, Assignment };
