const dotenv = require('dotenv');
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const importData = async () => {
  try {
    // Clear the database tables
    await prisma.booking.deleteMany();
    await prisma.restaurantTable.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    console.log('Existing data cleared');

    const salt = await bcrypt.genSalt(10);
    const adminHashed = await bcrypt.hash('adminpassword', salt);
    const userHashed = await bcrypt.hash('userpassword', salt);

    const admin = await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@dineflow.com', password: adminHashed, role: 'admin' }
    });

    await prisma.user.create({
      data: { name: 'Test Customer', email: 'user@dineflow.com', password: userHashed, role: 'user' }
    });

    console.log('Users seeded');
    console.log('  Admin: admin@dineflow.com / adminpassword');
    console.log('  User:  user@dineflow.com / userpassword');

    // Seed restaurants linked to admin
    const restaurantsData = [
      { name: 'The Golden Plate', cuisine: 'Fine Dining', location: 'Downtown', city: 'Mumbai', priceRange: '₹₹₹₹', rating: 4.8, crowdLevel: 'High', queueCount: 5, description: 'Experience luxury dining at its finest with our chef\'s special tasting menu.', adminId: admin.id },
      { name: 'Sushi Symphony', cuisine: 'Japanese', location: 'West End', city: 'Bangalore', priceRange: '₹₹₹', rating: 4.9, crowdLevel: 'Low', queueCount: 0, description: 'Authentic sushi and sashimi prepared with the freshest ingredients.', adminId: admin.id },
      { name: 'Bella Roma', cuisine: 'Italian', location: 'Little Italy', city: 'Pune', priceRange: '₹₹', rating: 4.6, crowdLevel: 'Medium', queueCount: 2, description: 'Classic Italian dishes in a warm, rustic setting.', adminId: admin.id },
      { name: 'Spice Route', cuisine: 'Indian', location: 'City Center', city: 'Delhi', priceRange: '₹₹', rating: 4.5, crowdLevel: 'Full', queueCount: 15, description: 'A culinary journey through the vibrant spices of India.', adminId: admin.id }
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

    console.log('Restaurants and tables seeded');
    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

importData();
