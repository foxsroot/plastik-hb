"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the type column to TEXT to remove dependency
    await queryInterface.changeColumn("sections", "type", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Drop the existing ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_sections_type";'
    );

    // Create the updated ENUM type with 'TRUSTEDBY'
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_sections_type" AS ENUM (
        'BANNER', 'ACHIEVEMENTS', 'VALUES', 'ADDRESS', 'INFO', 'GOALS', 'HISTORY', 'TRUSTEDBY'
      );
    `);

    // Update the type column in the sections table to use the new ENUM type
    await queryInterface.changeColumn("sections", "type", {
      type: Sequelize.ENUM(
        "BANNER",
        "ACHIEVEMENTS",
        "VALUES",
        "ADDRESS",
        "INFO",
        "GOALS",
        "HISTORY",
        "TRUSTEDBY"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Change the type column to TEXT to remove dependency
    await queryInterface.changeColumn("sections", "type", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Drop the updated ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_sections_type";'
    );

    // Recreate the old ENUM type (without 'TRUSTEDBY')
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_sections_type" AS ENUM (
        'BANNER', 'ACHIEVEMENTS', 'VALUES', 'ADDRESS', 'INFO', 'GOALS', 'HISTORY'
      );
    `);

    // Revert the type column in the sections table to use the old ENUM type
    await queryInterface.changeColumn("sections", "type", {
      type: Sequelize.ENUM(
        "BANNER",
        "ACHIEVEMENTS",
        "VALUES",
        "ADDRESS",
        "INFO",
        "GOALS",
        "HISTORY"
      ),
      allowNull: false,
    });
  },
};
