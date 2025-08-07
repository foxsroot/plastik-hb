"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert mock products
    await queryInterface.bulkInsert("products", [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Plastik HD",
        price: 12000,
        description: "Plastik HD berkualitas tinggi",
        specification: "Ukuran 30x40cm, tebal 0.5mm",
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Plastik LD",
        price: 10000,
        description: "Plastik LD untuk kebutuhan umum",
        specification: "Ukuran 25x35cm, tebal 0.3mm",
        featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert mock product categories
    await queryInterface.bulkInsert("product_categories", [
      {
        id: "33333333-3333-3333-3333-333333333333",
        category: "Kemasan",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        category: "Industri",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert mock assets
    await queryInterface.bulkInsert("assets", [
      {
        id: "55555555-5555-5555-5555-555555555555",
        url: "https://example.com/hd.jpg",
        alt: "Plastik HD",
        type: "IMAGE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        url: "https://example.com/ld.jpg",
        alt: "Plastik LD",
        type: "IMAGE",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert mock analytics (only PAGE and PRODUCT types)
    await queryInterface.bulkInsert("analytics", [
      {
        id: "77777777-7777-7777-7777-777777777777",
        type: "PAGE",
        target_id: "11111111-1111-1111-1111-111111111111",
        url: "/home",
        ip_address: "192.168.1.10",
        location: "Bandung",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "88888888-8888-8888-8888-888888888888",
        type: "PAGE",
        target_id: "22222222-2222-2222-2222-222222222222",
        url: "/products",
        ip_address: "192.168.1.11",
        location: "Jakarta",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "99999999-9999-9999-9999-999999999999",
        type: "PRODUCT",
        target_id: "11111111-1111-1111-1111-111111111111",
        url: "/product/hd",
        ip_address: "192.168.1.12",
        location: "Surabaya",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        type: "PRODUCT",
        target_id: "22222222-2222-2222-2222-222222222222",
        url: "/product/ld",
        ip_address: "192.168.1.13",
        location: "Medan",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("product_categories", null, {});
    await queryInterface.bulkDelete("assets", null, {});
    await queryInterface.bulkDelete("analytics", null, {});
  },
};
