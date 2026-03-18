import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIChatBox from '../ai/AIChatBox';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main className="mx-auto w-full">
         <Outlet />
      </main>
      <AIChatBox />
    </div>
  );
};

export default Layout;
