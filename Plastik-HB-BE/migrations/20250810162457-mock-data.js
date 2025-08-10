"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- Users ---
    await queryInterface.bulkInsert("users", [
      {
        id: "56a054f5-bda6-4754-aadd-0905cd6d63dc",
        username: "admin",
        email: "admin@gmail.com",
        password:
          "$2a$12$loUV9EIrOzL7Nu.st0Kv5O9lEcd9IjmB7Mz8FaCihn8o3zaUMo3BO", //admin
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Product Categories ---
    await queryInterface.bulkInsert("product_categories", [
      {
        id: "4ee6d5e6-6acb-4b20-b394-6d36ef9e9bd4",
        category: "Kemasan",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "5ca93a66-33bb-49e2-9946-3ff74c7b8d19",
        category: "Industri",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Products ---
    await queryInterface.bulkInsert("products", [
      {
        id: "f574bc02-f18b-4e78-92e0-41c48ce8911a",
        name: "Plastik HD",
        price: 12000,
        description: "Plastik HD berkualitas tinggi",
        specification: "Ukuran 30x40cm, tebal 0.5mm",
        featured: true,
        category_id: "4ee6d5e6-6acb-4b20-b394-6d36ef9e9bd4",
        status: "active",
        discount: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "a499f0a5-7d2f-4593-ab03-687026867921",
        name: "Plastik LD",
        price: 10000,
        description: "Plastik LD untuk kebutuhan umum",
        specification: "Ukuran 25x35cm, tebal 0.3mm",
        featured: false,
        category_id: "5ca93a66-33bb-49e2-9946-3ff74c7b8d19",
        status: "active",
        discount: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Assets ---
    await queryInterface.bulkInsert("assets", [
      {
        id: "32b069f5-01ee-4f73-8541-004c73335ef9",
        url: "/uploads/1754840858895-Olike-H2-1.jpg",
        alt: "Plastik HD",
        type: "IMAGE",
        order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "f6dd6893-4627-4b2d-a3e7-45f9803c7230",
        url: "/uploads/1754840872148-Sumber-energi-untuk-tubuh-ini-5-manfaat-pisang.jpg",
        alt: "Plastik LD",
        type: "IMAGE",
        order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Pages ---
    await queryInterface.bulkInsert("pages", [
      {
        id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        title: "Tentang Kami",
        slug: "tentang-kami",
        description: "Ini Adalah Page Tentang Kami",
        published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "9b15e2a3-4e8d-4b6e-80a5-d7d8da9759c4",
        title: "Homepage",
        slug: "homepage",
        description: "Halaman utama Plastik HB",
        published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3aca5bf1-9cbe-4662-b0bf-d757404098ca",
        title: "Katalog Produk",
        slug: "katalog",
        description: "Daftar produk plastik HB",
        published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "67c32e9e-c86d-4da1-a099-ac21fcd14dea",
        title: "Kontak",
        slug: "contact",
        description: "Hubungi kami untuk informasi lebih lanjut",
        published: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Sections ---
    await queryInterface.bulkInsert("sections", [
      // Tentang Kami Page Sections
      {
        id: "683b0ce2-82f4-40f5-94fe-9dd846d2983a",
        page_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        type: "INFO",
        order: 1,
        data: JSON.stringify({
          imageUrl: "/uploads/1754840858895-Olike-H2-1.jpg",
          title: "Our Company",
          description: "This is the story about our Company",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "7e22cf0c-ee71-47fd-8367-00ac387e6c1e",
        page_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        type: "VALUES",
        order: 2,
        data: JSON.stringify({
          values: [
            "Innovation & Excellence",
            "Sustainable Growth",
            "Customer-Centric Service",
            "Building Stronger Communities",
          ],
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3c7cbb42-3db5-4bf8-8351-b2f9c3c148a0",
        page_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        type: "GOALS",
        order: 3,
        data: JSON.stringify({
          mission:
            "To deliver high-quality solutions that exceed client expectations by combining innovation, technical skill, and transparency.",
          vision:
            "To become a leading force in the industry by continuously evolving and embracing modern challenges.",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "06128956-ea5b-452a-9eae-43222886b7b2",
        page_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        type: "HISTORY",
        order: 4,
        data: JSON.stringify({
          history: [
            "Started from humble beginnings in Bandung.",
            "Expanded across Java with strategic milestones.",
            "Built a legacy of trust in quality materials and service.",
            "Shaping the future while rooted in the past.",
          ],
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "cafbfac4-60ec-45a7-8053-e528c854b85e",
        page_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        type: "ADDRESS",
        order: 5,
        data: JSON.stringify({
          phoneNumber: "628123456789008001700",
          address: "Jl. Plastik HB No. 123, Bandung",
          mapUrl:
            "https://www.google.com/maps?q=-6.914744,107.609810&z=15&output=embed",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Homepage Sections
      {
        id: "a23260ae-730e-4dff-8ef6-a29a1f907763",
        page_id: "9b15e2a3-4e8d-4b6e-80a5-d7d8da9759c4",
        type: "BANNER",
        order: 1,
        data: JSON.stringify({
          banners: [
            {
              order: 1,
              image: "/uploads/banner1.jpg",
              title: "Selamat Datang di Plastik HB",
              subtitle: "Solusi kemasan plastik berkualitas tinggi",
              buttonText: "Lihat Produk",
              buttonLink: "/katalog",
            },
            {
              order: 2,
              image: "/uploads/banner2.jpg",
              title: "Diskon Musim Panas",
              subtitle: "Dapatkan penawaran terbaik untuk produk unggulan",
              buttonText: "Cek Promo",
              buttonLink: "/promo",
            },
          ],
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "cb4fa522-6a2c-4ed9-a6b5-37958a122234",
        page_id: "9b15e2a3-4e8d-4b6e-80a5-d7d8da9759c4",
        type: "ACHIEVEMENTS",
        order: 2,
        data: JSON.stringify({
          achievements: [
            {
              order: 1,
              title: "Kepuasan Pelanggan",
              percentage: 98,
              description: "98% pelanggan puas dengan produk kami",
              image: "/uploads/achievement1.jpg",
            },
            {
              order: 2,
              title: "Pengiriman Tepat Waktu",
              percentage: 95,
              description: "95% pengiriman tepat waktu ke seluruh Indonesia",
              image: "/uploads/achievement2.jpg",
            },
          ],
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Katalog Sections
      {
        id: "bee0a147-66e9-42cf-aaaf-bda0791addb4",
        page_id: "3aca5bf1-9cbe-4662-b0bf-d757404098ca",
        type: "INFO",
        order: 1,
        data: JSON.stringify({
          title: "Katalog Produk",
          description:
            "Temukan berbagai produk plastik HB sesuai kebutuhan Anda.",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Contact Sections
      {
        id: "bb1f33fb-1928-4093-b758-6a1d8b306d20",
        page_id: "67c32e9e-c86d-4da1-a099-ac21fcd14dea",
        type: "INFO",
        order: 1,
        data: JSON.stringify({
          title: "Hubungi Kami",
          description:
            "Silakan hubungi kami untuk pertanyaan, pemesanan, atau konsultasi produk.",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "143bd2d2-0eb6-4b1b-a0cf-f8f3156a969b",
        page_id: "67c32e9e-c86d-4da1-a099-ac21fcd14dea",
        type: "ADDRESS",
        order: 2,
        data: JSON.stringify({
          phoneNumber: "628123456789008001700",
          address: "Jl. Plastik HB No. 123, Bandung",
          mapUrl:
            "https://www.google.com/maps?q=-6.914744,107.609810&z=15&output=embed",
        }),
        visible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // --- Analytics ---
    // --- Analytics (Aligned with Pages) ---
    await queryInterface.bulkInsert("analytics", [
      // Tentang Kami page views
      {
        id: "b16d370d-c086-41a1-8a45-ef9955e67eb4",
        type: "PAGE",
        target_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d", // Tentang Kami
        url: "/tentang-kami",
        ip_address: "192.168.1.10",
        location: "Bandung",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "f2d541cc-8dc7-40fc-86ab-a12f359368a7",
        type: "PAGE",
        target_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        url: "/tentang-kami",
        ip_address: "10.0.0.1",
        location: "Jakarta",
        created_at: new Date(Date.now() - 86400000 * 2),
        updated_at: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: "9cdd1f37-c980-4e0d-9240-a275f223e501",
        type: "PAGE",
        target_id: "ff1eccb6-9ef8-4da7-ba0f-9d3c4aec172d",
        url: "/tentang-kami",
        ip_address: "192.168.1.20",
        location: "Yogyakarta",
        created_at: new Date(Date.now() - 1800000),
        updated_at: new Date(Date.now() - 1800000),
      },

      // Homepage views
      {
        id: "225d7294-388a-4dfc-94ee-56b39dbb97dc",
        type: "PAGE",
        target_id: "9b15e2a3-4e8d-4b6e-80a5-d7d8da9759c4", // Homepage
        url: "/",
        ip_address: "192.168.1.30",
        location: "Surabaya",
        created_at: new Date(Date.now() - 7200000),
        updated_at: new Date(Date.now() - 7200000),
      },
      {
        id: "8a8239d4-f15a-4642-8b4d-ec2de0495799",
        type: "PAGE",
        target_id: "9b15e2a3-4e8d-4b6e-80a5-d7d8da9759c4",
        url: "/",
        ip_address: "192.168.1.31",
        location: "Medan",
        created_at: new Date(Date.now() - 3600000),
        updated_at: new Date(Date.now() - 3600000),
      },

      // Product clicks (aligned with products)
      {
        id: "936379e2-a642-4144-9511-944ab94c4835",
        type: "PRODUCT",
        target_id: "f574bc02-f18b-4e78-92e0-41c48ce8911a", // Plastik HD
        url: "/product/hd",
        ip_address: "192.168.1.12",
        location: "Surabaya",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "f8702cf6-feb1-43f5-a451-8884b3d1ac45",
        type: "PRODUCT",
        target_id: "a499f0a5-7d2f-4593-ab03-687026867921", // Plastik LD
        url: "/product/ld",
        ip_address: "10.0.0.2",
        location: "Bandung",
        created_at: new Date(Date.now() - 86400000),
        updated_at: new Date(Date.now() - 86400000),
      },
      {
        id: "8b6f9be5-b310-4e70-ba3c-d5063cdff8f5",
        type: "PRODUCT",
        target_id: "a499f0a5-7d2f-4593-ab03-687026867921",
        url: "/product/ld",
        ip_address: "192.168.1.21",
        location: "Semarang",
        created_at: new Date(Date.now() - 600000),
        updated_at: new Date(Date.now() - 600000),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("sessions", null, {});
    await queryInterface.bulkDelete("product_categories", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("assets", null, {});
    await queryInterface.bulkDelete("pages", null, {});
    await queryInterface.bulkDelete("sections", null, {});
    await queryInterface.bulkDelete("analytics", null, {});
  },
};
