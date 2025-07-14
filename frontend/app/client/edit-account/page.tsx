import { EditAccountPage } from "@/components/edit-account-page";
import { getUserProfileService } from "@/services/client/get-user-profile-by-id";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

export default async function EditAccountPageRoute() {
  const queryClient = new QueryClient();

  // Prefetch user profile
  await queryClient.prefetchQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfileService,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditAccountPage />
    </HydrationBoundary>
  );
}
