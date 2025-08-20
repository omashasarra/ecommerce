import React from 'react';
import Heading from '../Shared/Heading';
import Img1 from "../../assets/blogs/blog-1.jpg";
import Img2 from "../../assets/blogs/blog-2.jpg";
import Img3 from "../../assets/blogs/blog-3.jpg";

const BlogData = [
    {
        title: "How to choose perfect smartwatch",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        published: "Jan 20, 2024 by Fairouz",
        image: Img1,
        aosDelay: "0",
    },
    {
        title: "How to choose perfect gadget",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        published: "Jan 20, 2024 by Ghostly",
        image: Img2,
        aosDelay: "200",
    },
    {
        title: "How to choose perfect VR headset",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        published: "Jan 20, 2024 by Reine",
        image: Img3,
        aosDelay: "400",
    },
];

const Blogs = () => {
  return (
    <div className="container px-4 mx-auto">
    {/* Header Section */}
    <Heading title="Recent News" subtitle="Explore Our Blogs" />

    {/* Blog Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 md:gap-7 mt-6">
        {BlogData.map((data) => (
        <div
        data-aos="fade-up"
        data-aos-delay={data.aosDelay}
        key={data.title} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-hidden">
            <img
                src={data.image}
                alt={data.title}
                className="w-full h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] object-cover rounded-t-2xl hover:scale-105 transition-transform duration-500"
            />
            </div>
            <div className="p-4 sm:p-5 space-y-2">
            <p className="text-xs sm:text-sm text-gray-500">{data.published}</p>
            <p className="font-bold text-sm sm:text-base line-clamp-1">{data.title}</p>
            <p className="line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{data.subtitle}</p>
            </div>
        </div>
        ))}
    </div>
    </div>

  );
};

export default Blogs;
