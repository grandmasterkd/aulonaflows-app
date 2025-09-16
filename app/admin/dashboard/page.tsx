import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Get next upcoming class
  const { data: nextClass } = await supabase
    .from("yoga_classes")
    .select(`
      *,
      class_types(name, description),
      instructors(first_name, last_name)
    `)
    .gte("date_time", new Date().toISOString())
    .eq("status", "active")
    .order("date_time", { ascending: true })
    .limit(1)
    .single()

  // Get upcoming classes for tiles
  const { data: upcomingClasses } = await supabase
    .from("yoga_classes")
    .select(`
      *,
      class_types(name, description),
      instructors(first_name, last_name)
    `)
    .gte("date_time", new Date().toISOString())
    .eq("status", "active")
    .order("date_time", { ascending: true })
    .limit(8)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const adminName = user.user_metadata?.first_name || user.email?.split("@")[0] || "Admin"

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Greetings {adminName}</h1>
        <span className="text-3xl">👋</span>
      </div>

      {/* Next Session Hero */}
      {nextClass && (
        <div
          className="relative h-[400px] rounded-lg overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${nextClass.image_url || "/yoga-class-hero-image.jpg"})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 text-white space-y-2">
            <h2 className="text-2xl font-bold">{nextClass.title}</h2>
            <p className="text-lg opacity-90">{formatDate(nextClass.date_time)}</p>
            <p className="text-base opacity-80">{nextClass.location}</p>
            <p className="text-base opacity-80">
              {nextClass.current_bookings}/{nextClass.max_capacity} booked
            </p>
            <p className="text-base opacity-80">
              Instructor: {nextClass.instructors?.first_name} {nextClass.instructors?.last_name}
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Sessions Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingClasses?.map((yogaClass) => (
            <Card key={yogaClass.id} className="overflow-hidden">
              <div
                className="h-32 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${yogaClass.image_url || "/yoga-class-thumbnail.jpg"})`,
                }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-2 left-2 text-white">
                  <h3 className="font-semibold text-sm">{yogaClass.title}</h3>
                  <p className="text-xs opacity-90">
                    {new Date(yogaClass.date_time).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{yogaClass.location}</p>
                <p className="text-sm text-gray-600">
                  {yogaClass.current_bookings}/{yogaClass.max_capacity} booked
                </p>
                <p className="text-sm font-semibold text-[#654625]">£{yogaClass.price}</p>
                <p className="text-xs text-gray-500">
                  {yogaClass.instructors?.first_name} {yogaClass.instructors?.last_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
