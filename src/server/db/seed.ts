import { PrismaClient, RoleType, PaymentGateway, PaymentStatus, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding RAYVEN PostgreSQL database...');

  // 1. ROLES & PERMISSIONS
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Full root administrative access across all modules',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Operations and catalog administration',
      isSystem: true,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Storefront retail customer account',
      isSystem: true,
    },
  });

  const permissions = [
    { code: 'PRODUCT:CREATE', action: 'CREATE', subject: 'PRODUCT', description: 'Create products' },
    { code: 'PRODUCT:UPDATE', action: 'UPDATE', subject: 'PRODUCT', description: 'Update products' },
    { code: 'PAYMENT:APPROVE', action: 'APPROVE', subject: 'PAYMENT', description: 'Approve bKash/Nagad/Rocket payments' },
    { code: 'INVENTORY:MANAGE', action: 'UPDATE', subject: 'INVENTORY', description: 'Adjust size stock' },
    { code: 'FINANCE:VIEW', action: 'READ', subject: 'FINANCE', description: 'View double-entry ledger' },
  ];

  for (const perm of permissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: createdPerm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: createdPerm.id,
      },
    });
  }

  // 2. USERS (Multiple Admins & Verified Customer)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@rayven.com' },
    update: {},
    create: {
      email: 'superadmin@rayven.com',
      passwordHash: '$2b$10$hashed_super_admin_pw', // Example argon/bcrypt hash
      fullName: 'Rayven Chief Operations',
      phone: '+8801711000001',
      roleType: RoleType.SUPER_ADMIN,
      roleId: superAdminRole.id,
      admin: {
        create: {
          adminCode: 'ADM-001',
          department: 'Executive Operations',
          isSuperAdmin: true,
          canApprovePayments: true,
          canManageInventory: true,
          canManageFinance: true,
          canManageUsers: true,
        },
      },
    },
  });

  const financeAdminUser = await prisma.user.upsert({
    where: { email: 'finance@rayven.com' },
    update: {},
    create: {
      email: 'finance@rayven.com',
      passwordHash: '$2b$10$hashed_finance_pw',
      fullName: 'Tahmidur Rahman',
      phone: '+8801711000002',
      roleType: RoleType.ADMIN,
      roleId: adminRole.id,
      admin: {
        create: {
          adminCode: 'ADM-002',
          department: 'Finance & Accounts',
          isSuperAdmin: false,
          canApprovePayments: true,
          canManageInventory: false,
          canManageFinance: true,
          canManageUsers: false,
        },
      },
    },
  });

  const verifiedCustomerUser = await prisma.user.upsert({
    where: { email: 'sakib.khan@gmail.com' },
    update: {},
    create: {
      email: 'sakib.khan@gmail.com',
      passwordHash: '$2b$10$hashed_customer_pw',
      fullName: 'Sakib Khan',
      phone: '+8801812345678',
      roleType: RoleType.CUSTOMER,
      roleId: customerRole.id,
      customer: {
        create: {
          customerCode: 'CUST-2026-0001',
          isVerified: true, // Only verified customers can review products
          loyaltyPoints: 120,
          totalSpent: 4800,
          totalOrdersCount: 2,
        },
      },
    },
    include: { customer: true },
  });

  // 3. SIZES
  const sizeData = [
    { code: 'S', label: 'Small', sortOrder: 1, chestInches: 38, lengthInches: 28 },
    { code: 'M', label: 'Medium', sortOrder: 2, chestInches: 40, lengthInches: 29 },
    { code: 'L', label: 'Large', sortOrder: 3, chestInches: 42, lengthInches: 30 },
    { code: 'XL', label: 'Extra Large', sortOrder: 4, chestInches: 44, lengthInches: 31 },
    { code: '2XL', label: 'Double Extra Large', sortOrder: 5, chestInches: 46, lengthInches: 32 },
  ];

  const sizes: Record<string, any> = {};
  for (const s of sizeData) {
    sizes[s.code] = await prisma.size.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }

  // 4. SEASONS
  const season2425 = await prisma.season.upsert({
    where: { code: '2024-25' },
    update: {},
    create: {
      code: '2024-25',
      name: '2024/2025 Campaign',
      isCurrent: true,
    },
  });

  const retroSeason = await prisma.season.upsert({
    where: { code: '1998-99' },
    update: {},
    create: {
      code: '1998-99',
      name: '1998/1999 Treble Retro',
      isCurrent: false,
    },
  });

  // 5. CLUBS
  const realMadrid = await prisma.club.upsert({
    where: { slug: 'real-madrid' },
    update: {},
    create: {
      slug: 'real-madrid',
      name: 'Real Madrid CF',
      shortCode: 'RMA',
      league: 'La Liga',
      country: 'Spain',
      primaryColor: '#FFFFFF',
      secondaryColor: '#FFC400',
    },
  });

  const arsenal = await prisma.club.upsert({
    where: { slug: 'arsenal' },
    update: {},
    create: {
      slug: 'arsenal',
      name: 'Arsenal FC',
      shortCode: 'ARS',
      league: 'Premier League',
      country: 'England',
      primaryColor: '#EF0107',
      secondaryColor: '#063672',
    },
  });

  // 6. CATEGORIES
  const matchCategory = await prisma.category.upsert({
    where: { slug: 'authentic-player-version' },
    update: {},
    create: {
      slug: 'authentic-player-version',
      name: 'Authentic Match Edition (HEAT.RDY)',
      description: 'Player issue performance jerseys with athletic fit and breathability',
    },
  });

  const fanCategory = await prisma.category.upsert({
    where: { slug: 'stadium-fan-edition' },
    update: {},
    create: {
      slug: 'stadium-fan-edition',
      name: 'Stadium Fan Edition (AEROREADY)',
      description: 'Standard regular-fit jerseys tailored for daily lifestyle and match days',
    },
  });

  // 7. PAYMENT METHODS
  const bkashMethod = await prisma.paymentMethod.upsert({
    where: { code: 'BKASH' },
    update: {},
    create: {
      code: 'BKASH',
      name: 'bKash Personal / Merchant Payment',
      accountNumber: '01888123456',
      accountType: 'Merchant',
      instructions: 'Send money to 01888123456 and submit Transaction ID (TrxID) below.',
      chargePercentage: 0,
    },
  });

  const nagadMethod = await prisma.paymentMethod.upsert({
    where: { code: 'NAGAD' },
    update: {},
    create: {
      code: 'NAGAD',
      name: 'Nagad Payment',
      accountNumber: '01711234567',
      accountType: 'Merchant',
      instructions: 'Pay via Nagad Merchant 01711234567 and enter 8-character TrxID.',
      chargePercentage: 0,
    },
  });

  const codMethod = await prisma.paymentMethod.upsert({
    where: { code: 'COD' },
    update: {},
    create: {
      code: 'COD',
      name: 'Cash on Delivery (Inside & Outside Dhaka)',
      instructions: 'Pay directly to delivery agent upon parcel inspection.',
      chargePercentage: 0,
    },
  });

  // 8. SUPPLIERS
  const supplier1 = await prisma.supplier.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      code: 'SUP-001',
      name: 'Global Sports Sourcing Guangzhou Ltd.',
      contactPerson: 'Kenji Lin',
      email: 'kenji@globalsportssourcing.cn',
      country: 'China',
      paymentTerms: '50% Advance, 50% on Bill of Lading',
    },
  });

  // 9. PRODUCT WITH MULTIPLE IMAGES, SIZES, AND INVENTORY
  const rmaHome = await prisma.product.upsert({
    where: { slug: 'real-madrid-24-25-home-authentic' },
    update: {},
    create: {
      slug: 'real-madrid-24-25-home-authentic',
      sku: 'RMA-2425-H-AUTH',
      title: 'Real Madrid 2024/25 Home Authentic Jersey',
      subtitle: 'Official player-issue edition with houndstooth weave pattern',
      description:
        'Crafted for high performance with HEAT.RDY technology, heat-applied Real Madrid crest, and Champions League badge compatibility.',
      kitType: 'Home',
      baseSellingPrice: 2400,
      baseBuyingPrice: 1100,
      comparePrice: 2800,
      isFeatured: true,
      isNewArrival: true,
      categoryId: matchCategory.id,
      clubId: realMadrid.id,
      seasonId: season2425.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
            altText: 'Real Madrid 24/25 Home Jersey Front View',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
            altText: 'Real Madrid 24/25 Home Jersey Fabric Close-up',
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // Create Variants and Size-Aware Inventories
  const variantSizes = ['S', 'M', 'L', 'XL'];
  for (const szCode of variantSizes) {
    const sizeObj = sizes[szCode];
    const varSku = `RMA-2425-H-${szCode}`;

    const variant = await prisma.productVariant.upsert({
      where: { sku: varSku },
      update: {},
      create: {
        productId: rmaHome.id,
        sizeId: sizeObj.id,
        sku: varSku,
        currentSellingPrice: 2400,
        currentBuyingPrice: 1100,
        inventory: {
          create: {
            productId: rmaHome.id,
            sizeId: sizeObj.id,
            availableQuantity: szCode === 'M' ? 18 : 12,
            reservedQuantity: szCode === 'M' ? 2 : 0,
            soldQuantity: 5,
            returnedQuantity: 0,
            damagedQuantity: 0,
            lostQuantity: 0,
            totalQuantity: szCode === 'M' ? 20 : 12,
            lowStockThreshold: 5,
          },
        },
      },
    });

    // Record historical price record
    await prisma.variantPriceHistory.create({
      data: {
        variantId: variant.id,
        sellingPrice: 2400,
        buyingPrice: 1100,
        reason: 'Initial season launch pricing',
        changedByUserId: superAdminUser.id,
      },
    });
  }

  // 10. BUSINESS SETTINGS
  const settings = [
    { key: 'APP_NAME', value: 'RAYVEN Athletics', group: 'BRAND' },
    { key: 'CURRENCY', value: 'BDT', group: 'GENERAL' },
    { key: 'DHAKA_DELIVERY_FEE', value: '80', group: 'SHIPPING' },
    { key: 'OUTSIDE_DHAKA_DELIVERY_FEE', value: '150', group: 'SHIPPING' },
    { key: 'FREE_SHIPPING_THRESHOLD', value: '5000', group: 'SHIPPING' },
  ];

  for (const st of settings) {
    await prisma.businessSettings.upsert({
      where: { key: st.key },
      update: { value: st.value },
      create: st,
    });
  }

  console.log('RAYVEN PostgreSQL database seeded successfully with normalized data!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
