import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import City from './models/City.model.js';
import ActivityCatalog from './models/ActivityCatalog.model.js';
import Trip from './models/Trip.model.js';
import ItineraryStop from './models/ItineraryStop.model.js';
import TripActivity from './models/TripActivity.model.js';
import Expense from './models/Expense.model.js';
import CommunityPost from './models/CommunityPost.model.js';

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE_CONNECTION_STRING;

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log('ERROR connecting to DB:', err));

// ─── DATA ───────────────────────────────────────────────────────────────────

const users = [
  {
    name: "Mehdiali Kadiwala",
    email: "mehdiali@example.com",
    password: "password123",
    passwordConfirm: "password123",
    phone: "+91 9876543210",
    city: "Ahmedabad",
    country: "India",
    bio: "Software developer and organizer.",
    photo: "avatar1.jpg",
    role: "admin",
  },
  {
    name: "Himanshu",
    email: "himanshu@example.com",
    password: "password123",
    passwordConfirm: "password123",
    phone: "+91 9123456780",
    city: "Ahmedabad",
    country: "India",
    bio: "Frontend specialist.",
    photo: "avatar2.jpg",
    role: "user",
  },
  {
    name: "Kumail",
    email: "kumail@example.com",
    password: "password123",
    passwordConfirm: "password123",
    phone: "+91 9234567890",
    city: "Ahmedabad",
    country: "India",
    bio: "Backend engineer.",
    photo: "avatar3.jpg",
    role: "user",
  },
  {
    name: "Rehan",
    email: "rehan@example.com",
    password: "password123",
    passwordConfirm: "password123",
    phone: "+91 9345678901",
    city: "Ahmedabad",
    country: "India",
    bio: "UI/UX and logic.",
    photo: "avatar4.jpg",
    role: "user",
  },
  {
    name: "Osama Shaikh",
    email: "osama@example.com",
    password: "password123",
    passwordConfirm: "password123",
    phone: "+91 8000345521",
    city: "Ahmedabad",
    country: "India",
    bio: "I am a student.",
    photo: "avatar5.jpg",
    role: "user",
  }
];

const cities = [
  {
    name: "Mumbai",
    country: "India",
    region: "Asia",
    image: "mumbai.jpg",
    description: "The city of dreams and Bollywood.",
    costIndex: "₹₹₹",
    popularity: 4.8,
    isTopAttraction: true,
  },
  {
    name: "Delhi",
    country: "India",
    region: "Asia",
    image: "delhi.jpg",
    description: "A rich tapestry of history and modernity.",
    costIndex: "₹₹",
    popularity: 4.7,
    isTopAttraction: true,
  },
  {
    name: "Jaipur",
    country: "India",
    region: "Asia",
    image: "jaipur.jpg",
    description: "The Pink City, rich in royal heritage.",
    costIndex: "₹₹",
    popularity: 4.9,
    isTopAttraction: true,
  },
  {
    name: "Goa",
    country: "India",
    region: "Asia",
    image: "goa.jpg",
    description: "Beautiful beaches and Portuguese architecture.",
    costIndex: "₹₹",
    popularity: 4.9,
    isTopAttraction: true,
  },
  {
    name: "Manali",
    country: "India",
    region: "Asia",
    image: "manali.jpg",
    description: "A high-altitude Himalayan resort town.",
    costIndex: "₹₹",
    popularity: 4.6,
    isTopAttraction: false,
  }
];

const catalog = [
  // Mumbai
  {
    title: "Gateway of India Tour",
    category: "Sightseeing",
    cost: 500,
    duration: "2 hours",
    image: "gateway.jpg",
    description: "Visit the iconic arch monument built during the 20th century.",
    rating: 4.8,
  },
  {
    title: "Elephanta Caves Exploration",
    category: "Sightseeing",
    cost: 1500,
    duration: "5 hours",
    image: "elephanta.jpg",
    description: "A network of sculpted caves located on Elephanta Island.",
    rating: 4.6,
  },
  // Delhi
  {
    title: "Red Fort Heritage Walk",
    category: "Sightseeing",
    cost: 600,
    duration: "3 hours",
    image: "redfort.jpg",
    description: "Explore the historic fort complex in Old Delhi.",
    rating: 4.7,
  },
  {
    title: "Chandni Chowk Food Tour",
    category: "Food",
    cost: 1200,
    duration: "4 hours",
    image: "chandnichowk.jpg",
    description: "Taste the most authentic street food in Delhi.",
    rating: 4.9,
  },
  // Jaipur
  {
    title: "Amer Fort Safari",
    category: "Sightseeing",
    cost: 2000,
    duration: "4 hours",
    image: "amerfort.jpg",
    description: "Take a jeep safari up to the stunning Amer Fort.",
    rating: 4.8,
  },
  // Goa
  {
    title: "Baga Beach Water Sports",
    category: "Adventure",
    cost: 3500,
    duration: "3 hours",
    image: "bagabeach.jpg",
    description: "Parasailing, jet skiing, and banana boat rides.",
    rating: 4.5,
  }
];

// ─── IMPORT SCRIPT ──────────────────────────────────────────────────────────

