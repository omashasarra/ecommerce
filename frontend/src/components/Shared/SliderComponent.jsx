import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import Button from "./Button";

export default function SliderComponent({ data, handleOrderPopup }) {
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      speed={800}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      allowTouchMove
    >
      {data.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* text content */}
            <div className="flex flex-col justify-center gap-4 sm:pl-3 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1">
              <h1
                data-aos="zoom-out"
                data-aos-duration="500"
                data-aos-once="true"
                className="text-2xl sm:text-6xl lg:text-2xl font-bold"
              >
                {item.subtitle}
              </h1>

              <h1
                data-aos="zoom-out"
                data-aos-duration="500"
                data-aos-once="true"
                className="text-5xl sm:text-6xl lg:text-7xl font-bold"
              >
                {item.title}
              </h1>

              <h1
                data-aos="zoom-out"
                data-aos-duration="500"
                data-aos-once="true"
                className="text-5xl uppercase text-white dark:text-white/5 sm:text-[80px] md:text-[100px] xl:text-[150px] font-bold"
              >
                {item.title2}
              </h1>

              <div
                data-aos="fade-up"
                data-aos-offset="0"
                data-aos-duration="500"
                data-aos-delay="300"
              >
                <Button
                  text="Shop By Category"
                  bgColor="bg-primary"
                  textColor="text-white"
                  handler={handleOrderPopup}
                />
              </div>
            </div>

            {/* image */}
            <div className="order-1 sm:order-2 relative z-10">
              <div data-aos="zoom-in" data-aos-once="true" className="relative z-10">
                <img
                  src={item.img}
                  alt=""
                  className="w-[300px] h-[300px] sm:h-[450px] sm:scale-105 lg:scale-110 object-contain mx-auto drop-shadow-[-8px_4px_6px_rgb(0,0,0,.4)] relative z-40"
                />
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
