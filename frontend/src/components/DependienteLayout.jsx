import React from 'react';
import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';
import Header from './Header';
import './SideMenu.css';

const DependienteLayout = () => {
  return (
    <>
      <Header />
      <SideMenu />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
};

export default DependienteLayout;