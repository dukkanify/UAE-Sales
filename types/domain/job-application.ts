export type JobApplication = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  currentCity: string;
  yearsOfExperience: number;
  availabilityDate: string;
  coverMessage: string;
  cvFileName: string;
  employerId: string;
  employerName: string;
  status: "submitted" | "reviewed";
  createdAt: string;
};
