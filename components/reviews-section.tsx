import Image from "next/image"

const reviews = [
  {
    name: "Sarah Mitchell",
    session: "Hatha Yoga",
    location: "Glasgow",
    review:
      "Aulona's classes have transformed my relationship with my body and mind. Her gentle guidance and deep wisdom create such a safe space for growth.",
    image: "/placeholder-c5nf6.png",
  },
  {
    name: "James Robertson",
    session: "Sound Therapy",
    location: "Glasgow",
    review: "The sound healing sessions are absolutely magical. I leave feeling completely renewed and centered.",
    image: "/placeholder-gn3js.png",
  },
  {
    name: "Emma Thompson",
    session: "Vinyasa Flow",
    location: "Glasgow",
    review: "Every class is a journey of self-discovery. Aulona's teaching style is both challenging and nurturing.",
    image: "/placeholder-khe2j.png",
  },
  {
    name: "Michael Chen",
    session: "Corporate Session",
    location: "Glasgow",
    review: "Our team's stress levels have significantly decreased since starting regular sessions with Aulona.",
    image: "/placeholder-x1j66.png",
  },
  {
    name: "Lisa Anderson",
    session: "Wellness Workshop",
    location: "Glasgow",
    review: "The mindfulness techniques I learned have become essential tools in my daily life.",
    image: "/placeholder-tp4ep.png",
  },
  {
    name: "David Wilson",
    session: "Private Session",
    location: "Glasgow",
    review: "Personalized attention helped me overcome physical limitations I thought were permanent.",
    image: "/placeholder-69c58.png",
  },
  {
    name: "Rachel Green",
    session: "Sound Bath",
    location: "Glasgow",
    review: "Pure bliss. These sessions have become my monthly reset ritual.",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Tom Bradley",
    session: "Beginner Yoga",
    location: "Glasgow",
    review: "As a complete beginner, I felt welcomed and supported from day one.",
    image: "/placeholder.svg?height=60&width=60",
  },
]

export function ReviewsSection() {
  return (
    <section className="py-20 px-8 md:px-16 brand-bg-cream">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="headline-text text-4xl md:text-5xl font-bold">What Our Clients Love</h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
          {/* Row 1 */}
          {/* Column 1 - 60% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={reviews[0].image || "/placeholder.svg"}
                alt={reviews[0].name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h3 className="headline-text text-lg font-semibold">{reviews[0].name}</h3>
            </div>
            <p className="text-black text-sm leading-relaxed mb-4 flex-1">{reviews[0].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[0].session}</p>
              <p>{reviews[0].location}</p>
            </div>
          </div>

          {/* Columns 2+3 - 50% height, spans 2 columns */}
          <div className="col-span-2 brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={reviews[1].image || "/placeholder.svg"}
                alt={reviews[1].name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h3 className="headline-text text-lg font-semibold">{reviews[1].name}</h3>
            </div>
            <p className="text-black text-sm leading-relaxed mb-4 flex-1">{reviews[1].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[1].session}</p>
              <p>{reviews[1].location}</p>
            </div>
          </div>

          {/* Column 4 - 60% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={reviews[2].image || "/placeholder.svg"}
                alt={reviews[2].name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h3 className="headline-text text-lg font-semibold">{reviews[2].name}</h3>
            </div>
            <p className="text-black text-sm leading-relaxed mb-4 flex-1">{reviews[2].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[2].session}</p>
              <p>{reviews[2].location}</p>
            </div>
          </div>

          {/* Row 2 */}
          {/* Column 1 - 40% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={reviews[3].image || "/placeholder.svg"}
                alt={reviews[3].name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="headline-text text-base font-semibold">{reviews[3].name}</h3>
            </div>
            <p className="text-black text-xs leading-relaxed mb-3 flex-1">{reviews[3].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[3].session}</p>
              <p>{reviews[3].location}</p>
            </div>
          </div>

          {/* Column 2 - 50% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={reviews[4].image || "/placeholder.svg"}
                alt={reviews[4].name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h3 className="headline-text text-lg font-semibold">{reviews[4].name}</h3>
            </div>
            <p className="text-black text-sm leading-relaxed mb-4 flex-1">{reviews[4].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[4].session}</p>
              <p>{reviews[4].location}</p>
            </div>
          </div>

          {/* Column 3 - 50% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={reviews[5].image || "/placeholder.svg"}
                alt={reviews[5].name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <h3 className="headline-text text-lg font-semibold">{reviews[5].name}</h3>
            </div>
            <p className="text-black text-sm leading-relaxed mb-4 flex-1">{reviews[5].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[5].session}</p>
              <p>{reviews[5].location}</p>
            </div>
          </div>

          {/* Column 4 - 40% height */}
          <div className="brand-bg-beige rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={reviews[6].image || "/placeholder.svg"}
                alt={reviews[6].name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="headline-text text-base font-semibold">{reviews[6].name}</h3>
            </div>
            <p className="text-black text-xs leading-relaxed mb-3 flex-1">{reviews[6].review}</p>
            <div className="text-xs paragraph-text">
              <p>{reviews[6].session}</p>
              <p>{reviews[6].location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
