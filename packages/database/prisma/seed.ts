import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const packages = [
    {
      nameAr: "أساسية",
      nameEn: "Basic",
      tier: 1,
      maxListings: 5,
      durationDays: 30,
      priceKwd: 5,
    },
    {
      nameAr: "محترفين",
      nameEn: "Pro",
      tier: 2,
      maxListings: 15,
      durationDays: 30,
      priceKwd: 10,
    },
    {
      nameAr: "كبار الشخصيات",
      nameEn: "VIP",
      tier: 3,
      maxListings: 50,
      durationDays: 30,
      priceKwd: 20,
    },
  ];

  for (const pkg of packages) {
    const exists = await prisma.package.findFirst({
      where: { nameEn: pkg.nameEn },
    });
    if (!exists) {
      await prisma.package.create({ data: pkg });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
