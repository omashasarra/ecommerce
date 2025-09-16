import React from "react";

function resolveImage(image) {
  if (!image) return "";

  if (image.startsWith("blob:")) return image;

  if (/^https?:\/\//i.test(image)) return image;

  if (image.startsWith("/banner/")) return image;

  if (image.startsWith("/")) return image;

  if (image.includes("/")) return `/banner/${image.split("/").pop()}`;
  return `/banner/${image}`;
}


export default function Banner({ data = {} }) {
  const {
    discount = "",
    title = "",
    date = "",
    image = "",
    title2 = "",
    title3 = "",
    title4 = "",
    bgColor = "#000000",
  } = data;

  const imageSrc = resolveImage(image);

  return (
    <div className="min-h-[550px] flex justify-center items-center py-12">
      <div className="container px-4 mx-auto">
        <div
          style={{ backgroundColor: bgColor }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-white rounded-3xl"
        >
          <div className="p-4 sm:p-6 md:p-8 text-center md:text-left">
            {discount && <p className="text-sm">{discount}</p>}
            {title && (
              <h1 className="uppercase text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold">
                {title}
              </h1>
            )}
            {date && <p className="text-sm">{date}</p>}
          </div>

          <div className="h-full flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={title || "Banner image"}
                className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-[250px] scale-110 md:scale-125 mx-auto drop-shadow-2xl object-contain"
                draggable="false"
                loading="lazy"
              />
            ) : (
              <div className="w-[250px] h-[250px] mx-auto bg-white/10 rounded-2xl" />
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 p-4 sm:p-6 md:p-8 text-center md:text-left">
            {title2 && <p className="font-bold text-lg sm:text-xl">{title2}</p>}
            {title3 && <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">{title3}</p>}
            {title4 && <p className="text-sm sm:text-base tracking-wide leading-5">{title4}</p>}
            <div className="flex justify-center md:justify-start">
              <button style={{ color: bgColor }} className="bg-white py-2 px-4 rounded-full text-sm sm:text-base">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
