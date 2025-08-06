"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sections", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      page_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "pages",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM(
          "HERO",
          "ACHIEVEMENTS",
          "PRODUCTS",
          "TESTIMONIALS",
          "ADDRESS"
        ),
        allowNull: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      visible: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sections");
  },
};
