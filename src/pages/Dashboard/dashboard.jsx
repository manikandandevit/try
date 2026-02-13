import CardSection from "./cardSection";
import DashboardCharts from "./chartSection";
import RecentDetails from "./recentDetails";

const Dashboard = () => {
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4 md:gap-6">


      <CardSection />

      <DashboardCharts />

      <RecentDetails />  

    </div>
  );
};

export default Dashboard;
