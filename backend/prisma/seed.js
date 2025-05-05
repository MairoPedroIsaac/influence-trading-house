import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  await prisma.contact.createMany({
    data: [
      {
        fullName: "Test User",
        email: "test@example.com",
        country: "Nigeria",
        broker: "BrokerXYZ",
        hasMT5: true,
        areaOfInterest: "Forex"
      }
    ]
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
