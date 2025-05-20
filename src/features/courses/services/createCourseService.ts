export async function createCourse(data: CourseFormData): Promise<string> {
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .insert({
      name: data.course.name,
      address: data.course.address,
      country: data.course.country,
      description: data.course.description,
      holes: data.course.holes,
      image_url: data.course.imageUrl,
      dog_policy: data.course.dogPolicy // Ensure this is included
    })
    .select('id')
    .single();

  if (courseError) throw courseError;
  
  // Rest of the function remains unchanged...
  return courseData.id;
}