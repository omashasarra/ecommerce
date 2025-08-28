import Image1 from "../../assets/hero/headphone.png";
import Image2 from "../../assets/category/vr.png";
import Image3 from "../../assets/category/macbook.png";

import SliderComponent from '../Shared/SliderComponent';


const HeroData = [
  {
    id: 1,
    img: Image1,
    subtitle: "Beats Solo",
    title: "Wireless",
    title2: "Headphone",
  },
  {
    id: 2,
    img: Image2,
    subtitle: "Beats Solo",
    title: "Wireless",
    title2: "Virtual",
  },
  {
    id: 3,
    img: Image3,
    subtitle: "Beats Solo",
    title: "Branded",
    title2: "Laptops",
  }
]

const Hero = ({ handleOrderPopup }) => {

  return (
    <div className='container'>
      <div className='overflow-hidden rounded-3xl min-h-[550px]
        sm:min-h-[650px] hero-bg-color flex justify-center items-center'>
        <div className='container pb-8 sm:pb-0'>
          {/* Hero section  */}
          <SliderComponent data={HeroData} handleOrderPopup={handleOrderPopup} />
        </div >
      </div >
    </div >
  )
}

export default Hero