import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mirrors = [
  {
    name: "Classic Wall Mirror",
    type: "wall",
    description: "Timeless rectangular wall mirror, perfect for halls and bedrooms.",
    imageUrl: null,
  },
  {
    name: "Art Deco Floor Mirror",
    type: "floor",
    description: "Elegant full-length mirror with a gold art deco frame.",
    imageUrl: null,
  },
  {
    name: "Round Vanity Mirror",
    type: "vanity",
    description: "Compact round mirror ideal for bathrooms and dressing tables.",
    imageUrl: null,
  },
  {
    name: "Sunburst Decorative Mirror",
    type: "decorative",
    description: "Statement sunburst design for living rooms and entryways.",
    imageUrl: null,
  },
];

async function main() {
  for (const mirror of mirrors) {
    await prisma.mirror.create({ data: mirror });
  }
  console.log(`Seeded ${mirrors.length} mirrors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
