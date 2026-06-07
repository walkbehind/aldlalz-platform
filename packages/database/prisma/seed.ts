import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SOFT_LAUNCH_PLANS = [
  {
    id: "plan_weekly",
    slug: "weekly",
    nameAr: "أسبوعي",
    nameEn: "Weekly",
    descriptionAr: "مناسب للأفراد لتجربة المنصة",
    descriptionEn: "Suitable for individuals testing the platform",
    tier: 1,
    durationDays: 7,
    maxListings: 3,
    includedFeatureCredits: 0,
    priceKwd: 3,
  },
  {
    id: "plan_monthly",
    slug: "monthly",
    nameAr: "شهري",
    nameEn: "Monthly",
    descriptionAr: "مناسب لملاك العقارات والدلالين بدوام جزئي",
    descriptionEn: "Suitable for property owners and part-time brokers",
    tier: 2,
    durationDays: 30,
    maxListings: 10,
    includedFeatureCredits: 0,
    priceKwd: 8,
  },
  {
    id: "plan_semi_annual",
    slug: "semi-annual",
    nameAr: "نصف سنوي",
    nameEn: "Semi-Annual",
    descriptionAr: "مناسب للدلالين النشطين — رصيد تمييز واحد شهرياً",
    descriptionEn: "Suitable for active brokers — 1 featured credit per month",
    tier: 3,
    durationDays: 182,
    maxListings: 50,
    includedFeatureCredits: 1,
    priceKwd: 40,
  },
  {
    id: "plan_annual",
    slug: "annual",
    nameAr: "سنوي",
    nameEn: "Annual",
    descriptionAr: "مناسب للمكاتب والدلالين المحترفين — رصيدان تمييز شهرياً",
    descriptionEn: "Suitable for offices and professional brokers — 2 featured credits per month",
    tier: 4,
    durationDays: 365,
    maxListings: 150,
    includedFeatureCredits: 2,
    priceKwd: 70,
  },
] as const;

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@aldlalz.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      nameEn: "Platform Admin",
      nameAr: "مدير المنصة",
      role: "SUPERADMIN",
      langPreference: "ar",
    },
  });

  for (const plan of SOFT_LAUNCH_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {
        nameAr: plan.nameAr,
        nameEn: plan.nameEn,
        descriptionAr: plan.descriptionAr,
        descriptionEn: plan.descriptionEn,
        tier: plan.tier,
        durationDays: plan.durationDays,
        maxListings: plan.maxListings,
        includedFeatureCredits: plan.includedFeatureCredits,
        priceKwd: plan.priceKwd,
        isActive: true,
      },
      create: {
        id: plan.id,
        slug: plan.slug,
        nameAr: plan.nameAr,
        nameEn: plan.nameEn,
        descriptionAr: plan.descriptionAr,
        descriptionEn: plan.descriptionEn,
        tier: plan.tier,
        durationDays: plan.durationDays,
        maxListings: plan.maxListings,
        includedFeatureCredits: plan.includedFeatureCredits,
        priceKwd: plan.priceKwd,
        isActive: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Plans: ${SOFT_LAUNCH_PLANS.length} subscription tiers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
