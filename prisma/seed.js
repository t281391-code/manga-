import { PrismaClient, RoleName, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedManga({ title, description, coverImage, chapters }) {
  let manga = await prisma.manga.findFirst({
    where: {
      title,
      deletedAt: null,
    },
  });

  if (!manga) {
    manga = await prisma.manga.create({
      data: {
        title,
        description,
        coverImage,
      },
    });
  } else {
    manga = await prisma.manga.update({
      where: { id: manga.id },
      data: {
        description,
        coverImage,
      },
    });
  }

  for (const chapter of chapters) {
    await prisma.chapter.upsert({
      where: {
        mangaId_orderIndex: {
          mangaId: manga.id,
          orderIndex: chapter.orderIndex,
        },
      },
      update: chapter,
      create: {
        ...chapter,
        mangaId: manga.id,
      },
    });
  }

  return manga;
}

async function main() {
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: RoleName.USER },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: RoleName.ADMIN },
  });

  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin",
      roleId: adminRole.id,
      subscription: {
        create: {
          plan: Plan.PREMIUM,
        },
      },
    },
  });

  const mangas = [];

  mangas.push(await seedManga({
    title: "Attack on Titan",
    description: "Humanity survives behind walls while giant titans threaten everything beyond them.",
    coverImage: "https://placehold.co/720x480/0f766e/ffffff?text=Attack+on+Titan",
    chapters: [
    {
      title: "To You, 2,000 Years From Now",
      content: "The outer district wakes to a quiet morning, but the wall keeps a secret no one can ignore for long.",
      orderIndex: 1,
      isPreview: true,
    },
    {
      title: "That Day",
      content: "A sudden attack changes the city forever and forces the survivors to choose between fear and action.",
      orderIndex: 2,
      isPreview: true,
    },
    {
      title: "First Battle",
      content: "Training ends and the recruits face a brutal battlefield where every decision carries a cost.",
      orderIndex: 3,
      isPreview: false,
    },
    {
      title: "The Key",
      content: "A hidden clue points toward the basement, but reaching the truth means surviving the next wave.",
      orderIndex: 4,
      isPreview: false,
    },
  ],
  }));

  mangas.push(await seedManga({
    title: "One Piece",
    description: "A rubber-powered pirate sails the Grand Line with a growing crew and a dream of freedom.",
    coverImage: "https://placehold.co/720x480/155e75/ffffff?text=One+Piece",
    chapters: [
      {
        title: "Romance Dawn",
        content: "A young pirate sets out with a straw hat, a small boat, and a goal larger than the sea.",
        orderIndex: 1,
        isPreview: true,
      },
      {
        title: "The First Crew Mate",
        content: "A swordsman in chains must decide whether a pirate captain is worth trusting.",
        orderIndex: 2,
        isPreview: true,
      },
      {
        title: "Map of the Grand Line",
        content: "A stolen map pulls the crew into a chase where treasure is not the only prize.",
        orderIndex: 3,
        isPreview: false,
      },
      {
        title: "A Cook's Promise",
        content: "At a floating restaurant, loyalty, hunger, and ambition meet on rough water.",
        orderIndex: 4,
        isPreview: false,
      },
    ],
  }));

  mangas.push(await seedManga({
    title: "Demon Slayer",
    description: "A kind-hearted swordsman hunts demons while searching for a way to save his sister.",
    coverImage: "https://placehold.co/720x480/166534/ffffff?text=Demon+Slayer",
    chapters: [
      {
        title: "Cruel Night",
        content: "A mountain home is shattered by tragedy, leaving one survivor with an impossible burden.",
        orderIndex: 1,
        isPreview: true,
      },
      {
        title: "Water Breathing",
        content: "Training begins under a strict master who tests patience, strength, and resolve.",
        orderIndex: 2,
        isPreview: true,
      },
      {
        title: "Final Selection",
        content: "The forest trial begins, and every shadow could be a demon waiting to strike.",
        orderIndex: 3,
        isPreview: false,
      },
      {
        title: "The First Mission",
        content: "A town with missing children reveals the first signs of a larger threat.",
        orderIndex: 4,
        isPreview: false,
      },
    ],
  }));

  mangas.push(await seedManga({
    title: "Jujutsu Kaisen",
    description: "A student enters the world of curses after swallowing a dangerous cursed object.",
    coverImage: "https://placehold.co/720x480/334155/ffffff?text=Jujutsu+Kaisen",
    chapters: [
      {
        title: "Cursed Object",
        content: "An after-school club finds an object that should never have been opened.",
        orderIndex: 1,
        isPreview: true,
      },
      {
        title: "The Vessel",
        content: "A desperate choice saves friends but pulls a student into a sentence worse than death.",
        orderIndex: 2,
        isPreview: true,
      },
      {
        title: "Tokyo Campus",
        content: "New teachers, new classmates, and a new mission reveal the rules of cursed energy.",
        orderIndex: 3,
        isPreview: false,
      },
      {
        title: "Domain Pressure",
        content: "A special grade curse appears, and survival depends on understanding fear itself.",
        orderIndex: 4,
        isPreview: false,
      },
    ],
  }));

  mangas.push(await seedManga({
    title: "Solo Leveling",
    description: "The weakest hunter receives a hidden system and begins climbing beyond human limits.",
    coverImage: "https://placehold.co/720x480/0f172a/ffffff?text=Solo+Leveling",
    chapters: [
      {
        title: "Double Dungeon",
        content: "A low-rank raid discovers a second gate with rules written in blood.",
        orderIndex: 1,
        isPreview: true,
      },
      {
        title: "The System",
        content: "A strange interface appears and offers daily quests with harsh penalties.",
        orderIndex: 2,
        isPreview: true,
      },
      {
        title: "Instant Dungeon",
        content: "A key opens a private battleground where every monster becomes a lesson.",
        orderIndex: 3,
        isPreview: false,
      },
      {
        title: "Shadow Soldier",
        content: "A defeated enemy leaves behind a power that changes the meaning of victory.",
        orderIndex: 4,
        isPreview: false,
      },
    ],
  }));

  console.log({ admin, mangas, userRole, adminRole });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