const importData = async () => {
  try {
    console.log('Clearing database...');
    await User.deleteMany();
    await City.deleteMany();
    await ActivityCatalog.deleteMany();
    await Trip.deleteMany();
    await ItineraryStop.deleteMany();
    await TripActivity.deleteMany();
    await Expense.deleteMany();
    await CommunityPost.deleteMany();

    console.log('Inserting Users...');
    const createdUsers = await User.create(users);

    console.log('Inserting Cities...');
    const createdCities = await City.create(cities);

    console.log('Inserting Catalog Activities...');
    const getCityId = (name) => createdCities.find(c => c.name === name)._id;

    const catalogWithCity = [
      { ...catalog[0], city: getCityId('Mumbai'), cityName: 'Mumbai' },
      { ...catalog[1], city: getCityId('Mumbai'), cityName: 'Mumbai' },
      { ...catalog[2], city: getCityId('Delhi'), cityName: 'Delhi' },
      { ...catalog[3], city: getCityId('Delhi'), cityName: 'Delhi' },
      { ...catalog[4], city: getCityId('Jaipur'), cityName: 'Jaipur' },
      { ...catalog[5], city: getCityId('Goa'), cityName: 'Goa' },
    ];
    const createdCatalog = await ActivityCatalog.create(catalogWithCity);

    console.log('Inserting Trips...');
    const osama = createdUsers.find(u => u.name === 'Osama Shaikh');
    const mehdiali = createdUsers.find(u => u.name === 'Mehdiali Kadiwala');
    const himanshu = createdUsers.find(u => u.name === 'Himanshu');

    const trip1 = await Trip.create({
      title: "Rajasthan Royal Tour",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-22"),
      isPublic: true,
      status: "upcoming",
      creator: osama._id,
      maxMembers: 5,
      joinCode: "RAJ2026",
      totalBudget: 45000,
      members: [
        { user: osama._id, role: "editor", status: "accepted" },
        { user: mehdiali._id, role: "editor", status: "accepted" },
        { user: himanshu._id, role: "viewer", status: "accepted" }
      ]
    });

    const trip2 = await Trip.create({
      title: "Goa Beach Bash",
      startDate: new Date("2026-12-25"),
      endDate: new Date("2026-12-31"),
      isPublic: true,
      status: "upcoming",
      creator: mehdiali._id,
      maxMembers: 10,
      joinCode: "GOA2026",
      totalBudget: 60000,
      members: [
        { user: mehdiali._id, role: "editor", status: "accepted" },
        { user: osama._id, role: "editor", status: "accepted" }
      ]
    });

    console.log('Inserting Itinerary Stops...');
    const stop1 = await ItineraryStop.create({
      trip: trip1._id,
      city: getCityId('Jaipur'),
      cityName: "Jaipur",
      arrivalDate: new Date("2026-10-15"),
      departureDate: new Date("2026-10-19"),
      accommodation: "Rambagh Palace",
      notes: "Booked a heritage room.",
      stopOrder: 1
    });

    const stop2 = await ItineraryStop.create({
      trip: trip1._id,
      city: getCityId('Delhi'),
      cityName: "Delhi",
      arrivalDate: new Date("2026-10-19"),
      departureDate: new Date("2026-10-22"),
      accommodation: "Taj Palace",
      notes: "Shopping in Chandni Chowk planned.",
      stopOrder: 2
    });

    console.log('Inserting Trip Activities...');
    await TripActivity.create({
      trip: trip1._id,
      stop: stop1._id,
      catalogActivity: createdCatalog.find(c => c.title === "Amer Fort Safari")._id,
      title: "Amer Fort Safari",
      scheduledDate: new Date("2026-10-16"),
      startTime: "09:00",
      endTime: "13:00",
      cost: 2000,
      category: "Sightseeing",
      dayNumber: 2
    });

    await TripActivity.create({
      trip: trip1._id,
      stop: stop2._id,
      catalogActivity: createdCatalog.find(c => c.title === "Chandni Chowk Food Tour")._id,
      title: "Chandni Chowk Food Tour",
      scheduledDate: new Date("2026-10-20"),
      startTime: "18:00",
      endTime: "22:00",
      cost: 1200,
      category: "Food",
      dayNumber: 6
    });

    console.log('Inserting Expenses...');
    await Expense.create({
      trip: trip1._id,
      title: "Flights to Jaipur",
      amount: 15000,
      category: "Transport",
      paidBy: osama._id,
      date: new Date("2026-09-01")
    });

    await Expense.create({
      trip: trip1._id,
      title: "Amer Fort Safari Tickets",
      amount: 4000, // 2 people
      category: "Activities",
      paidBy: mehdiali._id,
      date: new Date("2026-10-16")
    });

    console.log('Inserting Community Posts...');
    await CommunityPost.create({
      user: mehdiali._id,
      trip: trip2._id,
      caption: "Looking for recommendations for New Year in Goa! We are a group of friends heading to Goa this December. Any hidden beaches or great parties we shouldn't miss?",
      likesCount: 12
    });

    await CommunityPost.create({
      user: himanshu._id,
      trip: trip1._id,
      caption: "Best street food spots in Delhi? I've heard Chandni Chowk is great, but are there any specific stalls or hidden gems you recommend for authentic chaat?",
      likesCount: 8
    });

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log('Error importing data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else {
  console.log("Run with '--import' flag: node seed.js --import");
  process.exit();
}
