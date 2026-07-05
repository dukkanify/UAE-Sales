import { PrismaClient, type AccountType, type UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { demoAccounts } from "../mock/demo-accounts.mock";
import { mockCategories } from "../mock/categories.mock";
import {
  marketplaceListings,
  marketplaceUserListings,
} from "../mock/listings.mock";
import { marketplaceSellers } from "../mock/sellers.mock";

const prisma = new PrismaClient();

const roleMap: Record<string, UserRole> = {
  user: "USER",
  business: "BUSINESS",
  admin: "ADMIN",
};

const accountTypeMap: Record<string, AccountType> = {
  individual: "INDIVIDUAL",
  business: "BUSINESS",
  buyer: "BUYER",
  seller: "SELLER",
  company: "COMPANY",
};

const conditionMap = {
  new: "NEW",
  used: "USED",
  excellent: "EXCELLENT",
} as const;

const statusMap = {
  draft: "DRAFT",
  active: "ACTIVE",
  pending_review: "PENDING_REVIEW",
  expired: "EXPIRED",
  rejected: "REJECTED",
} as const;

async function clearDatabase() {
  await prisma.dispute.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const users = new Map<string, string>();

  for (const account of demoAccounts) {
    const user = await prisma.user.create({
      data: {
        id: account.profile.id,
        fullName: account.profile.fullName,
        email: account.email,
        phone: account.phone,
        passwordHash: await hashPassword(account.password),
        role: roleMap[account.role],
        accountType: accountTypeMap[account.profile.accountType] ?? "INDIVIDUAL",
        emirate: account.profile.city,
        city: account.profile.city,
        verified: account.profile.isVerified,
        subscription: account.profile.subscription,
        employeesCount: account.profile.employeesCount,
        listingsCount: account.profile.listingsCount,
        favoritesCount: account.profile.favoritesCount,
        wallet: {
          create: {
            availableBalance: account.profile.walletBalance ?? 0,
            pendingBalance: account.role === "business" ? 3200 : 0,
          },
        },
      },
    });

    users.set(account.email, user.id);
  }

  return users;
}

async function seedSellers(demoUserId: string) {
  const sellerIdByKey = new Map<string, string>();

  for (const [sellerKey, seller] of Object.entries(marketplaceSellers)) {
    const isDemoUserSeller = sellerKey === "ahmed-al-mansoori";

    const record = await prisma.seller.create({
      data: {
        id: seller.id,
        sellerKey,
        userId: isDemoUserSeller ? demoUserId : undefined,
        sellerName: seller.name,
        sellerType: seller.sellerType ?? "individual",
        rating: seller.rating,
        reviewsCount: seller.reviewCount ?? 0,
        verified: seller.isVerified ?? false,
        responseTime: seller.responseTime,
        completedTransactions: seller.completedTransactions ?? 0,
        avatarUrl: seller.avatarUrl,
        nameEnglish: seller.nameEnglish,
        joinedAt: seller.joinedAt ? new Date(seller.joinedAt) : undefined,
      },
    });

    sellerIdByKey.set(sellerKey, record.id);
  }

  return sellerIdByKey;
}

async function seedCategories() {
  for (const category of mockCategories) {
    await prisma.category.create({
      data: {
        id: category.id,
        nameArabic: category.name,
        slug: category.slug,
        icon: category.icon,
        image: category.imageUrl,
        listingCount: category.listingCount,
        subcategories: category.subcategories,
        featuredListingSlug: category.featuredListingSlug,
      },
    });
  }
}

async function seedListings(demoUserId: string) {
  const allListings = [...marketplaceListings, ...marketplaceUserListings];

  for (const listing of allListings) {
    const isUserListing = listing.id.startsWith("user-listing");
    const metadata = {
      subcategory: listing.subcategory,
      country: listing.country,
      imageTone: listing.imageTone,
      verifiedSeller: listing.verifiedSeller,
      contactMethod: listing.contactMethod,
      deliveryOption: listing.deliveryOption,
      features: listing.features,
      negotiable: listing.negotiable,
      reasonForSelling: listing.reasonForSelling,
      carSpecs: listing.carSpecs,
      realEstateSpecs: listing.realEstateSpecs,
      electronicsSpecs: listing.electronicsSpecs,
    };

    await prisma.listing.create({
      data: {
        id: listing.id,
        sellerId: listing.seller.id,
        ownerUserId: isUserListing ? demoUserId : undefined,
        categoryId: listing.categoryId,
        titleArabic: listing.title,
        titleEnglish: listing.titleEnglish,
        slug: listing.slug,
        descriptionArabic: listing.description,
        descriptionEnglish: listing.descriptionEnglish,
        price: listing.price,
        currency: listing.currency,
        emirate: listing.emirate,
        city: listing.city,
        area: listing.area,
        condition: conditionMap[listing.condition],
        status: statusMap[listing.status],
        featured: listing.isFeatured,
        premium: listing.isPremium ?? false,
        escrowAvailable: listing.escrowAvailable ?? false,
        views: listing.views,
        metadata,
        createdAt: listing.postedAt ? new Date(listing.postedAt) : undefined,
        images: listing.images
          ? {
              create: listing.images.map((url, index) => ({
                url,
                sortOrder: index,
                alt: listing.title,
              })),
            }
          : listing.imageUrl
            ? {
                create: [{ url: listing.imageUrl, sortOrder: 0, alt: listing.title }],
              }
            : undefined,
      },
    });
  }
}

async function seedWalletTransactions() {
  const demoUser = await prisma.user.findUnique({
    where: { email: "user@uaesales.demo" },
    include: { wallet: true },
  });

  if (!demoUser?.wallet) {
    return;
  }

  await prisma.walletTransaction.createMany({
    data: [
      {
        walletId: demoUser.wallet.id,
        type: "DEPOSIT",
        amount: 1500,
        status: "COMPLETED",
        description: "إيداع في المحفظة",
      },
      {
        walletId: demoUser.wallet.id,
        type: "ESCROW_HOLD",
        amount: 3200,
        status: "COMPLETED",
        description: "حجز ضمان — آيفون 15 برو",
      },
    ],
  });
}

async function main() {
  console.log("Clearing database...");
  await clearDatabase();

  console.log("Seeding users...");
  await seedUsers();

  const demoUser = await prisma.user.findUnique({
    where: { email: "user@uaesales.demo" },
  });

  if (!demoUser) {
    throw new Error("Demo user not found after seed.");
  }

  console.log("Seeding sellers...");
  await seedSellers(demoUser.id);

  console.log("Seeding categories...");
  await seedCategories();

  console.log("Seeding listings...");
  await seedListings(demoUser.id);

  console.log("Seeding wallet transactions...");
  await seedWalletTransactions();

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
