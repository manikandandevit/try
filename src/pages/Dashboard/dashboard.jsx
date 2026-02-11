import CardSection from "./cardSection";
import DashboardCharts from "./chartSection";
import RecentDetails from "./recentDetails";

const Dashboard = () => {
  return (
    <div className="w-full flex flex-col gap-4">


      <CardSection />

      <DashboardCharts />

      <RecentDetails />  

    </div>
  );
};

export default Dashboard;
