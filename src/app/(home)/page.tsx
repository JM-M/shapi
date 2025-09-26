import { HomeView } from "@/modules/home/ui/views/home-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Shapi - Your OpenAPI/Swagger API management tool. Get started with managing, testing, and documenting your APIs.",
};

const HomePage = () => {
  return <HomeView />;
};
export default HomePage;
