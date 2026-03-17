import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      provider: 'local',
      emailVerified: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      provider: 'local',
      emailVerified: true,
    },
  })

  console.log(`👤 Created users: ${user1.name}, ${user2.name}`)

  // Create sample measurements
  const now = new Date()
  const measurements = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    measurements.push({
      userId: user1.id,
      date,
      weight: 80 + Math.sin(i / 5) * 3,
      chest: 100 + Math.cos(i / 4) * 2,
      waist: 85 + Math.sin(i / 6) * 3,
      hips: 95 + Math.cos(i / 5) * 2,
      thighs: 60 + Math.sin(i / 7) * 2,
      biceps: 35 + Math.cos(i / 8) * 1.5,
      bodyFat: 20 + Math.sin(i / 10) * 2,
      notes: i % 5 === 0 ? `Progress update day ${i}` : null,
    })
  }

  await prisma.measurement.createMany({
    data: measurements,
    skipDuplicates: true,
  })

  console.log(`📊 Created ${measurements.length} sample measurements`)

  // Create fitness goals
  await prisma.fitnessGoals.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      targetWeight: 75,
      targetBodyFat: 15,
      startDate: new Date(),
      targetDate: new Date(now.setMonth(now.getMonth() + 6)),
      notes: 'Goal: Reach 75kg with 15% body fat in 6 months',
    },
  })

  console.log('🎯 Created fitness goals')

  // Create refresh token for testing
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId: user1.id,
      token: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  })

  console.log('🔑 Created test refresh token')

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })