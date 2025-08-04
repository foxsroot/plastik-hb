'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("shops", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^[0-9]+$/,
        },
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mapsUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("shops");
  }
};
