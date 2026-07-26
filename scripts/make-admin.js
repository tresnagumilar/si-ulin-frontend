const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update the first user to ADMIN (assuming the user is the only one in DB right now)
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found in database. Please login first.');
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });

  console.log(`Successfully made ${updatedUser.email} an ADMIN!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
