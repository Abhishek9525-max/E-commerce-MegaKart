import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import React, { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom';
import axios from "axios";
import { getProductPricing } from "../../utils/productPricing";

const NewArrivals = () => {
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [canScrollLeft ,setCanScrollLeft] = useState(false)
  
  const [ newArrivals, setNewArrivals]= useState([]);

  useEffect(()=>{
    const fetchNewArrivals = async ()=>{
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        ); 
        setNewArrivals(response.data)
      } catch (error) {
        console.log(error)
      }
    };
    fetchNewArrivals();
  },[])

  const handleMouseDown = (e)=>{
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove= (e)=>{
    if(!isDragging) return;
    const x =e.pageX - scrollRef.current.offsetLeft;
    const walk = x-startX;
    scrollRef.current.scrollLeft= scrollLeft-walk;
  }

  const handleMouseUpOrLeave = ()=>{
    setIsDragging(false)
  }

  const scroll = (direction)=>{
    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({left: scrollAmount, behaviour: 'smooth'});
  }


  // update scroll buttons
  const updateScrollButtons =()=>{
    const container = scrollRef.current;

    if(container){
      const leftScroll= container.scrollLeft;
      const rightScrollable = 
      container.scrollWidth > leftScroll + container.clientWidth;

      setCanScrollLeft(leftScroll>0);
      setCanScrollRight(rightScrollable);
    }


    // console.log({
    //   scrollLeft: container.scrollLeft,
    //   clientWidth: container.clientWidth,
    //   containerScrollWidth: container.scrollWidth,
    // });
    
  }

  useEffect(()=>{
    const container = scrollRef.current;
    if(container){
      container.addEventListener('scroll', updateScrollButtons)
      updateScrollButtons();
      return ()=> container.removeEventListener('scroll',updateScrollButtons);
    }
  },[newArrivals]);

  return (
    <section id="new-arrivals" className='px-4 py-16 lg:px-0 lg:py-20'>
      <div className='container relative mx-auto mb-10 text-center'>
        <p className='luxury-eyebrow mb-2 text-[#A94F38]'>Fresh from the atelier</p>
        <h2 className='mb-4 text-4xl sm:text-5xl'>
          Explore New Arrivals
        </h2>
        <p className='mx-auto max-w-2xl text-sm leading-6 text-[#77746D]'>Discover the latest styles, thoughtfully selected to bring a considered touch to your everyday wardrobe.</p>

        {/* Scroll Button  */}
        <div className='absolute right-0 bottom-[-30px] flex space-x-2'>
          <button 
          onClick={()=> scroll('left')}
          disabled={!canScrollLeft}
          className={`p-2 rounded  ${canScrollLeft ? 'bg-white text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            <FiChevronLeft className="text-2xl" />
          </button>
          <button 
          onClick={()=> scroll('right')}
          className={`p-2 rounded  ${canScrollRight ? 'bg-white text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            <FiChevronRight className="text-2xl" />
          </button>

        </div>
      </div>

      {/* scrollable content  */}
      <div 
      ref={scrollRef}
      className={`container mx-auto overflow-x-scroll flex space-x-6 relative  ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      >
        {newArrivals.map((product) => {
          const pricing = getProductPricing(product);
          return (
          <div key={product._id} className='relative min-w-[100%] overflow-hidden sm:min-w-[50%] lg:min-w-[30%]'>
            <img 
            src={product.images[0]?.url}
              alt={product.images[0]?.altText || product.name}
              className='h-[420px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-[500px]'
              draggable= 'false'
            />
            {pricing.hasDiscount && (
              <span className='absolute left-4 top-4 bg-[#A94F38] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white'>
                {pricing.discountPercent}% off
              </span>
            )}
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#171714]/85 via-[#171714]/55 to-transparent p-5 pt-16 text-white'>
              <Link to={`/product/${product._id}`} className='block'>
              <h4 className='font-medium'>{product.name}</h4>
              <p className='mt-1 flex items-baseline gap-2'>
                <span>${pricing.price.toFixed(2)}</span>
                {pricing.originalPrice && (
                  <span className='text-sm text-white/70 line-through'>
                    ${pricing.originalPrice.toFixed(2)}
                  </span>
                )}
              </p>
              </Link>

            </div>
          </div>
          );
        })}
      </div>
    </section>
  )
}

export default NewArrivals