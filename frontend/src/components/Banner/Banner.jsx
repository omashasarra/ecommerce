import React from 'react';

const Banner = ({ data }) => {
  return (
    <div className="min-h-[550px] flex justify-center items-center py-12">
      <div className="container px-4 mx-auto">
        <div
          style={{ backgroundColor: data.bgColor }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-white rounded-3xl"
        >
          {/* First Column */}
          <div className="p-4 sm:p-6 md:p-8 text-center md:text-left">
            <p data-aos="slide-right" className="text-sm">{data.discount}</p>
            <h1 data-aos="zoom-out" className="uppercase text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold">
              {data.title}
            </h1>
            <p data-aos="fade-up" className="text-sm">{data.date}</p>
          </div>

          {/* Second Column */}
          <div data-aos="zoom-in" className="h-full flex items-center justify-center md:justify-center">
            <img
              src={data.image}
              alt=""
              className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-[250px] scale-110 md:scale-125 mx-auto drop-shadow-2xl object-cover"
            />
          </div>

          {/* Third Column */}
          <div className="flex flex-col justify-center gap-4 p-4 sm:p-6 md:p-8 text-center md:text-left">
            <p data-aos="zoom-out" className="font-bold text-lg sm:text-xl">{data.title2}</p>
            <p data-aos="fade-up" className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">{data.title3}</p>
            <p data-aos="fade-up" className="text-sm sm:text-base tracking-wide leading-5">{data.title4}</p>
            <div 
            data-aos="fade-up" data-aos-offset="0"
            className="flex justify-center md:justify-start">
              <button
                style={{ color: data.bgColor }}
                className="bg-white py-2 px-4 rounded-full text-sm sm:text-base"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
