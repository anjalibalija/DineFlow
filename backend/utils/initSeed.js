const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

const initSeed = async () => {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@dineflow.com' } });
    if (adminExists) return; // Already seeded

    console.log('Seeding initial data...');
    
    const salt = await bcrypt.genSalt(10);
    const adminHashed = await bcrypt.hash('adminpassword', salt);
    const userHashed = await bcrypt.hash('userpassword', salt);

    const admin = await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@dineflow.com', password: adminHashed, role: 'admin' }
    });

    await prisma.user.create({
      data: { name: 'Test Customer', email: 'user@dineflow.com', password: userHashed, role: 'user' }
    });

    const restaurantsData = [
      { name: 'The Golden Plate', cuisine: 'Fine Dining', location: 'Downtown', rating: 4.8, crowdLevel: 'High', queueCount: 5, description: 'Experience luxury dining at its finest with our chef\'s special tasting menu.', adminId: admin.id },
      { name: 'Sushi Symphony', cuisine: 'Japanese', location: 'West End', rating: 4.9, crowdLevel: 'Low', queueCount: 0, description: 'Authentic sushi and sashimi prepared with the freshest ingredients.', adminId: admin.id },
      { name: 'Bella Roma', cuisine: 'Italian', location: 'Little Italy', rating: 4.6, crowdLevel: 'Medium', queueCount: 2, description: 'Classic Italian dishes in a warm, rustic setting.', adminId: admin.id },
      { name: 'Spice Route', cuisine: 'Indian', location: 'City Center', rating: 4.5, crowdLevel: 'Full', queueCount: 15, description: 'A culinary journey through the vibrant spices of India.', adminId: admin.id }
    ];

    for (const restData of restaurantsData) {
      const restaurant = await prisma.restaurant.create({ data: restData });
      
      const categories = ['Rooftop', 'Window Side', 'Corner Side', 'Center', 'Courtyard', 'Private Cabin', 'Family Table', 'Couple Table'];
      const tablesToInsert = [];
      
      for (let i = 1; i <= 12; i++) {
        tablesToInsert.push({
          restaurantId: restaurant.id,
          tableNumber: `T${i}`,
          category: categories[i % categories.length],
          capacity: (i % 4) + 2,
          bookingCount: Math.floor(Math.random() * 10),
          isBestseller: Math.random() > 0.8
        });
      }
      
      await prisma.restaurantTable.createMany({ data: tablesToInsert });
    }

    console.log('Seed data successfully injected.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = initSeed;
