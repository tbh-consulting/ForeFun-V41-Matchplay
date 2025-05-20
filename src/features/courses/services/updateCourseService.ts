export async function updateCourse(courseId: string, data: CourseFormData): Promise<void> {
  const { error: courseError } = await supabase
    .from('courses')
    .update({
      name: data.course.name,
      address: data.course.address,
      country: data.course.country,
      description: data.course.description,
      holes: data.course.holes,
      image_url: data.course.imageUrl,
      dog_policy: data.course.dogPolicy, // Ensure this is included
      updated_at: new Date().toISOString()
    })
    .eq('id', courseId);

  if (courseError) throw courseError;
  
  // Rest of the function remains unchanged...
}