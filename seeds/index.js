// THIS FILE CREATE DATA FOR DATABASE

require('dotenv').config();

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const axios = require('axios');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const dbUrl = process.env.DB_URL; // mongo cloud connection variable

main().catch(err => console.log("NOT CONNECTED"));

// connect to db
async function main() {
  await mongoose.connect(dbUrl, {});
  console.log("CONNECTED")
}


// async function to make request to Unsplash API using axios
async function getRandomImage() {
    try {
        const config = {params: {collections: '9046579', client_id : 'tQaTPGMG0N09LXTpfBNEuqcKZ7JY7pq2F9oPk5BlOR0'}}
        const img = await axios.get('https://api.unsplash.com/photos/random', config);
        return img.data;
    } catch (error) {
        console.log(error);
    }
}


// function passed in the variable
// pass in the array, return a random element in the array
const sample = (array) => array[Math.floor(Math.random() * array.length)] 

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomImage = await getRandomImage();
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100);
        const newCamp = new Campground({
            author: '639ecece7c84421edf82c9fa',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: randomImage.urls.small,
                    filename: `YelpCamp/${randomImage.id}`
                }
            ],
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            description: randomImage.description
        })
        await newCamp.save();
    }
}

seedDB();