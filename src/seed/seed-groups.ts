import { PrismaClient } from 'prisma/generated/prisma/client';

export const seedGroups = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding groups...');

  const user = await prisma.user.findUnique({
    where: { email: 'matias@mail.com' },
  });

  if (!user) {
    console.warn('  ⚠ User not found for group creation.');
    return;
  }

  const ledger = await prisma.ledger.findFirst();

  if (!ledger) {
    console.warn('  ⚠ No ledger found for group creation.');
    return;
  }

  const groupNames = [
    'Sueldo',
    'Alquiler & Expensas',
    'Supermercado',
    'Servicios Lavalle',
    'Varios',
    'Servicios',
    'Servicios Streaming',
    'Mudanza',
    'Ferretería',
    'Supermercado Noah y Liam',
    'Perfumería',
    'Ropa de Cama',
    'Bazar',
    'PC',
    'Colchón inflable',
    'Librería',
    'Aporte manutención varios',
    'Cuidado de Niños',
    'Jardín Noah',
    'Colegio Noah',
    'Ropa',
    'Salud',
    'Terapias Noah',
    'Peluquería',
    'Jardín Liam',
    'Regalos',
    'Cumpleaños',
    'Cumple Noah',
    'Calzado',
    'Dia del Niño',
    'Remedios',
    'Jardín de Liam',
    'Abogados',
    'Bancos',
    'Extención Yani',
    'Suscripciones',
    'Uruguay',
    'Extención Sofi',
    'Córdoba',
    'Salida con Hijos',
    'Almuerzos & Café Mati',
    'Delivery',
    'Vacaciones Verano',
    'Cena con Amigos',
    'Navidad',
    'Vicky',
    'Comidas Familiares',
    'Asado',
    'Salida con Sofi',
    'Salidas Familiares',
    'Merienda con Familia',
    'Comidas con Amigos',
    'Merienda con Amigos',
    'OSDE',
    'Terapia',
    'Dentista',
    'Farmacia',
    'Auto Celi',
    'Auto',
    'Auto Sofi',
    'Taxis & Cabify',
    'Sube',
    'Prestamo Massa 2',
    'Prestamo Massa 1',
    'Granja',
    'Pileta',
    'Vestimenta',
    'Extención Susana',
    'Benito Nazar',
    'Cruz del Sur',
    'Celular Sofi',
    'Proyectado',
    'Aguinaldo Benito Nazar',
    'Aguinaldo Cruz del Sur',
    'Almuerzo Colegio',
    'Francesco',
    'Monotributo',
    'Padel',
    'Particulares',
    'Victoria',
  ];

  for (const name of groupNames) {
    await prisma.group.upsert({
      where: {
        ledgerId_name: {
          ledgerId: ledger.id,
          name,
        },
      },
      update: {},
      create: {
        name,
        ledgerId: ledger.id,
        userId: user.id,
      },
    });
  }

  console.log('  ✔ Groups seeded');
};
