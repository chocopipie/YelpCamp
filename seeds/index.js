// THIS FILE CREATE DATA FOR DATABASE


const mongoose = require('mongoose');
const Campground = require('../models/campground');
const axios = require('axios');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

main().catch(err => console.log("NOT CONNECTED"));

// connect to db
async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log("CONNECTED")
}

// async function to make request to Unsplash API using axios
async function getRandomImage() {
    try {
        const config = {params: {collections: 'PS93s3CcF4', client_id : 'tQaTPGMG0N09LXTpfBNEuqcKZ7JY7pq2F9oPk5BlOR0'}}
        const img = await axios.get('https://api.unsplash.com/photos/random', config);
        return img.data.urls.small;
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
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100);
        const newCamp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: await getRandomImage(),
            price,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Totam expedita aperiam illo voluptates magni maxime, ut impedit illum nam, quibusdam et animi quia quidem, at pariatur nulla officiis tempore voluptas!'
        })
        await newCamp.save();
    }
}

seedDB();